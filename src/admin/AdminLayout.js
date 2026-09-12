import { Box, Container, Link, Stack } from "@chakra-ui/react";
import { NavLink, Outlet } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import Footer from "../components/Footer";
import AdminHeader from "./components/AdminHeader";

function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <Box bg="brand.300" position="sticky" top={0} zIndex={10}>
        <Container maxW="4xl" paddingY={3} textAlign="center">
          <Link as={NavLink} to="/admin" end color="brand.900" fontWeight="bold"
            _activeLink={{ textDecoration: "underline", textUnderlineOffset: "4px" }}>
            Dashboard
          </Link>
          <Link as={NavLink} to="/admin/rates" marginLeft={6} color="brand.900" fontWeight="bold"
            _activeLink={{ textDecoration: "underline", textUnderlineOffset: "4px" }}>
            Rates
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
