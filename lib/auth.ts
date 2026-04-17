import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type Profile = {
  user_id: string;
  role: 'clinic' | 'internal';
  clinic_id: string | null;
  /** Full display name; null if not set (supports future multi-user clinics) */
  full_name?: string | null;
  /** e.g. "Practice Manager", "Staff", "Support Team"; null if not set */
  position?: string | null;
};

export type UserWithProfile = {
  user_id: string;
  email?: string;
  profile: Profile;
};

export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserWithProfile(): Promise<UserWithProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, role, clinic_id, full_name, position')
    .eq('user_id', user.id)
    .single();

  if (!profile) return null;

  return {
    user_id: user.id,
    email: user.email,
    profile: profile as Profile,
  };
}

export async function requireAuth(): Promise<UserWithProfile> {
  const user = await getUserWithProfile();
  if (!user) redirect('/login');
  return user;
}

export async function requireClinic(): Promise<UserWithProfile> {
  const user = await requireAuth();
  if (user.profile.role !== 'clinic') redirect('/internal/tickets');
  return user;
}

export async function requireInternal(): Promise<UserWithProfile> {
  const user = await requireAuth();
  if (user.profile.role !== 'internal') redirect('/clinic/tickets');
  return user;
}

/** Returns true if the internal user can assign tickets (e.g. Manager role). */
export function canAssignTickets(
  profile: Pick<Profile, 'role' | 'position'>
): boolean {
  const pos = profile.position?.toLowerCase().trim();
  return profile.role === 'internal' && pos === 'manager';
}
