import { Heading, Stack } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

import RequireAuth from "./RequireAuth";

function AdminLayout() {
  return (
    <Stack spacing={4}>
      <Heading>Admin</Heading>
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    </Stack>
  );
}

export default AdminLayout;
