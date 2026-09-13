import {
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { Link as ReactRouterLink, useLoaderData, useParams } from "react-router-dom";
import { AdminFetcher } from "../Fetcher";
import PageHeader from "./components/PageHeader";
import { normalizeDashboardData, isEventOnOrAfterToday } from "./Dashboard";

export async function reviewEventGroup() {
  return AdminFetcher("/api/v1/admin/events", {
    events: [],
    eventGroups: [],
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
      return undefined;
  }
}

export function ReviewEventGroup() {
  const { groupID } = useParams();
  const data = normalizeDashboardData(useLoaderData());
  const group = data.eventGroups.find((eventGroup) => eventGroup.id === groupID);

  if (!group) {
    return (
      <Container maxW="4xl">
        <Stack spacing={4}>
          <PageHeader title="Review event group" />
          <Text>Event group not found.</Text>
        </Stack>
      </Container>
    );
  }

  const sessions = data.events
    .filter((event) => event.eventGroupID === group.id)
    .filter((event) => isEventOnOrAfterToday(event))
    .sort((a, b) => dayjs(a.from).valueOf() - dayjs(b.from).valueOf());

  return (
    <Container maxW="4xl">
      <Stack spacing={4}>
        <PageHeader title={`Review "${group.name}"`} />
        <Box backgroundColor="white" borderRadius="md" boxShadow="md" padding={5}>
          <Stack spacing={4}>
            <Box>
              <Heading size="m">{group.name}</Heading>
              <Text color="brand.300">
                {dayjs(group.from).format("ddd MMM D")} - {dayjs(group.to).format("ddd MMM D")}
              </Text>
            </Box>
            <Box>
              <Heading size="s" marginBottom={2}>Invoices</Heading>
              <Stack direction="row" flexWrap="wrap" gap={2}>
                {group.invoices.length > 0 ? group.invoices.map((invoice) => (
                  <Button
                    key={invoice.id}
                    as={ReactRouterLink}
                    to={`/admin/invoice/${invoice.id}`}
                    colorScheme={getInvoiceColorScheme(invoice.status)}
                  >
                    {invoice.reference} - {invoice.status}
                  </Button>
                )) : <Text>No invoices.</Text>}
              </Stack>
            </Box>
            <Button
              as={ReactRouterLink}
              to={`/admin/create-invoice?eventGroup=${group.id}`}
              colorScheme="green"
            >
              Create New Invoice
            </Button>
          </Stack>
        </Box>
        <Box>
          <Heading size="md" marginBottom={4}>Remaining sessions</Heading>
          {sessions.length === 0 ? (
            <Text>No remaining sessions.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {sessions.map((session) => (
                <Box key={session.id} backgroundColor="white" borderRadius="md" boxShadow="md" padding={5}>
                  <Text color="brand.900" fontSize="lg" fontWeight="semibold">
                    {dayjs(session.from).format("ddd MMM D")}
                  </Text>
                  <Text color="brand.300" marginTop={2}>
                    {`${dayjs(session.from).format("h:mm A")} - ${dayjs(session.to).format("h:mm A")}`}
                  </Text>
                  <Button
                    as={ReactRouterLink}
                    to={`/admin/review/${session.id}`}
                    marginTop={4}
                  >
                    Review Session
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Stack>
    </Container>
  );
}
