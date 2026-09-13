import {
  Box,
  Container,
  Flex,
  Heading,
  Image,
  Link,
  Text,
} from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";
import useAuth from "../useAuth";

function AdminHeader() {
  const { payload } = useAuth();

  return (
    <Box bg="brand.900" color="white">
      <Container maxW="4xl" padding={4}>
        <Flex
          flex={1}
          direction={{ base: "column", md: "row" }}
          gap={{ base: 2, md: 4 }}
          justifyContent="center"
          alignItems="center"
        >
          <Image src="/logo192.png" boxSize={{ base: "96px", md: "192px" }} flexShrink={0} />
          <Flex
            flexDirection="column"
            flex={1}
            minW={0}
            width="full"
            gap={{ base: 2, md: 4 }}
            alignItems={{ base: "center", md: "stretch" }}
            textAlign={{ base: "center", md: "right" }}
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={4}
              width="full"
              justifyContent={{ base: "center", md: "flex-end" }}
              alignItems="center"
              order={{ base: 2, md: 1 }}
            >
              <Text
                fontSize={{ base: "xs", md: "md" }}
                maxW="full"
                minW={0}
                overflowWrap="anywhere"
              >
                {payload.email}
              </Text>
              <Text display={{ base: "none", md: "block" }}>|</Text>
              <Link as={ReactRouterLink} to="/" fontSize={{ base: "sm", md: "md" }}>
                Exit Administration page
              </Link>
            </Flex>
            <Heading
              display={{ base: "none", md: "block" }}
              order={{ base: 1, md: 2 }}
              size="xl"
              textAlign={{ base: "center", md: "right" }}
            >
              Booking Administration
            </Heading>
            <Heading
              display={{ base: "block", md: "none" }}
              order={{ base: 1, md: 2 }}
              size="md"
              textAlign="center"
            >
              Admin
            </Heading>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}

export default AdminHeader;
