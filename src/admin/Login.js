import { Heading, Stack } from "@chakra-ui/react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

import useAuth from "./useAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = async (credentials) => {
    await login(credentials);
    navigate("/admin");
  };

  return (
    <Stack spacing={4}>
      <Heading>Login</Heading>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("login failed")}
      />
    </Stack>
  );
}

export default Login;
