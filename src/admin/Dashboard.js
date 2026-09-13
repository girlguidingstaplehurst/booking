import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as ReactRouterLink, useLoaderData, useRevalidator } from "react-router-dom";
import dayjs from "dayjs";
import { AdminFetcher } from "../Fetcher";
import { markInvoicePaid } from "./components/invoiceActions";
import RoundedButton from "../components/RoundedButton";
import PageHeader from "./components/PageHeader";
import React from "react";

export async function populateDashboard() {
  return await AdminFetcher("/api/v1/admin/events", {
    events: [
      {
        id: "aaabbbccc",
        name: "Fake Event Right now",
        from: dayjs().startOf("hour").toDate(),
        to: dayjs().endOf("hour").toDate(),
        status: "provisional",
        contact: "Evan T. Booking",
        email: "evan.t.booking@example.org",
        assignee: "",
        keyholderIn: "",
        keyholderOut: "",
        invoices: [],
      },
      {
        id: "dddeeefff",
        name: "Now that's what I call a Fake Event",
        from: dayjs().startOf("hour").toDate(),
        to: dayjs().endOf("hour").toDate(),
        status: "approved",
        contact: "Evan T. Booking",
        email: "evan.t.booking@example.org",
        assignee: "booking@kathielambcentre.org",
        keyholderIn: "booking@kathielambcentre.org",
        keyholderOut: "booking@kathielambcentre.org",
        invoices: [
          { id: "invoice-1", reference: "INV-001", status: "raised" },
          { id: "invoice-2", reference: "INV-002", status: "paid" },
        ],
      },
      {
        id: "ggghhhiii",
        name: "Awaiting Documents Fake Event",
        from: dayjs().add(2, "days").startOf("hour").toDate(),
        to: dayjs().add(2, "days").add(2, "hours").toDate(),
        status: "awaiting documents",
        contact: "Evan T. Booking",
        email: "evan.t.booking@example.org",
        assignee: "booking@kathielambcentre.org",
        keyholderIn: "booking@kathielambcentre.org",
        keyholderOut: "booking@kathielambcentre.org",
        invoices: [],
      },
    ],
    eventGroups: [
      {
        id: "group-1",
        name: "Weekly Group Event",
        from: dayjs().add(1, "day").startOf("hour").toDate(),
        to: dayjs().add(1, "day").endOf("hour").toDate(),
      },
    ],
  });
}

export function normalizeDashboardData(data) {
  return {
    ...data,
    events: (data?.events || []).map((event) => ({
      ...event,
      invoices: event.invoices || [],
    })),
    eventGroups: (data?.eventGroups || []).map((group) => ({
      ...group,
      invoices: group.invoices || [],
    })),
  };
}

export function isEventOnOrAfterToday(event, today = dayjs()) {
  return !dayjs(event.to).isBefore(today, "day");
}

export function isEventActiveToday(event, today = dayjs()) {
  const start = dayjs(event.from);
  const end = dayjs(event.to);
  return !start.isAfter(today, "day") && !end.isBefore(today, "day");
}

export function getRemainingEventGroups(events, eventGroups, today = dayjs()) {
  return eventGroups
    .map((group) => ({
      ...group,
      sessions: events
        .filter((event) => event.eventGroupID === group.id)
        .filter((event) => isEventOnOrAfterToday(event, today))
        .sort((a, b) => dayjs(a.from).valueOf() - dayjs(b.from).valueOf()),
    }))
    .filter((group) => group.sessions.length > 0);
}

export function getBookedEvents(events, sections, today = dayjs()) {
  const workflowEventIDs = new Set(
    sections.flatMap((section) => section.events.map((event) => event.id)),
  );

  return events
    .filter((event) => event.status === "approved")
    .filter((event) => !event.eventGroupID)
    .filter((event) => !workflowEventIDs.has(event.id))
    .filter((event) => isEventOnOrAfterToday(event, today))
    .sort((a, b) => dayjs(a.from).valueOf() - dayjs(b.from).valueOf());
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

export function Dashboard() {
  const eventsList = normalizeDashboardData(useLoaderData());
  const revalidator = useRevalidator();
  const [payingInvoiceIDs, setPayingInvoiceIDs] = React.useState(() => new Set());
  const [paymentError, setPaymentError] = React.useState("");

  const sections = [
    {
      title: "Events awaiting approval",
      events: eventsList.events.filter((event) => event.status !== "approved"),
    },
    {
      title: "Outstanding invoices",
      events: eventsList.events.filter((event) =>
        event.invoices?.some((invoice) => invoice.status !== "paid"),
      ),
      eventGroups: (eventsList.eventGroups || []).filter((group) =>
        group.invoices?.some((invoice) => invoice.status !== "paid"),
      ),
    },
    {
      title: "Events to be invoiced",
      events: eventsList.events.filter(
        (event) =>
          event.status === "approved" &&
          !event.eventGroupID &&
          (!event.invoices || event.invoices.length === 0),
      ),
      eventGroups: (eventsList.eventGroups || []).filter(
        (group) => !group.invoices || group.invoices.length === 0,
      ),
    },
    {
      title: "Needing keyholders",
      events: eventsList.events.filter(
        (event) =>
          event.status === "approved" &&
          (!event.keyholderIn || !event.keyholderOut),
      ),
    },
  ];
  const remainingEventGroups = getRemainingEventGroups(
    eventsList.events,
    eventsList.eventGroups || [],
  );
  const bookedEvents = getBookedEvents(eventsList.events, sections);

  const sortedEvents = (events) =>
    [...events].sort(
      (a, b) => dayjs(a.from).valueOf() - dayjs(b.from).valueOf(),
    );

  const eventCard = (event, sectionTitle) => {
    const from = dayjs(event.from);
    const to = dayjs(event.to);
    const isPast = to.isBefore(dayjs());
    const isActiveToday = isEventActiveToday(event);

    return (
      <Box key={event.id} borderRadius="md" overflow="hidden" boxShadow="md">
        <Box
          backgroundColor={
            sectionTitle === "Booked events" && isActiveToday
              ? "purple.600"
              : isPast
                ? "red.600"
                : "brand.900"
          }
          padding={5}
        >
          <Text as="span" color="white" fontSize="xl" fontWeight="bold">
            {event.name}
          </Text>
          <Text color="brand.300" fontSize="md" fontWeight="bold">
            Event
          </Text>
        </Box>
        <Box backgroundColor="white" padding={5}>
          <Text color="brand.900" fontSize="lg" fontWeight="semibold">
            {from.format("ddd MMM D")}
          </Text>
          <Text color="brand.300" fontSize="lg" marginTop={2}>
            {`${from.format("h:mm A")} - ${to.format("h:mm A")}`}
          </Text>
          {sectionTitle === "Outstanding invoices" && (
            <Box marginTop={4}>
              <Heading size="s" marginBottom={2}>
                Invoices
              </Heading>
              <Stack spacing={2}>
                {event.invoices.map((invoice) => (
                  <Flex key={invoice.id} alignItems="center" gap={2}>
                    <Button
                      as={ReactRouterLink}
                      to={`/admin/invoice/${invoice.id}`}
                      colorScheme={getInvoiceColorScheme(invoice.status)}
                      flex={1}
                      justifyContent="flex-start"
                    >
                      {invoice.reference} - {invoice.status}
                    </Button>
                    {invoice.status !== "paid" && (
                      <RoundedButton
                        isLoading={payingInvoiceIDs.has(invoice.id)}
                        isDisabled={payingInvoiceIDs.has(invoice.id)}
                        onClick={() => payInvoice(invoice.id)}
                      >
                        Mark Paid
                      </RoundedButton>
                    )}
                  </Flex>
                ))}
              </Stack>
            </Box>
          )}
          <Flex alignItems="center" marginTop={4}>
            <ButtonGroup>
              {sectionTitle === "Events to be invoiced" && (
                <RoundedButton
                  as={ReactRouterLink}
                  to={`/admin/create-invoice?events=${event.id}`}
                >
                  Create Invoice
                </RoundedButton>
              )}
              <RoundedButton
                as={ReactRouterLink}
                to={`/admin/review/${event.id}`}
              >
                Review
              </RoundedButton>
            </ButtonGroup>
          </Flex>
        </Box>
      </Box>
    );
  };

  const eventGroupCard = (group, sectionTitle) => (
    <Box key={group.id} borderRadius="md" overflow="hidden" boxShadow="md">
      <Box backgroundColor="brand.300" padding={5}>
        <Text color="brand.900" fontSize="xl" fontWeight="bold">
          {group.name}
        </Text>
        <Text color="white" fontSize="md" fontWeight="bold">
          Event Group
        </Text>
      </Box>
      <Box backgroundColor="white" padding={5}>
        <Text color="brand.900" fontSize="lg" fontWeight="semibold">
          {dayjs(group.from).format("ddd MMM D")}
        </Text>
        <Text color="brand.300" fontSize="lg" marginTop={2}>
          {`${dayjs(group.from).format("h:mm A")} - ${dayjs(group.to).format("h:mm A")}`}
        </Text>
        {sectionTitle === "Outstanding invoices" && (
          <Box marginTop={4}>
            <Heading size="s" marginBottom={2}>
              Invoices
            </Heading>
            <Stack spacing={2}>
              {group.invoices.map((invoice) => (
                <Flex key={invoice.id} alignItems="center" gap={2}>
                  <Button
                    as={ReactRouterLink}
                    to={`/admin/invoice/${invoice.id}`}
                    colorScheme={getInvoiceColorScheme(invoice.status)}
                    flex={1}
                    justifyContent="flex-start"
                  >
                    {invoice.reference} - {invoice.status}
                  </Button>
                    {invoice.status !== "paid" && (
                      <RoundedButton
                        isLoading={payingInvoiceIDs.has(invoice.id)}
                        isDisabled={payingInvoiceIDs.has(invoice.id)}
                        onClick={() => payInvoice(invoice.id)}
                      >
                        Mark Paid
                      </RoundedButton>
                    )}
                </Flex>
              ))}
            </Stack>
          </Box>
        )}
        <ButtonGroup marginTop={4}>
          {sectionTitle === "Event groups with remaining sessions" && (
            <RoundedButton
              as={ReactRouterLink}
              to={`/admin/review-group/${group.id}`}
            >
              Review
            </RoundedButton>
          )}
          {sectionTitle !== "Event groups with remaining sessions" && (
            <RoundedButton
              as={ReactRouterLink}
              to={`/admin/create-invoice?eventGroup=${group.id}`}
            >
              Create Invoice
            </RoundedButton>
          )}
        </ButtonGroup>
      </Box>
    </Box>
  );

  const payInvoice = async (invoiceID) => {
    if (payingInvoiceIDs.has(invoiceID)) return;
    setPaymentError("");
    setPayingInvoiceIDs((invoiceIDs) => new Set(invoiceIDs).add(invoiceID));
    try {
      const response = await markInvoicePaid(invoiceID);
      if (!response?.ok) {
        let message = "Unable to mark invoice as paid.";
        if (response) {
          const error = await response.json();
          message = error.error_message || message;
        }
        setPaymentError(message);
        return;
      }
      revalidator.revalidate();
    } catch (error) {
      setPaymentError("Unable to mark invoice as paid.");
    } finally {
      setPayingInvoiceIDs((invoiceIDs) => {
        const nextInvoiceIDs = new Set(invoiceIDs);
        nextInvoiceIDs.delete(invoiceID);
        return nextInvoiceIDs;
      });
    }
  };

  return (
    <Container maxW="4xl">
      <Stack spacing={6}>
        <PageHeader title="Dashboard">
          <RoundedButton as={ReactRouterLink} to="/admin/create-events">
            Create events
          </RoundedButton>
          <RoundedButton as={ReactRouterLink} to="/admin/create-event-group">
            Create event group
          </RoundedButton>
        </PageHeader>
        {paymentError && <Text color="red.500">{paymentError}</Text>}
        {sections.map(
          (section) =>
            (section.events.length > 0 || section.eventGroups?.length > 0) && (
              <Box key={section.title}>
                <Heading size="md" marginBottom={4}>
                  {section.title}
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {sortedEvents(section.events).map((event) =>
                    eventCard(event, section.title),
                  )}
                  {section.eventGroups?.map((group) =>
                    eventGroupCard(group, section.title),
                  )}
                </SimpleGrid>
              </Box>
            ),
        )}
        {remainingEventGroups.length > 0 && (
          <Box>
            <Heading size="md" marginBottom={4}>
              Event groups with remaining sessions
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {remainingEventGroups.map((group) =>
                eventGroupCard(group, "Event groups with remaining sessions"),
              )}
            </SimpleGrid>
          </Box>
        )}
        {bookedEvents.length > 0 && (
          <Box>
            <Heading size="md" marginBottom={4}>
              Booked events
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {bookedEvents.map((event) => eventCard(event, "Booked events"))}
            </SimpleGrid>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
