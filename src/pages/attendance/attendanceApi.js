import privateAxiosInstance from "../../auth/privateAxiosInstance";

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