import { getStoredToken, redirectToLogin } from "./admin/auth";

export async function Poster(url, body, headers = {}, method = "POST") {
  try {
    const jsonBody = JSON.stringify(body);
    headers["Content-Type"] = "application/json";

    const response = await fetch(url, {
      headers: headers,
      body: jsonBody,
      method: method,
    });
    if (response.status === 401) {
      redirectToLogin();
      return;
    }

    return response;
  } catch (error) {
    console.log("errored", error);
  }
}

export async function AdminPoster(url, body) {
  const token = getStoredToken();
  return Poster(url, body, {Authorization: "Bearer " + token})
}

export async function AdminPutter(url, body) {
  const token = getStoredToken();
  return Poster(url, body, { Authorization: "Bearer " + token }, "PUT");
}
