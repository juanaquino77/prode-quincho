import { createClient } from 'jsr:@supabase/supabase-js@2'

const MP_API = 'https://api.mercadopago.com'
const APP_URL = 'https://prode-quincho.vercel.app'
const SUPABASE_REF = 'ueecbkteyzgjilaindwj'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'No autorizado' }, 401)

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) return json({ error: 'No autorizado' }, 401)

    const { tournament_id } = await req.json()
    if (!tournament_id) return json({ error: 'tournament_id requerido' }, 400)

    // Obtener torneo
    const { data: tournament, error: tErr } = await supabase
      .from('tournaments')
      .select('id, name, entry_fee')
      .eq('id', tournament_id)
      .single()
    if (tErr || !tournament) return json({ error: 'Torneo no encontrado' }, 404)
    if (!tournament.entry_fee || tournament.entry_fee <= 0) {
      return json({ error: 'Este torneo es gratuito' }, 400)
    }

    // Verificar que el usuario es miembro y no pagó
    const { data: member, error: mErr } = await supabase
      .from('tournament_members')
      .select('paid')
      .eq('tournament_id', tournament_id)
      .eq('user_id', user.id)
      .single()
    if (mErr || !member) return json({ error: 'No sos miembro de este torneo' }, 403)
    if (member.paid) return json({ error: 'Ya pagaste este torneo' }, 400)

    // Crear preferencia en MercadoPago
    const preference = {
      items: [{
        title: `Entrada - ${tournament.name}`,
        quantity: 1,
        unit_price: Number(tournament.entry_fee),
        currency_id: 'ARS',
      }],
      payer: { email: user.email },
      back_urls: {
        success: `${APP_URL}/payment/success`,
        failure: `${APP_URL}/payment/failure`,
        pending: `${APP_URL}/payment/pending`,
      },
      auto_return: 'approved',
      notification_url: `https://${SUPABASE_REF}.supabase.co/functions/v1/mp-webhook`,
      external_reference: `${tournament_id}:${user.id}`,
    }

    const mpRes = await fetch(`${MP_API}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    })

    if (!mpRes.ok) {
      const err = await mpRes.text()
      console.error('MP error:', err)
      return json({ error: 'Error al crear preferencia de pago' }, 500)
    }

    const mpData = await mpRes.json()

    // Guardar registro de pago pendiente
    await supabase.from('payments').upsert({
      user_id: user.id,
      tournament_id,
      mp_preference_id: mpData.id,
      amount: tournament.entry_fee,
      status: 'pending',
    }, { onConflict: 'user_id,tournament_id' })

    return json({
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point,
    })
  } catch (err) {
    console.error(err)
    return json({ error: 'Error interno' }, 500)
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}
