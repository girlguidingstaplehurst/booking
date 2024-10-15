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
    }]
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
      <Button colorScheme="blue">Hide Event Details on Public Website</Button>
    </Flex>) : (<Flex>
      <Box>
        <Heading size="s">Event Visibility</Heading>
        <Text>Event details hidden publicly</Text>
      </Box>
      <Spacer />
      <Button colorScheme="blue">Show Event Details on Public Website</Button>
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
                <ButtonGroup>
                  <Button colorScheme="blue">Assign to Me</Button>
                </ButtonGroup>
              </Flex>
              <Flex>
                <Box>
                  <Heading size="s">Event Dates and Times</Heading>
                  <Text>{eventDates}</Text>
                </Box>
                <Spacer />
                <ButtonGroup>
                  <Button colorScheme="blue">Update Dates and Times</Button>
                </ButtonGroup>
              </Flex>
              <Flex>
                <Box>
                  <Heading size="s">Event Contact</Heading>
                  <Text>
                    {event.contact} [{event.email}]
                  </Text>
                </Box>
                <Spacer />
                <ButtonGroup>
                  <Button colorScheme="blue">Update Event Contact</Button>
                </ButtonGroup>
              </Flex>
              {visibility}
              <Box>
                <Heading size="s">Hiring Rate</Heading>
                <Flex gap={2}>
                  <Box flex="1">
                    <Select>
                      <option value="external" selected>
                        External Hirer
                      </option>
                      <option value="regular-external">
                        Regular External Hirer
                      </option>
                      <option value="girlguiding">Girlguiding Hirer</option>
                      <option value="girlguiding-residential">
                        Girlguiding Residential
                      </option>
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
                  </Box>
                  <ButtonGroup>
                    {/*TODO enable this button if the select value has changed */}
                    <Button colorScheme="blue" isDisabled={true}>
                      Update
                    </Button>
                  </ButtonGroup>
                </Flex>
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
                        colorScheme="blue"
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
                <ButtonGroup>
                  <Button colorScheme="blue">Request Documents</Button>
                  <Button colorScheme="blue">Cancel Event</Button>
                </ButtonGroup>
              </Flex>
              <Flex>
                <Box>
                  <Heading size="s">Keyholders</Heading>
                  <Text>In: {event.keyholderIn}</Text>
                  <Text>Out: {event.keyholderOut}</Text>
                </Box>
                <Spacer />
                <ButtonGroup>
                  <Button colorScheme="blue">Update Keyholders</Button>
                </ButtonGroup>
              </Flex>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Container>);
}
