import { Box, Container, Link, Stack } from "@chakra-ui/react";
import { Link as ReactRouterLink, Outlet } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import Footer from "../components/Footer";
import AdminHeader from "./components/AdminHeader";

function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <Box bg="brand.300" position="sticky" top={0} zIndex={10}>
        <Container maxW="4xl" paddingY={3} textAlign="center">
          <Link
            as={ReactRouterLink}
            to="/admin"
            color="brand.900"
            fontWeight="bold"
          >
            Dashboard
          </Link>
        </Container>
      </Box>
      <Stack minH="100vh" spacing={4}>
        <RequireAuth>
          <Outlet />
        </RequireAuth>
      </Stack>
      <Footer />
    </>
  );
}

export default AdminLayout;
