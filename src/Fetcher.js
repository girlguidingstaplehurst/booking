import { getStoredToken, redirectToLogin } from "./admin/auth";

export async function Fetcher(url, dummyData, headers = {}) {
  try {
    const response = await fetch(url, {headers: headers});
    if (response.status === 401) {
      redirectToLogin();
      return dummyData;
    }
    if (!response.ok || response.status !== 200 || response.headers.get('content-type') !== 'application/json') {
      return dummyData;
    }
    return response;
  } catch (error) {
    return dummyData;
  }
}

export async function AdminFetcher(url, dummyData) {
  const token = getStoredToken();
  return Fetcher(url, dummyData, {Authorization: "Bearer " + token})
}

export async function searchEventGroups(title) {
  return AdminFetcher(
    `/api/v1/admin/event-groups/search?title=${encodeURIComponent(title)}`,
    [],
  );
}

export async function listContacts() {
  const response = await AdminFetcher("/api/v1/admin/contacts", []);
  if (response?.json) {
    return await response.json();
  }
  return response || [];
}
