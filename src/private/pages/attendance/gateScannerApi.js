import privateAxiosInstance from "../../../auth/privateAxiosInstance";

const gateScannersBasePath = "/gate-scanners";

export async function verifyGateStudent({ method, value, scanType = "ARRIVAL" }) {
  const endpoint = `${gateScannersBasePath}/verify`;
  console.log("🚀 [gateScannerApi] Verify request:", {
    endpoint,
    method,
    value,
    scanType,
  });

  try {
    const response = await privateAxiosInstance.post(endpoint, {
      method,
      value,
      scanType,
    });
    console.log("✅ [gateScannerApi] Verify response:", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error("❌ [gateScannerApi] Verify error:", {
      endpoint,
      method,
      scanType,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function getScannerPermissions() {
  const endpoint = `${gateScannersBasePath}/permissions`;
  console.log("🚀 [gateScannerApi] Permissions list request:", { endpoint });

  try {
    const response = await privateAxiosInstance.get(endpoint);
    console.log("✅ [gateScannerApi] Permissions list response:", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error("❌ [gateScannerApi] Permissions list error:", {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function grantScannerPermission({ userId }) {
  const endpoint = `${gateScannersBasePath}/permissions`;
  console.log("🚀 [gateScannerApi] Grant permission request:", {
    endpoint,
    userId,
  });

  try {
    const response = await privateAxiosInstance.post(endpoint, { userId });
    console.log("✅ [gateScannerApi] Grant permission response:", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error("❌ [gateScannerApi] Grant permission error:", {
      endpoint,
      userId,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function revokeScannerPermission(userId) {
  const endpoint = `${gateScannersBasePath}/permissions/${encodeURIComponent(userId)}/revoke`;
  console.log("🚀 [gateScannerApi] Revoke permission request:", {
    endpoint,
    userId,
  });

  try {
    const response = await privateAxiosInstance.patch(endpoint);
    console.log("✅ [gateScannerApi] Revoke permission response:", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error("❌ [gateScannerApi] Revoke permission error:", {
      endpoint,
      userId,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function recordGateScan({ studentIds, scanType = "ARRIVAL" }) {
  const endpoint = `${gateScannersBasePath}/record`;
  console.log("🚀 [gateScannerApi] Record request:", {
    endpoint,
    scanType,
    studentIds,
  });

  try {
    const response = await privateAxiosInstance.post(endpoint, {
      studentIds,
      scanType,
    });
    console.log("✅ [gateScannerApi] Record response:", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error("❌ [gateScannerApi] Record error:", {
      endpoint,
      scanType,
      studentIds,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function getScanHistory({
  startDate,
  endDate,
  scanType = "ALL",
  search = "",
  myScans = false,
  page = 1,
  limit = 20,
} = {}) {
  const endpoint = `${gateScannersBasePath}/history`;
  const params = { scanType, search, myScans, page, limit };

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  console.log("🚀 [gateScannerApi] Scan history request:", {
    endpoint,
    params,
  });

  try {
    const response = await privateAxiosInstance.get(endpoint, { params });
    console.log("✅ [gateScannerApi] Scan history response:", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error("❌ [gateScannerApi] Scan history error:", {
      endpoint,
      params,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function getSecurityDashboard() {
  const endpoint = `${gateScannersBasePath}/dashboard`;
  console.log("🚀 [gateScannerApi] Security dashboard request:", { endpoint });

  try {
    const response = await privateAxiosInstance.get(endpoint);
    console.log("✅ [gateScannerApi] Security dashboard response:", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error("❌ [gateScannerApi] Security dashboard error:", {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
