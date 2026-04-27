/** Notification record for in-app notifications. */
export type Notification = {
  id: string;
  clinic_id: string | null;
  ticket_id: string | null;
  recipient_role: 'clinic' | 'internal';
  recipient_clinic_id: string | null;
  actor_user_id: string | null;
  actor_label: string | null;
  type: 'ticket_created' | 'status_changed' | 'comment_added' | 'followup_requested';
  message: string;
  is_read: boolean;
  created_at: string;
};

/**
 * Client record with optional address/contact fields (for multi-user client support).
 * All address/contact fields may be null if not yet populated.
 */
export type Clinic = {
  clinic_id: string;
  clinic_name: string;
  base_url?: string | null;
  address_line1?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  public_email?: string | null;
};
