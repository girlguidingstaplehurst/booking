import { Box, Container, Flex, Heading, Image, Link, Spacer, Stack, Text } from "@chakra-ui/react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

import useAuth from "./useAuth";
import Footer from "../components/Footer";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = useCallback(
    async (credentials) => {
      await login(credentials);
      navigate("/admin");
    },
    [login, navigate],
  );

  const handleError = useCallback(() => console.log("login failed"), []);

  return (
    <>
      <Box bg="brand.900" color="white">
        <Container maxW="4xl" padding={4}>
          <Flex
            spacing={4}
            flex={1}
            gap={4}
            justifyContent="center"
            alignContent="end"
          >
            <Image src="/logo192.png" />
          </Flex>
        </Container>
      </Box>
      <Box bg="brand.300" position="sticky" top={0} zIndex={10}>
        <Container maxW="4xl" paddingY={3} textAlign="center" />
      </Box>
      <Container maxW="4xl" padding={4}>
        <Stack minH="100vh" spacing={4}>
          <Heading>Login</Heading>
          <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
        </Stack>
      </Container>
      <Footer />
    </>
  );
}

export default Login;
