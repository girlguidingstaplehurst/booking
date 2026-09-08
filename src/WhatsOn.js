import { Box, Container, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useLoaderData } from "react-router-dom";
import ManagedContent from "./components/ManagedContent";

function WhatsOn() {
  const date = dayjs();

  let eventsList = useLoaderData();
  if (eventsList.events === undefined || eventsList.events === null) {
    eventsList = {
      events: [
        {
          name: "Fake Event Right now",
          from: date.add(10, "hours").toDate(),
          to: date.add(11, "hours").toDate(),
          status: "provisional",
          visible: true,
        },
        {
          name: "Approved event",
          from: date.add(35, "hours").toDate(),
          to: date.add(76, "hours").toDate(),
          status: "approved",
          visible: true,
        },
        {
          name: "Private event",
          from: date.add(50, "hours").toDate(),
          to: date.add(52, "hours").toDate(),
          status: "approved",
          visible: false,
        },
      ],
    };
  }

  return (
    <Container maxW="4xl" padding={4}>
      <Stack spacing={4}>
        <ManagedContent name="whats-on" showLastUpdated={false} />
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {eventsList.events
            .filter((event) => event.visible !== false)
            .map((event) => {
              const from = dayjs(event.from);
              const to = dayjs(event.to);

              return (
                <Box
                  key={`${event.name}-${event.from}`}
                  borderRadius="md"
                  overflow="hidden"
                  boxShadow="md"
                >
                  <Box backgroundColor="brand.900" padding={5}>
                    <Text color="white" fontSize="xl" fontWeight="bold">
                      {event.name}
                    </Text>
                  </Box>
                  <Box backgroundColor="white" padding={5}>
                    <Text color="brand.900" fontSize="lg" fontWeight="semibold">
                      {from.format("ddd MMM D")}
                    </Text>
                    <Text color="brand.300" fontSize="lg" marginTop={2}>
                      {`${from.format("h:mm A")} - ${to.format("h:mm A")}`}
                    </Text>
                  </Box>
                </Box>
              );
            })}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

export default WhatsOn;
