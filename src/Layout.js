import {
  Box,
  Container,
  Flex,
  Image,
  SimpleGrid,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import "./App.css";

function Layout() {
  return (
    <>
      <Box bg="brand.900" color="white">
        <Container maxW="4xl" padding={4}>
          <Flex>
            <Image src="/logo192.png" />
            <Spacer />
            <Box>Text</Box>
          </Flex>
        </Container>
      </Box>
      <Box>
        <Container maxW="4xl" padding={4}>
          <Outlet />
        </Container>
      </Box>
      <Box bg="brand.900" color="white">
        <Container maxW="4xl" padding={4}>
          <Flex>
            <Image src="/logo192.png" />
            <SimpleGrid flex="1" columns={5} gap={4}>
              <Box>Column 1</Box>
              <Box>Column 2</Box>
              <Box>Column 3</Box>
              <Box>Column 4</Box>
              <Box>Column 5</Box>
            </SimpleGrid>
          </Flex>
          <Text size="x   s" align="center">
            &copy; 2024 Girlguiding Staplehurst District. Registered Charity
            801848
          </Text>
        </Container>
      </Box>
    </>
  );
}

export default Layout;
