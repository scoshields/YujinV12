-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_partner_stats(UUID);

-- Create function to get partner workout stats with proper workout completion check
CREATE OR REPLACE FUNCTION get_partner_stats(partner_id UUID)
RETURNS TABLE (
  total_workouts INTEGER,
  completed_workouts INTEGER,
  total_weight DECIMAL,
  completion_rate INTEGER
) AS $$
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
$$ LANGUAGE plpgsql;