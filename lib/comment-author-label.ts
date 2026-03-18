import { createServiceClient } from '@/lib/supabase/service';

/**
 * Display label for a comment author. Same rules everywhere (clinic + internal UI).
 * - internal role → Support Team
 * - clinic role → position (e.g. Practice Manager) or "Clinic"
 */
export function commentAuthorLabelFromProfile(
  role: string,
  position: string | null | undefined
): string {
  if (role === 'internal') return 'Support Team';
  return position?.trim() || 'Clinic';
}

/**
 * Resolve labels for comment author user IDs. Uses service role so clinic sessions
 * can still label internal authors (RLS only allows users to select their own profile).
 */
export async function resolveCommentAuthorLabelMap(
  authorUserIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const ids = [...new Set(authorUserIds.filter(Boolean))];
  if (ids.length === 0) return map;

  const service = createServiceClient();
  const { data: profiles } = await service
    .from('profiles')
    .select('user_id, role, position')
    .in('user_id', ids);

  for (const p of profiles || []) {
    map.set(p.user_id, commentAuthorLabelFromProfile(p.role, p.position));
  }
  return map;
}
