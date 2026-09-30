import { Box, Container, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useLoaderData } from "react-router-dom";
import ManagedContent from "./components/ManagedContent";

function EventCard({ event }) {
  const from = dayjs(event.from);
  const to = dayjs(event.to);

  return (
    <Box borderRadius="md" overflow="hidden" boxShadow="sm" backgroundColor="white">
      <Box padding={4}>
        <Text color="brand.900" fontSize="lg" fontWeight="semibold">
          {from.format("ddd MMM D")}
        </Text>
        <Text color="brand.300" marginTop={1}>
          {`${from.format("h:mm A")} - ${to.format("h:mm A")}`}
        </Text>
      </Box>
    </Box>
  );
}

function WhatsOn() {
  let schedule = useLoaderData();
  if (schedule.items === undefined || schedule.items === null) {
    const date = dayjs();
    schedule = {
      items: [
        {
          id: "fake-group-1",
          type: "event_group",
          name: "Fake Event Group One",
          events: [
            {
              id: "fake-group-1-event-1",
              name: "Fake Event Group One",
              from: date.add(10, "hours").toDate(),
              to: date.add(11, "hours").toDate(),
              status: "provisional",
              visible: true,
            },
            {
              id: "fake-group-1-event-2",
              name: "Fake Event Group One",
              from: date.add(34, "hours").toDate(),
              to: date.add(35, "hours").toDate(),
              status: "approved",
              visible: true,
            },
          ],
        },
        {
          id: "fake-standalone-event",
          type: "event",
          name: "Standalone Event",
          events: [{
            id: "fake-standalone-event",
            name: "Standalone Event",
            from: date.add(58, "hours").toDate(),
            to: date.add(59, "hours").toDate(),
            status: "approved",
            visible: true,
          }],
        },
        {
          id: "fake-group-2",
          type: "event_group",
          name: "Fake Event Group Two",
          events: [
            {
              id: "fake-group-2-event-1",
              name: "Fake Event Group Two",
              from: date.add(82, "hours").toDate(),
              to: date.add(83, "hours").toDate(),
              status: "approved",
              visible: true,
            },
            {
              id: "fake-group-2-event-2",
              name: "Fake Event Group Two",
              from: date.add(106, "hours").toDate(),
              to: date.add(107, "hours").toDate(),
              status: "approved",
              visible: true,
            },
          ],
        },
      ],
    };
  }

  return (
    <Container maxW="4xl" padding={4}>
      <Stack spacing={4}>
        <ManagedContent name="whats-on" showLastUpdated={false} />
        <Stack spacing={6}>
          {schedule.items.map((item) => (
            <Box key={item.id} borderRadius="md" overflow="hidden" boxShadow="md">
              <Box backgroundColor="brand.900" padding={5}>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  {item.name}
                </Text>
              </Box>
              <Box backgroundColor="gray.50" padding={5}>
                <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} spacing={4}>
                  {item.events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </SimpleGrid>
              </Box>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}

export default WhatsOn;
