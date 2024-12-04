import { supabase } from '../lib/supabase';

export async function searchUsers(query: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('users')
    .select('id, name, username')
    .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
    .neq('id', user.id) 
    .limit(10);

  if (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search users');
  }
  
  // Filter out existing partners/invites in memory to avoid complex SQL
  const { data: partnerships } = await supabase
    .from('workout_partners')
    .select('user_id, partner_id, status')
    .or(`user_id.eq.${user.id},partner_id.eq.${user.id}`)
    .in('status', ['pending', 'accepted']);

  const existingPartnerIds = new Set(
    (partnerships || []).flatMap(p => [p.user_id, p.partner_id])
  );

  return (data || []).filter(u => !existingPartnerIds.has(u.id));
}

export async function sendPartnerInvite(partnerId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('workout_partners')
    .insert({
      user_id: user.id,
      partner_id: partnerId,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPartners() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data: partnerships, error: partnershipsError } = await supabase
    .from('workout_partners')
    .select(`
      id,
      status,
      created_at,
      is_favorite,
      partner:users!workout_partners_partner_id_fkey (
        id, name, username
      ),
      user:users!workout_partners_user_id_fkey (
        id, name, username
      )
    `)
    .or(`user_id.eq.${user.id},partner_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (partnershipsError) {
    console.error('Error fetching partnerships:', partnershipsError);
    return { sent: [], received: [] };
  }
  
  // Split partnerships into sent and received
  const sent = partnerships?.filter(p => p.user?.id === user.id).map(p => ({
    id: p.id,
    status: p.status,
    created_at: p.created_at,
    is_favorite: p.is_favorite,
    partner: p.partner,
    user: p.user
  })) || [];
  
  const received = partnerships?.filter(p => p.partner?.id === user.id).map(p => ({
    id: p.id,
    status: p.status,
    created_at: p.created_at,
    is_favorite: p.is_favorite,
    user: p.user,
    partner: p.partner
  })) || [];

  return { sent, received };
}

export async function respondToInvite(inviteId: string, status: 'accepted' | 'rejected') {
  const { error } = await supabase
    .from('workout_partners')
    .update({ status })
    .eq('id', inviteId);

  if (error) throw error;
}

export async function cancelInvite(inviteId: string) {
  const { error } = await supabase
    .from('workout_partners')
    .delete()
    .eq('id', inviteId);

  if (error) throw error;
}

export async function getPartnerStats(partnerId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  try {
    const { data: partnerData, error: partnerError } = await supabase
      .from('users')
      .select('id, name, username')
      .eq('id', partnerId)
      .single();

    if (partnerError) throw partnerError;
    if (!partnerData) throw new Error('Partner not found');

    const { data: partnershipData } = await supabase
      .from('workout_partners')
      .select('is_favorite')
      .eq('partner_id', partnerId)
      .eq('status', 'accepted')
      .single();

    // Get partner's stats
    const { data: stats, error } = await supabase
      .rpc('get_partner_stats', { partner_id: partnerId });

    if (error) throw error;

    const partnerStats = stats?.[0] || {
      total_workouts: 0,
      completed_workouts: 0,
      total_weight: 0,
      completion_rate: 0
    };

    // Get partner's workouts for display
    const { data: workouts } = await supabase
      .from('daily_workouts')
      .select(`
        id, title, date, duration, difficulty, completed,
        workout_exercises (
          id, name, target_sets, target_reps,
          exercise_sets (id, weight, reps, completed)
        )
      `)
      .eq('user_id', partnerId)
      .gte('date', new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: false });

    return {
      name: partnerData.name,
      username: partnerData.username,
      isFavorite: partnershipData?.is_favorite || false,
      weeklyWorkouts: partnerStats.total_workouts,
      completedWorkouts: partnerStats.completed_workouts,
      totalWeight: partnerStats.total_weight,
      completionRate: partnerStats.completion_rate,
      streak: partnerStats.completed_workouts,
      userProgress: [],
      workouts: workouts || []
    };
  } catch (error) {
    console.error('Error in getPartnerStats:', error);
    throw error;
  }
}

function calculateStreak(workouts: any[]): number {
  if (!workouts?.length) return 0;
  
  let streak = 0;
  const sortedWorkouts = workouts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Count consecutive days with completed workouts
  let currentDate = new Date(sortedWorkouts[0].date).toDateString();
  let hasCompletedWorkout = false;
  
  for (const workout of sortedWorkouts) {
    const workoutDate = new Date(workout.date).toDateString();
    if (workoutDate === currentDate) {
      hasCompletedWorkout = workout.completed;
    } else {
      if (!hasCompletedWorkout) break;
      streak++;
      currentDate = workoutDate;
      hasCompletedWorkout = workout.completed;
    }
  }
  
  return streak + (hasCompletedWorkout ? 1 : 0);
}

export async function toggleFavoritePartner(partnerId: string, isFavorite: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('workout_partners')
    .update({ is_favorite: isFavorite })
    .eq('user_id', user.id)
    .eq('partner_id', partnerId)
    .eq('status', 'accepted');

  if (error) throw error;
}