export const PAGES = ['homepage', 'team', 'services', 'banner', 'other'] as const;
export type Page = (typeof PAGES)[number];

export const PAGE_ISSUE_MAP: Record<Page, readonly string[]> = {
  homepage: ['hero_text', 'hero_image', 'hours_block', 'contact_block', 'rtbs', 'other'],
  team: ['team_text', 'add_staff', 'edit_staff_bio', 'edit_staff_headshot', 'remove_staff', 'other'],
  services: ['services_text', 'add_service', 'remove_service', 'edit_service', 'other'],
  banner: ['add_banner', 'edit_banner', 'remove_banner', 'other'],
  other: ['other'],
};

/** Display label for each issue key (UI only). */
/** Display label for issue key (includes legacy keys for existing tickets). */
export const ISSUE_LABELS: Record<string, string> = {
  hero_text: 'Hero Text',
  hero_image: 'Hero Image',
  hours_block: 'Hours of Operation',
  contact_block: 'Contact Information',
  rtbs: 'RTBs',
  announcement: 'Announcement',
  team_text: 'Team Text',
  add_staff: 'Add Staff',
  edit_staff_bio: 'Edit Staff Bio',
  edit_staff_headshot: 'Edit Staff Headshot',
  remove_staff: 'Remove Staff',
  services_text: 'Services Text',
  add_service: 'Add Service',
  remove_service: 'Remove Service',
  edit_service: 'Edit Service',
  pricing_text: 'Pricing Text',
  add_banner: 'Add Banner',
  edit_banner: 'Edit Banner',
  remove_banner: 'Remove Banner',
  update_story: 'Update Story',
  mission_text: 'Mission Text',
  photo_swap: 'Photo Swap',
  change_headshot: 'Edit Staff Headshot',
  other: 'Other',
};

/** Display label for page key (includes legacy 'about' for existing tickets). */
export const PAGE_LABELS: Record<string, string> = {
  homepage: 'Homepage',
  team: 'Team',
  services: 'Services',
  banner: 'Banner',
  other: 'Other',
  about: 'About',
};

export const TICKET_STATUSES = [
  'Pending',
  'In progress',
  'Needs dev change',
  'Client review',
  'Follow up needed',
  'Resolved',
] as const;

/** Status chip colors (Tailwind classes). Lives in lib/constants.ts */
export const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  'In progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Needs dev change': 'bg-purple-100 text-purple-800 border-purple-200',
  'Client review': 'bg-orange-100 text-orange-800 border-orange-200',
  'Follow up needed': 'bg-red-100 text-red-800 border-red-200',
  Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

/** Hex equivalents of STATUS_COLORS for chart/SVG contexts where Tailwind classes can't be used. */
export const STATUS_HEX_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  'In progress': '#3b82f6',
  'Needs dev change': '#a855f7',
  'Client review': '#f97316',
  'Follow up needed': '#ef4444',
  Resolved: '#10b981',
};

export const SIDEBAR_COLLAPSED_WIDTH_PX = 64;
export const SIDEBAR_EXPANDED_WIDTH_PX = 240;
export const SIDEBAR_STORAGE_KEY = 'app.sidebar.expanded';

/** Dispatched after notification read state changes (single or mark all) so nav can refetch unread. */
export const NOTIFICATIONS_UPDATED_EVENT = 'notifications:updated';
