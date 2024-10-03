import { Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import "./App.css";

function Layout() {
  return (
    <Container maxW="4xl">
      <Outlet />
    </Container>
  );
}

export default Layout;
