import { getMyNotifications, getUnreadNotificationCount } from '../../../services/notificationApi';
import { getMyAnnouncements } from '../announcements/announcementApi';
import { getMyAttendanceHistory, getTodayAttendance } from '../attendance/attendanceApi';
import { getSecurityDashboard } from '../attendance/gateScannerApi';
import { getMyComplaints } from '../complaints/complaintApi';

// Every section is fetched on its own and reports its own failure, so one
// unavailable endpoint cannot blank the dashboard.
async function run(loader, unwrap, unavailableMessage) {
  try {
    return { ok: true, ...(await unwrap(await loader())) };
  } catch (error) {
    const serverMessage = error?.response?.data?.message;

    // A 403 here means the account simply is not offered that surface, so the
    // section is hidden rather than shown as a failure the user cannot act on.
    if (error?.response?.status === 403) {
      return { ok: true, available: false };
    }

    return {
      ok: false,
      message: serverMessage || unavailableMessage,
    };
  }
}

function markedCount(students = []) {
  return students.filter((student) => student?.status === 'PRESENT' || student?.status === 'ABSENT').length;
}

export async function getStaffDashboard({ isFormMaster = false, canScanStudents = false } = {}) {
  // Fired alone on purpose: the database pool opens slowly, and starting every
  // section at once on a cold pool pushes the later requests past the axios
  // timeout. This cheapest call warms the connection for the rest.
  const unread = await run(
    getUnreadNotificationCount,
    async (payload) => ({ count: Number(payload?.data?.unreadCount ?? 0) }),
    'Your unread count could not be loaded.'
  );

  const jobs = {
    announcements: () =>
      run(
        () => getMyAnnouncements({ page: 1, limit: 4 }),
        async (payload) => {
          const items = payload?.data?.announcements ?? [];

          return {
            items,
            total: payload?.data?.pagination?.totalItems ?? items.length,
          };
        },
        'Your announcements could not be loaded.'
      ),

    complaints: () =>
      run(
        () => getMyComplaints({ page: 1, limit: 50 }),
        async (payload) => {
          const items = payload?.data?.complaints ?? [];

          return {
            items: items.slice(0, 3),
            total: payload?.pagination?.totalItems ?? items.length,
            openCount: items.filter((complaint) => complaint?.status === 'SUBMITTED' || complaint?.status === 'IN_PROGRESS').length,
          };
        },
        'Your complaints could not be loaded.'
      ),

    notifications: () =>
      run(
        () => getMyNotifications({ page: 1, limit: 5 }),
        async (payload) => ({ items: payload?.data?.notifications ?? [] }),
        'Your notifications could not be loaded.'
      ),
  };

  if (isFormMaster) {
    jobs.today = () =>
      run(
        getTodayAttendance,
        async (payload) => {
          const data = payload?.data;
          const students = data?.students ?? [];
          const register = data?.attendanceRegister ?? null;

          return {
            available: true,
            attendanceDate: data?.attendanceDate ?? null,
            className: data?.class ? [data.class.classLevel, data.class.arm].filter(Boolean).join(' ') : null,
            registerId: register?.id ?? null,
            status: register?.status ?? 'NOT_STARTED',
            totalStudents: students.length,
            markedStudents: markedCount(students),
            canEdit: data?.permissions?.canEdit !== false,
          };
        },
        "Today's attendance could not be loaded."
      );

    jobs.history = () =>
      run(
        () => getMyAttendanceHistory({ page: 1, limit: 5 }),
        async (payload) => {
          const registers = [...(payload?.data?.registers ?? [])].sort((a, b) =>
            String(b?.attendanceDate ?? '').localeCompare(String(a?.attendanceDate ?? ''))
          );

          return {
            available: true,
            summary: payload?.data?.summary ?? null,
            lastRegister: registers[0] ?? null,
          };
        },
        'Your attendance history could not be loaded.'
      );
  }

  if (canScanStudents) {
    jobs.gate = () =>
      run(
        getSecurityDashboard,
        async (payload) => ({ todayArrivalCount: Number(payload?.data?.todayArrivalCount ?? 0) }),
        "Today's gate arrivals could not be loaded."
      );
  }

  const keys = Object.keys(jobs);
  const sections = await Promise.all(keys.map((key) => jobs[key]()));

  return { unread, ...Object.fromEntries(sections.map((section, index) => [keys[index], section])) };
}
