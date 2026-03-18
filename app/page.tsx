import { redirect } from 'next/navigation';
import { getUserWithProfile } from '@/lib/auth';

export default async function HomePage() {
  const user = await getUserWithProfile();

  if (!user) {
    redirect('/login');
  }

  if (user.profile.role === 'clinic') {
    redirect('/clinic/tickets');
  }

  redirect('/internal/tickets');
}
