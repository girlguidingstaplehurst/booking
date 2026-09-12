import { Box, Heading } from "@chakra-ui/react";

function PageHeader({ title, children }) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      backgroundColor="brand.900"
      padding={5}
      borderRadius="md"
      marginTop={4}
      height="80px"
    >
      <Heading size="lg" color="white">{title}</Heading>
      {children}
    </Box>
  );
}

export default PageHeader;
