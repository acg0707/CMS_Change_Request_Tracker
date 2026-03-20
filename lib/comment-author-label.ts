import { createServiceClient } from '@/lib/supabase/service';

/**
 * Display label for a comment author. Same rules everywhere (clinic + internal UI).
 * - internal role → Support: [full_name]
 * - clinic role → [position]: [full_name] (e.g. Practice Manager: Jen)
 */
export function commentAuthorLabelFromProfile(
  role: string,
  position: string | null | undefined,
  fullName: string | null | undefined
): string {
  const name = fullName?.trim() || '';
  if (role === 'internal') {
    return name ? `Support: ${name}` : 'Support';
  }
  const pos = position?.trim() || 'Clinic';
  return name ? `${pos}: ${name}` : pos;
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
    .select('user_id, role, position, full_name')
    .in('user_id', ids);

  for (const p of profiles || []) {
    map.set(
      p.user_id,
      commentAuthorLabelFromProfile(p.role, p.position, p.full_name)
    );
  }
  return map;
}
