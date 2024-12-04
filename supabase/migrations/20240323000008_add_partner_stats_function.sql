-- Create function to get partner workout stats
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
      COUNT(DISTINCT d.id) as total_workouts,
      COUNT(DISTINCT CASE WHEN d.completed THEN d.id END) as completed_workouts,
      COALESCE(SUM(CASE WHEN es.completed THEN es.weight ELSE 0 END), 0) as total_weight
    FROM daily_workouts d
    LEFT JOIN workout_exercises we ON we.daily_workout_id = d.id
    LEFT JOIN exercise_sets es ON es.exercise_id = we.id
    WHERE d.user_id = partner_id
    AND d.date >= CURRENT_DATE - 7
  )
  SELECT 
    total_workouts,
    completed_workouts,
    total_weight,
    CASE 
      WHEN total_workouts > 0 THEN 
        (completed_workouts * 100 / total_workouts)
      ELSE 0 
    END as completion_rate
  FROM workout_stats;
END;
$$ LANGUAGE plpgsql;