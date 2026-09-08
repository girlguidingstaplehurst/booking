import { Navigate } from "react-router-dom";

import useAuth from "./useAuth";

function RequireAuth({ children }) {
  const { authed } = useAuth();

  return authed === true ? children : <Navigate to="/login" replace />;
}

export default RequireAuth;
