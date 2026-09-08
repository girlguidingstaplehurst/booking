import * as React from "react";
import { useSessionStorage } from "@uidotdev/usehooks";
import { useCallback, useMemo } from "react";

const authContext = React.createContext();

function useAuth() {
  const [token, setToken] = useSessionStorage("token", null);
  const payload = useMemo(() => {
    if (token !== undefined && token !== null) {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );

      return JSON.parse(jsonPayload);
    }
    return {};
  }, [token]);

  const login = useCallback(
    (credentials) => {
      const cred = credentials.credential.replace(/["']/g, "");
      setToken(cred);
    },
    [setToken],
  );

  const logout = useCallback(() => setToken(null), [setToken]);

  return { authed: token !== null, token, payload, login, logout };
}

export function AuthProvider({ children }) {
  const auth = useAuth();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export default function AuthConsumer() {
  return React.useContext(authContext);
}
