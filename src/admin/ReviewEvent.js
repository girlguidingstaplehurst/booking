import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Select,
  Spacer,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { useLoaderData } from "react-router-dom";
import dayjs from "dayjs";
import { AdminFetcher } from "../Fetcher";

export async function reviewEvent(eventID) {
  return AdminFetcher("/api/v1/admin/events/" + eventID, {
    id: eventID,
    name: "Fake Event Right now",
    from: dayjs().startOf("hour").toDate(),
    to: dayjs().endOf("hour").toDate(),
    status: "provisional",
    visible: true,
    contact: "Evan T Booking",
    email: "evan.t.booking@example.org",
  });
}

export function ReviewEvent() {
  const event = useLoaderData();

  const eventDates = `${dayjs(event.from).format("ddd D MMMM YYYY [at] HH:mm")} to ${dayjs(event.to).format("ddd D MMMM YYYY [at] HH:mm")}`;
  const visibility = event.visible ? (
    <Flex>
      <Text>Event details visible publicly</Text>
      <Spacer />
      <Button colorScheme="blue">Hide Event Details on Public Website</Button>
    </Flex>
  ) : (
    <Flex>
      <Text>Event details hidden publicly</Text>
      <Spacer />
      <Button colorScheme="blue">Show Event Details on Public Website</Button>
    </Flex>
  );

  return (
    <Card>
      <CardHeader>
        <Heading size="m">{event.name}</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>{eventDates}</Box>
          <Box>
            {event.contact} [{event.email}]
          </Box>
          {visibility}
          <Flex gap={2}>
            <Select>
              <option value="external" selected>
                External Hirer
              </option>
              <option value="regular-external">Regular External Hirer</option>
              <option value="girlguiding">Girlguiding Hirer</option>
              <option value="girlguiding-residential">Girlguiding Residential</option>
              <option value="district-event">
                Girlguiding Staplehurst District Event
              </option>
              <option value="unit-meeting">Unit Meeting</option>
              <option value="unit-meeting-rainbows">
                Unit Meeting (Rainbows)
              </option>
              <option value="unit-meeting-trefoil">
                Unit Meeting (Trefoil)
              </option>
            </Select>
            {/*TODO enable this button if the select value has changed */}
            <Button colorScheme="blue" isDisabled={true}>
              Update
            </Button>
          </Flex>
          <Flex>
            <Badge>{event.status}</Badge>
            {/*TODO use state machine to work out what the next stage(s) are for this event and display action buttons*/}
            <Spacer />
            <ButtonGroup>
              <Button colorScheme="blue">Send Invoice</Button>
              <Button colorScheme="blue">Mark Paid</Button>
              <Button colorScheme="blue">Approve</Button>
            </ButtonGroup>
          </Flex>
        </Stack>
      </CardBody>
    </Card>
  );
}
