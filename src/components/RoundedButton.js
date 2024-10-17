import { Button, useToken } from "@chakra-ui/react";

function RoundedButton({ children, ...rest }) {
  const [brand500, white] = useToken("colors", ["brand.500", "white"]);

  return (
    <Button
      colorScheme="brand"
      border={`2px solid ${brand500}`}
      borderRadius={100}
      _hover={{
        bg: white,
        color: brand500,
      }}
      {...rest}
    >
      {children}
    </Button>
  );
}

export default RoundedButton;
