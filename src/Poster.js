export async function Poster(url, body, headers = {}) {
  try {
    const response = await fetch(url, {
      headers: headers,
      body: body,
      method: 'POST'
    });
    if (response.status === 401) {
      sessionStorage.removeItem("token");
      window.location.reload();
      return;
    }
    if (!response.ok || response.status !== 200 || response.headers.get('content-type') !== 'application/json') {
      return;
    }

    return response;
  } catch (error) {
    console.log("errored", error);
  }
}

export async function AdminPoster(url, body) {
  const token = JSON.parse(sessionStorage.getItem("token"));
  return Poster(url, body, {Authorization: "Bearer " + token})
}