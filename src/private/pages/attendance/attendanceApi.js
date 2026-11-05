import privateAxiosInstance from "../../../auth/privateAxiosInstance";

const attendancesBasePath = "/attendances";

export async function getTodayAttendance() {
  const response = await privateAxiosInstance.get(
    `${attendancesBasePath}/today`
  );
  return response.data;
}

export async function createTodayAttendance() {
  const response = await privateAxiosInstance.post(
    `${attendancesBasePath}/create-today`
  );
  return response.data;
}

export async function saveAttendanceDraft(registerId, students) {
  const response = await privateAxiosInstance.patch(
    `${attendancesBasePath}/${encodeURIComponent(registerId)}/draft`,
    { students }
  );
  return response.data;
}

export async function submitAttendance(registerId, students) {
  const response = await privateAxiosInstance.patch(
    `${attendancesBasePath}/${encodeURIComponent(registerId)}/submit`,
    { students }
  );
  return response.data;
}

// Registers of the authenticated form master's own class. The class is
// resolved from the account, so no class id is ever sent here.
export async function getMyAttendanceHistory(params = {}) {
  const response = await privateAxiosInstance.get(
    `${attendancesBasePath}/my-history`,
    { params }
  );
  return response.data;
}

export async function getAttendanceHistory(params = {}) {
  const response = await privateAxiosInstance.get(
    `${attendancesBasePath}/history`,
    { params }
  );
  return response.data;
}

// One register with the students recorded on that day. Available to the class's
// form master (for corrections) and to administrators (read-only).
export async function getAttendanceRegister(registerId) {
  const response = await privateAxiosInstance.get(
    `${attendancesBasePath}/history/${encodeURIComponent(registerId)}`
  );
  return response.data;
}
