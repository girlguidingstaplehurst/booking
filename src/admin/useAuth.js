import * as React from "react";
import { useSessionStorage } from "@uidotdev/usehooks";
import { useMemo } from "react";

const authContext = React.createContext();

function useAuth() {
  const [token, setToken] = useSessionStorage("token", null);
  const payload = useMemo(() => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }, [token])

  return {
    authed: token !== null,
    token,
    payload,
    login(token) {
      return new Promise((res) => {
        const cred = token.credential.replace(/["']/g, "")  ;
        setToken(cred);
        res();
      });
    },
    logout() {
      return new Promise((res) => {
        setToken(null);
        res();
      });
    },
  };
}

export function AuthProvider({ children }) {
  const auth = useAuth();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export default function AuthConsumer() {
  return React.useContext(authContext);
}
