import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Spacer,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { Link as ReactRouterLink, useLoaderData, useRevalidator } from "react-router-dom";
import dayjs from "dayjs";
import { AdminFetcher } from "../Fetcher";
import { RateUpdater } from "./components/RateSelect";
import { AdminPoster, AdminPutter } from "../Poster";
import TriggerModal from "./components/TriggerModal";
import React from "react";
import RequestDocumentsModalContents from "./components/RequestDocumentsModalContents";
import ActionButton from "./components/ActionButton";
import PageHeader from "./components/PageHeader";
import { KeyholderSelect } from "./components/KeyholderSelect";
import RoundedButton from "../components/RoundedButton";

export async function reviewEvent(eventID) {
  return AdminFetcher("/api/v1/admin/events/" + eventID, {
    id: eventID,
    name: "Fake Event Right now",
    details: "Details of the event will eventually be set in this field here",
    from: dayjs().startOf("hour").toDate(),
    to: dayjs().endOf("hour").toDate(),
    status: "provisional",
    visible: true,
    contact: "Evan T Booking",
    email: "evan.t.booking@example.org",
    assignee: "bookings@kathielambcentre.org",
    keyholderIn: { id: "11111111-1111-1111-1111-111111111111", name: "Booking Team" },
    keyholderOut: { id: "11111111-1111-1111-1111-111111111111", name: "Booking Team" },
    invoices: [
      {
        reference: "ABCDEF",
        id: "ggghhhiii",
        status: "raised",
        sent: dayjs().toISOString(),
      },
      {
        reference: "BCDEFG",
        id: "jjjkkklll",
        status: "paid",
        sent: dayjs().toISOString(),
        paid: dayjs().toISOString(),
      },
      {
        reference: "CDEFGH",
        id: "mmmnnnooo",
        status: "cancelled",
      },
    ],
    rateID: "default",
  });
}

function getInvoiceColorScheme(status) {
  switch (status) {
    case "raised":
      return "purple";
    case "paid":
      return "green";
    case "cancelled":
      return "red";
    default:
      return "";
  }
}

function EventStateButtons({ eventID, status }) {
  switch (status) {
    case "provisional":
      return (
        <ButtonGroup>
          <TriggerModal buttonText="Request Documents">
            <RequestDocumentsModalContents eventID={eventID} />
          </TriggerModal>
          <ActionButton action={async () => await cancelEvent(eventID)}>
            Cancel Event
          </ActionButton>
          <ActionButton action={async () => await approveEvent(eventID)}>
            Approve Event
          </ActionButton>
        </ButtonGroup>
      );
    case "awaiting documents":
      return (
        <ButtonGroup>
          <ActionButton action={async () => await cancelEvent(eventID)}>
            Cancel Event
          </ActionButton>
          <ActionButton action={async () => await approveEvent(eventID)}>
            Approve Event
          </ActionButton>
        </ButtonGroup>
      );
    case "approved":
      return (
        <ButtonGroup>
          <ActionButton action={async () => await cancelEvent(eventID)}>
            Cancel Event
          </ActionButton>
        </ButtonGroup>
      );
    case "cancelled":
    default:
      return null;
  }
}

async function cancelEvent(eventID) {
  const response = await AdminPoster(
    `/api/v1/admin/events/${eventID}/cancel-event`,
    null,
  );
  if (response !== undefined) {
    return response.json();
  }
}

async function approveEvent(eventID) {
  const response = await AdminPoster(
    `/api/v1/admin/events/${eventID}/approve-event`,
    null,
  );
  if (response !== undefined) {
    return response.json();
  }
}

export function ReviewEvent() {
  const event = useLoaderData();
  const revalidator = useRevalidator();
  const [assignments, setAssignments] = React.useState({
    keyholderIn: event.keyholderIn?.id || "",
    keyholderOut: event.keyholderOut?.id || "",
  });
  const [assignmentError, setAssignmentError] = React.useState("");
  const [savingAssignments, setSavingAssignments] = React.useState(false);
  const [editableDates, setEditableDates] = React.useState({
    from: dayjs(event.from).format("YYYY-MM-DD"),
    to: dayjs(event.to).format("YYYY-MM-DD"),
    fromTime: dayjs(event.from).format("HH:mm"),
    toTime: dayjs(event.to).format("HH:mm"),
  });
  const [dateError, setDateError] = React.useState("");
  const [savingDates, setSavingDates] = React.useState(false);
  const eventDateSummary = `${dayjs(event.from).format("ddd D MMMM YYYY [at] HH:mm")} to ${dayjs(event.to).format("ddd D MMMM YYYY [at] HH:mm")}`;
  const visibility = event.visible ? (
    <Flex>
      <Box>
        <Heading size="s">Event Visibility</Heading>
        <Text>Event details visible publicly</Text>
      </Box>
      <Spacer />
      {/*<RoundedButton colorScheme="brand">Hide Event Details on Public Website</RoundedButton>*/}
    </Flex>
  ) : (
    <Flex>
      <Box>
        <Heading size="s">Event Visibility</Heading>
        <Text>Event details hidden publicly</Text>
      </Box>
      <Spacer />
      {/*<RoundedButton colorScheme="brand">Show Event Details on Public Website</RoundedButton>*/}
    </Flex>
  );

  const hasInvoices = Array.isArray(event.invoices) && event.invoices.length > 0;

  const saveAssignments = async () => {
    setSavingAssignments(true);
    setAssignmentError("");
    const response = await AdminPutter(`/api/v1/admin/events/${event.id}/keyholders`, {
      keyholderIn: assignments.keyholderIn || null,
      keyholderOut: assignments.keyholderOut || null,
    });
    setSavingAssignments(false);
    if (response?.ok) {
      revalidator.revalidate();
    } else {
      setAssignmentError("Unable to update keyholders.");
    }
  };

  const saveDates = async () => {
    const from = dayjs(`${editableDates.from}T${editableDates.fromTime}`);
    const to = dayjs(`${editableDates.to}T${editableDates.toTime}`);
    setDateError("");
    if (!from.isValid() || !to.isValid() || !to.isAfter(from)) {
      setDateError("The end date and time must be after the start date and time.");
      return;
    }

    setSavingDates(true);
    const response = await AdminPutter(`/api/v1/admin/events/${event.id}/dates`, {
      from: from.toISOString(),
      to: to.toISOString(),
    });
    setSavingDates(false);
    if (response?.ok) {
      revalidator.revalidate();
    } else {
      let message = "Unable to update event dates.";
      if (response) {
        try {
          const error = await response.json();
          message = error.error_message || message;
        } catch (error) {
          // Keep the generic message when the server does not return JSON.
        }
      }
      setDateError(message);
    }
  };

  return (
    <Container maxW="4xl">
      <Stack spacing={4}>
        <PageHeader title={`Review "${event.name}"`} />
        <Card>
          <CardHeader>
            <Heading size="m">{event.name}</Heading>
          </CardHeader>
          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
              <Flex>
                <Box>
                  <Heading size="s">Assignee</Heading>
                  <Text>{event.assignee}</Text>
                </Box>
                <Spacer />
                {/*<ButtonGroup>*/}
                {/*  <RoundedButton colorScheme="brand">Assign to Me</RoundedButton>*/}
                {/*</ButtonGroup>*/}
              </Flex>
              <Flex>
                <Box>
                  <Heading size="s">Event Dates and Times</Heading>
                  <Text>{eventDateSummary}</Text>
                </Box>
                <Spacer />
              </Flex>
              <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <Box>
                    <FormLabel htmlFor="event-start-date">Start date</FormLabel>
                    <Input
                      id="event-start-date"
                      type="date"
                      value={editableDates.from}
                      onChange={(change) => setEditableDates((dates) => ({ ...dates, from: change.target.value }))}
                    />
                  </Box>
                  <Box>
                    <FormLabel htmlFor="event-start-time">Start time</FormLabel>
                    <Input
                      id="event-start-time"
                      type="time"
                      value={editableDates.fromTime}
                      onChange={(change) => setEditableDates((dates) => ({ ...dates, fromTime: change.target.value }))}
                    />
                  </Box>
                  <Box>
                    <FormLabel htmlFor="event-end-date">End date</FormLabel>
                    <Input
                      id="event-end-date"
                      type="date"
                      value={editableDates.to}
                      onChange={(change) => setEditableDates((dates) => ({ ...dates, to: change.target.value }))}
                    />
                  </Box>
                  <Box>
                    <FormLabel htmlFor="event-end-time">End time</FormLabel>
                    <Input
                      id="event-end-time"
                      type="time"
                      value={editableDates.toTime}
                      onChange={(change) => setEditableDates((dates) => ({ ...dates, toTime: change.target.value }))}
                    />
                  </Box>
                </SimpleGrid>
                <Text color="red">{dateError}</Text>
                <RoundedButton onClick={saveDates} isLoading={savingDates} marginTop={2}>
                  Update Dates and Times
                </RoundedButton>
              </Box>
              <Box>
                <Heading size="s">Event Details</Heading>
                <Text>{event.details}</Text>
              </Box>
              <Flex>
                <Box>
                  <Heading size="s">Event Contact</Heading>
                  <Text>
                    {event.contact} [{event.email}]
                  </Text>
                </Box>
                <Spacer />
                {/*<ButtonGroup>*/}
                {/*  <RoundedButton colorScheme="brand">Update Event Contact</RoundedButton>*/}
                {/*</ButtonGroup>*/}
              </Flex>
              {visibility}
              <Box>
                <Heading size="s">Hiring Rate</Heading>
                <RateUpdater eventID={event.id} rateID={event.rateID} />
              </Box>
              <Flex>
                <Box>
                  <Heading size="s">Invoices</Heading>
                  <ButtonGroup flexWrap="wrap" gap={2}>
                    {hasInvoices ? (
                      event.invoices.map((invoice) => (
                        <Button
                          to={`/admin/invoice/${invoice.id}`}
                          as={ReactRouterLink}
                          colorScheme={getInvoiceColorScheme(invoice.status)}
                        >
                          {invoice.reference} - {invoice.status}{" "}
                          {invoice.paid
                            ? `(${dayjs(invoice.paid).format("D MMMM YYYY")})`
                            : invoice.sent
                              ? `(${dayjs(invoice.sent).format("D MMMM YYYY")})`
                              : null}
                        </Button>
                      ))
                    ) : (
                      <Button
                        as={ReactRouterLink}
                        to={`/admin/create-invoice?events=${event.id}`}
                        colorScheme="brand"
                      >
                        Raise Invoice
                      </Button>
                    )}
                  </ButtonGroup>
                </Box>
              </Flex>
              <Flex>
                <Box>
                  <Heading size="s">Event Status</Heading>
                  <Text>{event.status}</Text>
                </Box>
                <Spacer />
                <EventStateButtons eventID={event.id} status={event.status} />
              </Flex>
              <Flex gap={4} flexWrap="wrap" justifyContent="flex-end">
                <Stack flex="1" spacing={2} minW={{ base: "100%", md: "sm" }}>
                  <KeyholderSelect
                    label="Keyholder in"
                    name="keyholderIn"
                    value={assignments.keyholderIn}
                    currentID={event.keyholderIn?.id}
                    currentName={event.keyholderIn?.name}
                    onChange={(change) =>
                      setAssignments((current) => ({ ...current, keyholderIn: change.target.value }))
                    }
                  />
                  <KeyholderSelect
                    label="Keyholder out"
                    name="keyholderOut"
                    value={assignments.keyholderOut}
                    currentID={event.keyholderOut?.id}
                    currentName={event.keyholderOut?.name}
                    onChange={(change) =>
                      setAssignments((current) => ({ ...current, keyholderOut: change.target.value }))
                    }
                  />
                  <Text color="red">{assignmentError}</Text>
                </Stack>
                <RoundedButton
                  onClick={saveAssignments}
                  isLoading={savingAssignments}
                  alignSelf="flex-end"
                >
                  Update Keyholders
                </RoundedButton>
              </Flex>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Container>
  );
}
