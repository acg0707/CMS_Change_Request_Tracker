import { requireInternal } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import NotificationsList from '@/components/notifications-list';

export default async function InternalNotificationsPage() {
  await requireInternal();
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, clinic_id, ticket_id, recipient_role, recipient_clinic_id, actor_user_id, actor_label, type, message, is_read, created_at')
    .eq('recipient_role', 'internal')
    .order('created_at', { ascending: false });

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Notifications</h1>
      <NotificationsList
        notifications={(notifications || []) as import('@/lib/types').Notification[]}
        isInternal={true}
      />
    </div>
  );
}
