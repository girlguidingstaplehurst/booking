import { Container, Divider, Text } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import "./App.css";

function Layout() {
  return (
    <Container maxW="4xl">
      <Outlet />
      <Divider style={{ marginBottom: "1rem" }} />
      <Text align="center">Girlguiding Staplehurst District</Text>
    </Container>
  );
}

export default Layout;
