import { redirect } from "react-router-dom";

let loginRedirectInProgress = false;

export function getStoredToken() {
  const storedToken = sessionStorage.getItem("token");
  if (!storedToken) {
    return null;
  }

  try {
    const token = JSON.parse(storedToken);
    return typeof token === "string" && token.length > 0 ? token : null;
  } catch (error) {
    return null;
  }
}

export function requireAdminAuth() {
  return getStoredToken() === null ? redirect("/login") : null;
}

export function authenticatedLoader(loader) {
  return async (...args) => {
    const authRedirect = requireAdminAuth();
    if (authRedirect) {
      return authRedirect;
    }
    return loader(...args);
  };
}

export function redirectToLogin() {
  sessionStorage.removeItem("token");
  if (window.location.pathname === "/login" || loginRedirectInProgress) {
    return;
  }

  loginRedirectInProgress = true;
  window.location.replace("/login");
}

export function resetLoginRedirect() {
  loginRedirectInProgress = false;
}
