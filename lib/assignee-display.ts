import { createServiceClient } from '@/lib/supabase/service';

/**
 * Resolve assignee display names for tickets.assigned_to (auth.users.id).
 * App-level join: tickets.assigned_to = profiles.user_id.
 * Uses service role so we can fetch any profile.
 */
export async function resolveAssigneeDisplayMap(
  assignedToUserIds: (string | null | undefined)[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const ids = [...new Set(assignedToUserIds.filter(Boolean))] as string[];
  if (ids.length === 0) return map;

  const service = createServiceClient();
  const { data: profiles } = await service
    .from('profiles')
    .select('user_id, full_name')
    .in('user_id', ids);

  for (const p of profiles || []) {
    map.set(p.user_id, p.full_name?.trim() || 'Unknown');
  }
  return map;
}
