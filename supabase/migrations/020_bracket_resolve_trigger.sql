-- ============================================================
-- PRODE QUINCHO - Migration 020
-- Trigger: cuando un partido de eliminatorias tiene resultado,
-- actualiza los placeholders "Gan. X o Y" en los partidos siguientes.
-- ============================================================

CREATE OR REPLACE FUNCTION public.resolve_bracket_after_match()
RETURNS trigger AS $$
DECLARE
  winner_team text;
  winner_flag text;
  r           record;
  part_a      text;
  part_b      text;
BEGIN
  -- Solo actuar cuando hay resultado
  IF NEW.home_score IS NULL OR NEW.away_score IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determinar ganador
  IF NEW.home_score > NEW.away_score
     OR (NEW.home_score = NEW.away_score AND NEW.penalty_winner = 'home') THEN
    winner_team := NEW.home_team;
    winner_flag := NEW.home_flag;
  ELSE
    winner_team := NEW.away_team;
    winner_flag := NEW.away_flag;
  END IF;

  -- Buscar partidos de la misma competencia con placeholders "Gan. X o Y"
  FOR r IN
    SELECT id, home_team, away_team
    FROM public.matches
    WHERE competition = NEW.competition AND id <> NEW.id
  LOOP
    -- Revisar home_team
    IF r.home_team LIKE 'Gan. % o %' THEN
      part_a := trim(split_part(substring(r.home_team FROM 6), ' o ', 1));
      part_b := trim(split_part(substring(r.home_team FROM 6), ' o ', 2));
      IF (NEW.home_team ILIKE '%' || part_a || '%' OR NEW.away_team ILIKE '%' || part_a || '%')
         AND (NEW.home_team ILIKE '%' || part_b || '%' OR NEW.away_team ILIKE '%' || part_b || '%') THEN
        UPDATE public.matches SET home_team = winner_team, home_flag = winner_flag WHERE id = r.id;
      END IF;
    END IF;

    -- Revisar away_team
    IF r.away_team LIKE 'Gan. % o %' THEN
      part_a := trim(split_part(substring(r.away_team FROM 6), ' o ', 1));
      part_b := trim(split_part(substring(r.away_team FROM 6), ' o ', 2));
      IF (NEW.home_team ILIKE '%' || part_a || '%' OR NEW.away_team ILIKE '%' || part_a || '%')
         AND (NEW.home_team ILIKE '%' || part_b || '%' OR NEW.away_team ILIKE '%' || part_b || '%') THEN
        UPDATE public.matches SET away_team = winner_team, away_flag = winner_flag WHERE id = r.id;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger: se dispara cuando cambian scores, status o penalty_winner
DROP TRIGGER IF EXISTS resolve_bracket_trigger ON public.matches;
CREATE TRIGGER resolve_bracket_trigger
  AFTER UPDATE ON public.matches
  FOR EACH ROW
  WHEN (
    NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL AND (
      OLD.home_score IS DISTINCT FROM NEW.home_score OR
      OLD.away_score IS DISTINCT FROM NEW.away_score OR
      OLD.penalty_winner IS DISTINCT FROM NEW.penalty_winner OR
      OLD.status IS DISTINCT FROM NEW.status
    )
  )
  EXECUTE FUNCTION public.resolve_bracket_after_match();
