-- Reset paid = false para todos los miembros del torneo global
-- Bug: usuarios que se unieron via invite code cuando entry_fee era 0
-- quedaron con paid = true. Solo MP webhook puede marcar paid = true.
UPDATE tournament_members tm
SET paid = false
FROM tournaments t
WHERE tm.tournament_id = t.id
  AND t.type = 'global';
