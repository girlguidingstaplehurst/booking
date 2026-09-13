import { Container, Stack } from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";

import ManagedContent from "./components/ManagedContent";
import RoundedButton from "./components/RoundedButton";

function ThankYou() {
  return (
    <Stack gap={4}>
      <ManagedContent name="thank-you" showLastUpdated={false} />
      <Container maxW="4xl" padding={4}>
        <RoundedButton as={ReactRouterLink} to="/">
          Return to main page
        </RoundedButton>
      </Container>
    </Stack>
  );
}

export default ThankYou;
