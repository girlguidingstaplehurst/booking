import {
  Box,
  ButtonGroup,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Link,
  Stack,
  StackDivider,
  useBreakpoint,
  useDisclosure,
  useToken,
} from "@chakra-ui/react";
import { Link as ReactRouterLink, Outlet, useLocation } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import Footer from "../components/Footer";
import AdminHeader from "./components/AdminHeader";
import { TbMenu2 } from "react-icons/tb";
import { useRef } from "react";

function AdminDrawerLink({ label, to, ...props }) {
  const { pathname } = useLocation();
  const [brand500, brand900] = useToken("colors", ["brand.500", "brand.900"]);

  return (
    <Link
      as={ReactRouterLink}
      to={to}
      flex={1}
      fontWeight="bold"
      color={pathname === to ? brand500 : brand900}
      aria-current={pathname === to ? "page" : undefined}
      {...props}
    >
      {label}
    </Link>
  );
}

function AdminNavInDrawer() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  const [brand900] = useToken("colors", ["brand.900"]);

  return (
    <>
      <ButtonGroup>
        <IconButton
          ref={btnRef}
          icon={<TbMenu2 />}
          aria-label="Open Admin Navigation Menu"
          onClick={onOpen}
        />
      </ButtonGroup>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        motionPreset="none"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Navigate</DrawerHeader>
          <DrawerBody>
            <Stack divider={<StackDivider borderTop={`1px solid ${brand900}`} />}>
              <AdminDrawerLink label="Dashboard" to="/admin" onClick={onClose} />
              <AdminDrawerLink label="Rates" to="/admin/rates" onClick={onClose} />
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function AdminMenuLink({ label, to, ...props }) {
  const { pathname } = useLocation();
  const [brand300, brand500, brand900, white] = useToken("colors", [
    "brand.300",
    "brand.500",
    "brand.900",
    "white",
  ]);

  return (
    <Link
      as={ReactRouterLink}
      to={to}
      flex={1}
      textAlign="center"
      fontWeight="bold"
      borderTop={`3px solid ${brand300}`}
      color={pathname === to ? white : brand900}
      aria-current={pathname === to ? "page" : undefined}
      borderTopRadius={3}
      _hover={{
        bg: white,
        color: brand500,
        borderTop: `3px solid ${brand500}`,
      }}
      {...props}
    >
      {label}
    </Link>
  );
}

function AdminTopNav() {
  const [brand500] = useToken("colors", ["brand.500"]);

  return (
    <Stack
      divider={<StackDivider borderLeft={`1px solid ${brand500}`} />}
      direction="row"
      minH="2em"
      justifyContent="center"
      alignItems="stretch"
    >
      <AdminMenuLink to="/admin" label="Dashboard" />
      <AdminMenuLink to="/admin/rates" label="Rates" />
    </Stack>
  );
}

function AdminLayout() {
  const breakpoint = useBreakpoint({ ssr: false });
  const navInDrawer = breakpoint === "base" || breakpoint === "sm";

  return (
    <>
      <AdminHeader />
      <Box bg="brand.300" position="sticky" top={0} zIndex={10}>
        <Container maxW="4xl" paddingY={3} textAlign="center">
          <Flex justifyContent="center">
            {navInDrawer ? <AdminNavInDrawer /> : <AdminTopNav />}
          </Flex>
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
