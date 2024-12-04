-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS check_workout_completion_trigger ON exercise_sets;
DROP FUNCTION IF EXISTS check_workout_completion() CASCADE;
DROP FUNCTION IF EXISTS get_partner_stats(UUID) CASCADE;

-- Create partner stats function
CREATE OR REPLACE FUNCTION get_partner_stats(partner_id UUID)
RETURNS TABLE (
  total_workouts INTEGER,
  completed_workouts INTEGER,
  total_weight DECIMAL,
  completion_rate INTEGER
) AS $func$
BEGIN
  RETURN QUERY
  WITH workout_stats AS (
    SELECT 
      d.id as workout_id,
      d.completed as is_completed,
      COALESCE(SUM(CASE WHEN es.completed AND es.weight > 0 AND es.reps > 0 THEN es.weight ELSE 0 END), 0) as workout_weight
    FROM daily_workouts d
    LEFT JOIN workout_exercises we ON we.daily_workout_id = d.id
    LEFT JOIN exercise_sets es ON es.exercise_id = we.id
    WHERE d.user_id = partner_id
    AND d.date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY d.id, d.completed
  )
  SELECT 
    COUNT(workout_id)::INTEGER as total_workouts,
    COUNT(CASE WHEN is_completed THEN 1 END)::INTEGER as completed_workouts,
    COALESCE(SUM(workout_weight), 0) as total_weight,
    CASE 
      WHEN COUNT(workout_id) > 0 THEN 
        (COUNT(CASE WHEN is_completed THEN 1 END) * 100 / COUNT(workout_id))::INTEGER
      ELSE 0 
    END as completion_rate
  FROM workout_stats;
END;
$func$ LANGUAGE plpgsql;

-- Create workout completion function
CREATE OR REPLACE FUNCTION check_workout_completion()
RETURNS TRIGGER AS $func$
DECLARE
  workout_id UUID;
BEGIN
  -- Get the workout ID for this exercise set
  SELECT d.id INTO workout_id
  FROM workout_exercises we
  JOIN daily_workouts d ON we.daily_workout_id = d.id
  WHERE we.id = NEW.exercise_id;

  -- Update the workout's completion status
  WITH workout_stats AS (
    SELECT 
      COUNT(*) as total_sets,
      COUNT(*) FILTER (WHERE es.completed AND es.weight > 0 AND es.reps > 0) as completed_sets
    FROM workout_exercises we
    JOIN exercise_sets es ON es.exercise_id = we.id
    WHERE we.daily_workout_id = workout_id
  )
  UPDATE daily_workouts
  SET 
    completed = (
      CASE 
        WHEN ws.total_sets > 0 AND ws.total_sets = ws.completed_sets THEN true
        ELSE false
      END
    ),
    updated_at = CURRENT_TIMESTAMP
  FROM workout_stats ws
  WHERE id = workout_id;

  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Create trigger for exercise set updates
CREATE TRIGGER check_workout_completion_trigger
  AFTER INSERT OR UPDATE OF completed, weight, reps ON exercise_sets
  FOR EACH ROW
  EXECUTE FUNCTION check_workout_completion();