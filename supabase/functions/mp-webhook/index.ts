import { createClient } from 'jsr:@supabase/supabase-js@2'

const MP_API = 'https://api.mercadopago.com'

Deno.serve(async (req) => {
  // MP envía tanto GET (IPN) como POST (webhook) — siempre responder 200
  if (req.method === 'GET') {
    return new Response('OK', { status: 200 })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const body = await req.json().catch(() => ({}))
    const { type, data } = body

    // MP envía topic=payment o type=payment
    const paymentId = data?.id || body.id
    if (!paymentId || (type !== 'payment' && body.topic !== 'payment')) {
      return new Response('OK', { status: 200 })
    }

    // Consultar el estado del pago a MP
    const mpRes = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}`,
      },
    })

    if (!mpRes.ok) {
      console.error('No se pudo consultar el pago:', paymentId)
      return new Response('OK', { status: 200 })
    }

    const payment = await mpRes.json()
    const { status, external_reference } = payment

    if (!external_reference) {
      console.error('Sin external_reference en pago:', paymentId)
      return new Response('OK', { status: 200 })
    }

    const [tournament_id, user_id] = external_reference.split(':')
    if (!tournament_id || !user_id) {
      console.error('external_reference inválido:', external_reference)
      return new Response('OK', { status: 200 })
    }

    const dbStatus = mapStatus(status)

    // Actualizar registro en payments
    await supabase
      .from('payments')
      .update({
        mp_payment_id: String(paymentId),
        status: dbStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user_id)
      .eq('tournament_id', tournament_id)

    // Si aprobado, marcar al usuario como pagado
    if (dbStatus === 'approved') {
      await supabase
        .from('tournament_members')
        .update({ paid: true })
        .eq('tournament_id', tournament_id)
        .eq('user_id', user_id)
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    // Siempre 200 para que MP no reintente en bucle
    return new Response('OK', { status: 200 })
  }
})

function mapStatus(mpStatus: string): string {
  switch (mpStatus) {
    case 'approved': return 'approved'
    case 'rejected': return 'rejected'
    case 'cancelled': return 'cancelled'
    default: return 'pending'
  }
}
