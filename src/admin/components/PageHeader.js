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
      minHeight="80px"
      gap={4}
      flexWrap={{ base: "wrap", md: "nowrap" }}
    >
      <Heading size="lg" color="white">{title}</Heading>
      {children && <Box display="flex" gap={2} flexWrap="wrap">{children}</Box>}
    </Box>
  );
}

export default PageHeader;
