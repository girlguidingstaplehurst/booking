import { Heading, Stack, Text } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

import RequireAuth from "./RequireAuth";

function AdminLayout() {
  return (
    <Stack spacing={4}>
      <Heading padding={4}>Admin</Heading>
      <RequireAuth>
        <Outlet />
      </RequireAuth>
      <Text align="center">Girlguiding Staplehurst District</Text>
    </Stack>
  );
}

export default AdminLayout;
