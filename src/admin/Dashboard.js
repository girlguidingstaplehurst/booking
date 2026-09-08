import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  ButtonGroup,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as ReactRouterLink, useLoaderData } from "react-router-dom";
import dayjs from "dayjs";
import { AdminFetcher } from "../Fetcher";
import RoundedButton from "../components/RoundedButton";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dayjsLocalizer(dayjs);

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
  const eventsList = useLoaderData();
  const calendarEvents = eventsList.events.map((event) => ({
    title: event.name,
    start: dayjs(event.from).toDate(),
    end: dayjs(event.to).toDate(),
    allDay: false,
    status: event.status,
  }));

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
    },
    {
      title: "Events to be invoiced",
      events: eventsList.events.filter(
        (event) =>
          !event.eventGroupID &&
          (!event.invoices || event.invoices.length === 0),
      ),
      eventGroups: eventsList.eventGroups || [],
    },
    {
      title: "Needing keyholders",
      events: eventsList.events.filter(
        (event) => !event.keyholderIn || !event.keyholderOut,
      ),
    },
  ];

  const sortedEvents = (events) =>
    [...events].sort(
      (a, b) => dayjs(a.from).valueOf() - dayjs(b.from).valueOf(),
    );

  const eventCard = (event, sectionTitle) => {
    const from = dayjs(event.from);
    const to = dayjs(event.to);
    const isPast = to.isBefore(dayjs());

    return (
      <Box key={event.id} borderRadius="md" overflow="hidden" boxShadow="md">
        <Box backgroundColor={isPast ? "red.600" : "brand.900"} padding={5}>
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
                      <RoundedButton>Mark Paid</RoundedButton>
                    )}
                  </Flex>
                ))}
              </Stack>
            </Box>
          )}
          <Flex alignItems="center" marginTop={4}>
            <ButtonGroup>
              {sectionTitle === "Events awaiting approval" && (
                <RoundedButton>Approve</RoundedButton>
              )}
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

  const eventGroupCard = (group) => (
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
        <RoundedButton
          as={ReactRouterLink}
          to={`/admin/create-invoice?eventGroup=${group.id}`}
          marginTop={4}
        >
          Create Invoice
        </RoundedButton>
      </Box>
    </Box>
  );

  return (
    <Container maxW="4xl">
      <Stack spacing={6}>
        <Breadcrumb>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Box>
          <ButtonGroup>
            <RoundedButton as={ReactRouterLink} to={`/admin/create-events`}>
              Create Events
            </RoundedButton>
            <RoundedButton as={ReactRouterLink} to="/admin/create-event-group">
              Create Event Group
            </RoundedButton>
          </ButtonGroup>
        </Box>
        {sections.map(
          (section) =>
            (section.events.length > 0 || section.eventGroups?.length > 0) && (
              <Box key={section.title}>
                <Heading size="md" marginBottom={4}>
                  {section.title}
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {sortedEvents(section.events).map((event) =>
                    eventCard(event, section.title),
                  )}
                  {section.eventGroups?.map(eventGroupCard)}
                </SimpleGrid>
              </Box>
            ),
        )}
        <Box>
          <Heading size="md" marginBottom={4}>
            Event calendar
          </Heading>
          <Calendar
            localizer={localizer}
            defaultView="month"
            views={["month"]}
            events={calendarEvents}
            date={dayjs().toDate()}
            showMultiDayTimes
            style={{ height: "80vh" }}
          />
        </Box>
      </Stack>
    </Container>
  );
}
