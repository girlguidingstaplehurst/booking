import {
  Box,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  Spacer,
  Stack,
  StackDivider,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Text,
  Tr,
} from "@chakra-ui/react";
import {
  useLoaderData,
  useRevalidator,
} from "react-router-dom";
import dayjs from "dayjs";
import { AdminFetcher } from "../Fetcher";
import { useState } from "react";
import RoundedButton from "../components/RoundedButton";
import PageHeader from "./components/PageHeader";
import { markInvoicePaid } from "./components/invoiceActions";

const priceFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const dateFormat = (from, to) =>
  `${dayjs(from).format("ddd D MMM YYYY HH:mm")} - ${dayjs(to).format("HH:mm")}`;

export async function manageInvoice(invoiceID) {
  return AdminFetcher("/api/v1/admin/invoices/by-id/" + invoiceID, {
    id: invoiceID,
    reference: "ABCDEF",
    sent: dayjs().startOf("hour").toDate(),
    paid: dayjs().endOf("hour").toDate(),
    status: "raised",
    contact: "evan.t.booking@example.org",
  });
}

export function ManageInvoice() {
  const invoice = useLoaderData();
  const revalidator = useRevalidator();
  const [markingAsPaid, setMarkingAsPaid] = useState(false);
  const [error, setError] = useState("");

  const isPaid = invoice.status === "paid";
  const totalCost = (invoice.items || []).reduce((total, item) => total + item.cost, 0);

  return (
    <Container maxW="4xl">
      <Stack spacing={4}>
        <PageHeader title={`Invoice ${invoice.reference}`} />
        <Card>
          <CardHeader>
            <Heading size="m">Invoice {invoice.reference}</Heading>
          </CardHeader>
          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
              <Flex>
                <Box>
                  <Heading size="s">Contact</Heading>
                  <Text>{invoice.contact}</Text>
                </Box>
              </Flex>
              {invoice.eventGroup && (
                <Flex>
                  <Box>
                    <Heading size="s">Event group</Heading>
                    <Text>{invoice.eventGroup.name}</Text>
                    <Text>{dateFormat(invoice.eventGroup.from, invoice.eventGroup.to)}</Text>
                  </Box>
                </Flex>
              )}
              {invoice.events?.length > 0 && (
                <Box>
                  <Heading size="s">Events</Heading>
                  <Stack spacing={1}>
                    {invoice.events.map((event) => (
                      <Text key={event.id}>
                        {event.name} ({dateFormat(event.from, event.to)})
                      </Text>
                    ))}
                  </Stack>
                </Box>
              )}
              <Box>
                <Heading size="s">Invoiced items</Heading>
                <TableContainer>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Description</Th>
                        <Th isNumeric>Cost</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(invoice.items || []).map((item, index) => (
                        <Tr key={item.id || index}>
                          <Td>{item.description}</Td>
                          <Td isNumeric>{priceFormat.format(item.cost)}</Td>
                        </Tr>
                      ))}
                      <Tr>
                        <Th>Total cost</Th>
                        <Th isNumeric>{priceFormat.format(totalCost)}</Th>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
              <Flex>
                <Box>
                  <Heading size="s">Sent</Heading>
                  <Text>{dayjs(invoice.sent).toString()}</Text>
                </Box>
                <Spacer />
                {/*<ButtonGroup>*/}
                {/*  <RoundedButton colorScheme="brand">Resend</RoundedButton>*/}
                {/*</ButtonGroup>*/}
              </Flex>
              <Flex>
                <Box>
                  <Heading size="s">Paid</Heading>
                  <Text>
                    {isPaid ? dayjs(invoice.paid).toString() : "unpaid"}
                  </Text>
                </Box>
                <Spacer />
                {isPaid ? null : (
                  <ButtonGroup>
                    <RoundedButton
                      isLoading={markingAsPaid}
                      onClick={async () => {
                        setMarkingAsPaid(true);
                        setError("");
                        const response = await markInvoicePaid(invoice.id);
                        if (!response?.ok) {
                          setError("Unable to mark invoice as paid.");
                          setMarkingAsPaid(false);
                          return;
                        }
                        revalidator.revalidate();
                        setMarkingAsPaid(false);
                      }}
                    >
                      Mark Paid
                    </RoundedButton>
                  </ButtonGroup>
                )}
              </Flex>
              {error && <Text color="red.500">{error}</Text>}
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Container>
  );
}
