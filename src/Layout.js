import {
  Box,
  ButtonGroup,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  Link,
  Spacer,
  Stack,
  StackDivider,
  useBreakpoint,
  useDisclosure,
  useToken,
} from "@chakra-ui/react";
import { Link as ReactRouterLink, Outlet } from "react-router-dom";
import "./App.css";
import RoundedButton from "./components/RoundedButton";
import Footer from "./components/Footer";
import { TbMenu2 } from "react-icons/tb";
import { useRef } from "react";

function NavLink({ children, ...props }) {
  const [brand500, brand900, white] = useToken("colors", [
    "brand.500",
    "brand.900",
    "white",
  ]);

  return (
    <Link
      flex={1}
      textAlign="center"
      justifySelf="end"
      fontWeight="bold"
      borderTop={`3px solid ${brand900}`}
      borderTopRadius={3}
      _hover={{
        bg: white,
        color: brand500,
        borderTop: `3px solid ${brand500}`,
      }}
      {...props}
    >
      {children}
    </Link>
  );
}

function Nav({ breakpoint }) {
  const navInDrawer = breakpoint === "base" || breakpoint === "sm";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  const [brand500, brand900, white] = useToken("colors", [
    "brand.500",
    "brand.900",
    "white",
  ]);

  if (navInDrawer) {
    return (
      <>
        <Flex gap={4} direction="column" align="center">
          <Image src="/logo192.png" boxSize="192px" />
          <ButtonGroup>
            <IconButton
              icon={<TbMenu2 />}
              ariaLabel="Open Navigation Menu"
              onClick={onOpen}
            />
          </ButtonGroup>
        </Flex>
        <Drawer
          isOpen={isOpen}
          placement="right"
          onClose={onClose}
          finalFocusRef={btnRef}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Navigate</DrawerHeader>

            <DrawerBody>
              <Stack
                divider={<StackDivider borderTop={`1px solid ${brand900}`} />}
              >
                <Link fontWeight="bold" href="https://www.kathielambcentre.org">
                  Home
                </Link>
                <Link
                  fontWeight="bold"
                  as={ReactRouterLink}
                  to="/"
                  color="brand.500"
                >
                  Make a Booking
                </Link>
                <Link
                  fontWeight="bold"
                  href="https://www.kathielambcentre.org/whats-on/"
                >
                  What's On?
                </Link>
                <Link
                  fontWeight="bold"
                  href="https://www.kathielambcentre.org/location/"
                >
                  Location
                </Link>
              </Stack>
            </DrawerBody>

            <DrawerFooter />
          </DrawerContent>
        </Drawer>
      </>
    );
  } else {
    return (
      <Flex
        spacing={4}
        flex={1}
        gap={4}
        justifyContent="center"
        alignContent="end"
        wrap="wrap"
      >
        <Image src="/logo192.png" />
        <Flex flexDirection="column" flex={1}>
          <Spacer />
          <Stack
            divider={<StackDivider borderLeft={`1px solid ${brand500}`} />}
            direction="row"
            minH="2em"
            justifyContent="center"
            alignContent="end"
          >
            <NavLink href="https://www.kathielambcentre.org">Home</NavLink>
            <NavLink as={ReactRouterLink} to="/" color="brand.500">
              Booking
            </NavLink>
            <NavLink href="https://www.kathielambcentre.org/whats-on/">
              What's On?
            </NavLink>
            <NavLink href="https://www.kathielambcentre.org/location/">
              Location
            </NavLink>
          </Stack>
        </Flex>
      </Flex>
    );
  }
}

function Layout() {
  const breakpoint = useBreakpoint({ ssr: false });

  return (
    <>
      <a id="top"></a>
      <Box bg="brand.900" color="white">
        <Container maxW="4xl" padding={4}>
          <Nav breakpoint={breakpoint} />
        </Container>
      </Box>
      <Box>
        <Outlet />
        <Container maxW="4xl" padding={4}>
          <Box margin={8} textAlign="center">
            <RoundedButton as="a" href="#top">
              Back to top
            </RoundedButton>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

export default Layout;
