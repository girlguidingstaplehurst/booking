import * as React from "react";
import { useSessionStorage } from "@uidotdev/usehooks";

const authContext = React.createContext();

function useAuth() {
  const [token, setToken] = useSessionStorage("token", null);

  return {
    authed: token !== null,
    token,
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
