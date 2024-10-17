import { Box, Container, Flex, Image, Text } from "@chakra-ui/react";

function Footer() {
  return <Box bg="brand.900" color="white">
    <Container maxW="4xl" padding={4}>
      <Flex marginBottom={8}>
        <Image src="/logo192.png" />
        <Flex flex="1" gap={4} wrap="wrap">
          <Box flex={1}>Column 1</Box>
          <Box flex={1}>Column 2</Box>
          <Box flex={1}>Column 3</Box>
          <Box flex={1}>Column 4</Box>
          <Box flex={1}>Column 5</Box>
        </Flex>
      </Flex>
      <Text fontSize={12} align="left">
        &copy; 2024 Girlguiding Staplehurst District. Registered Charity
        801848
      </Text>
    </Container>
  </Box>;
}

export default Footer;
