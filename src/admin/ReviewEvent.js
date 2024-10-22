import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  Select,
  Spacer,
  Stack,
  StackDivider,
  Text
} from "@chakra-ui/react";
import { Link as ReactRouterLink, useLoaderData } from "react-router-dom";
import dayjs from "dayjs";
import { AdminFetcher } from "../Fetcher";
import RoundedButton from "../components/RoundedButton";
import { Form, Formik, useFormik } from "formik";
import { useFetcher } from "@mongez/react-hooks";
import RateSelect from "./components/RateSelect";

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
    assignee: "bookings@kathielambcentre.org",
    keyholderIn: "bookings@kathielambcentre.org",
    keyholderOut: "bookings@kathielambcentre.org",
    invoices: [{
      reference: "ABCDEF", id: "ggghhhiii", status: "raised"
    }, {
      reference: "BCDEFG", id: "jjjkkklll", status: "paid"
    }, {
      reference: "CDEFGH", id: "mmmnnnooo", status: "cancelled"
    }],
    rateID: "default",
  });
}

function getInvoiceColorScheme(status) {
  switch(status) {
    case "raised": return "purple";
    case "paid": return "green";
    case "cancelled": return "red";
    default: return "";
  }
}

export function ReviewEvent() {
  const event = useLoaderData();

  const eventDates = `${dayjs(event.from).format("ddd D MMMM YYYY [at] HH:mm")} to ${dayjs(event.to).format("ddd D MMMM YYYY [at] HH:mm")}`;
  const visibility = event.visible ? (<Flex>
      <Box>
        <Heading size="s">Event Visibility</Heading>
        <Text>Event details visible publicly</Text>
      </Box>
      <Spacer />
    {/*<RoundedButton colorScheme="brand">Hide Event Details on Public Website</RoundedButton>*/}
    </Flex>) : (<Flex>
      <Box>
        <Heading size="s">Event Visibility</Heading>
        <Text>Event details hidden publicly</Text>
      </Box>
      <Spacer />
    {/*<RoundedButton colorScheme="brand">Show Event Details on Public Website</RoundedButton>*/}
    </Flex>);

  const hasInvoices = event.invoices !== undefined && event.invoices.length > 0;

  return (<Container maxW="4xl">
      <Stack spacing={4}>
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink as={ReactRouterLink} to="/admin">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Review "{event.name}"</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
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
                  <Text>{eventDates}</Text>
                </Box>
                <Spacer />
                {/*<ButtonGroup>*/}
                {/*  <RoundedButton colorScheme="brand">Update Dates and Times</RoundedButton>*/}
                {/*</ButtonGroup>*/}
              </Flex>
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
                <RateSelect eventID={event.id} rateID={event.rateID}/>
              </Box>
              <Flex>
                <Box>
                  <Heading size="s">Invoices</Heading>
                  <ButtonGroup>
                    {hasInvoices ? (
                      event.invoices.map((invoice) => (<Button
                          to={`/admin/invoice/${invoice.id}`}
                          as={ReactRouterLink}
                          colorScheme={getInvoiceColorScheme(invoice.status)}
                        >
                          {invoice.reference} - {invoice.status}
                      </Button>))) : (<Button
                        as={ReactRouterLink}
                        to={`/admin/create-invoice?events=${event.id}`}
                        colorScheme="brand"
                      >
                        Raise Invoice
                    </Button>)}
                  </ButtonGroup>
                </Box>
              </Flex>
              <Flex>
                <Box>
                  <Heading size="s">Event Status</Heading>
                  <Text>{event.status}</Text>
                </Box>
                <Spacer />
                {/*<ButtonGroup>*/}
                {/*  <RoundedButton colorScheme="brand">Request Documents</RoundedButton>*/}
                {/*  <RoundedButton colorScheme="brand">Cancel Event</RoundedButton>*/}
                {/*</ButtonGroup>*/}
              </Flex>
              <Flex>
                <Box>
                  <Heading size="s">Keyholders</Heading>
                  <Text>In: {event.keyholderIn}</Text>
                  <Text>Out: {event.keyholderOut}</Text>
                </Box>
                <Spacer />
                {/*<ButtonGroup>*/}
                {/*  <RoundedButton colorScheme="brand">Update Keyholders</RoundedButton>*/}
                {/*</ButtonGroup>*/}
              </Flex>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Container>);
}
