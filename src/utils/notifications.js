import {
  Bell,
  CheckCircle2,
  DoorOpen,
  LifeBuoy,
  Megaphone,
  ScanLine,
} from 'lucide-react';

const notificationTypeMetadata = {
  ANNOUNCEMENT: {
    label: 'Announcement',
    icon: Megaphone,
    tone: 'bg-sky-50 text-sky-700',
  },
  COMPLAINT_RESOLVED: {
    label: 'Complaint resolved',
    icon: CheckCircle2,
    tone: 'bg-emerald-50 text-emerald-700',
  },
  GATE_ARRIVAL: {
    label: 'Gate arrival',
    icon: DoorOpen,
    tone: 'bg-violet-50 text-violet-700',
  },
  GATE_RETURN: {
    label: 'Gate return',
    icon: ScanLine,
    tone: 'bg-violet-50 text-violet-700',
  },
  HELP_SUPPORT_REPLY: {
    label: 'Support reply',
    icon: LifeBuoy,
    tone: 'bg-amber-50 text-amber-700',
  },
  GENERAL: {
    label: 'Notification',
    icon: Bell,
    tone: 'bg-slate-100 text-slate-600',
  },
};

export function getNotificationMeta(type) {
  return notificationTypeMetadata[type] || notificationTypeMetadata.GENERAL;
}

export function formatNotificationTime(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const minutesAgo = Math.floor((Date.now() - date.getTime()) / 60000);

  if (minutesAgo < 1) return 'Just now';
  if (minutesAgo < 60) return `${minutesAgo}m ago`;

  const hoursAgo = Math.floor(minutesAgo / 60);

  if (hoursAgo < 24) return `${hoursAgo}h ago`;

  const daysAgo = Math.floor(hoursAgo / 24);

  if (daysAgo === 1) return 'Yesterday';
  if (daysAgo < 7) return `${daysAgo}d ago`;

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
