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
  Spacer,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { Link as ReactRouterLink, useLoaderData } from "react-router-dom";
import dayjs from "dayjs";
import { AdminFetcher } from "../Fetcher";

export async function manageInvoice(invoiceID) {
  return AdminFetcher("/api/v1/admin/invoices/by-id/" + invoiceID, {
    id: invoiceID,
    reference: "ABCDEF",
    sent: dayjs().startOf("hour").toDate(),
    paid: dayjs().endOf("hour").toDate(),
    status: "paid",
    contact: "evan.t.booking@example.org",
  });
}

export function ManageInvoice() {
  const invoice = useLoaderData();

  const isPaid = invoice.status === "paid";

  return (
    <Container maxW="4xl">
      <Stack spacing={4}>
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink as={ReactRouterLink} to="/admin">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Invoice "{invoice.reference}"</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
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
              <Flex>
                <Box>
                  <Heading size="s">Sent</Heading>
                  <Text>{dayjs(invoice.sent).toString()}</Text>
                </Box>
                <Spacer />
                <ButtonGroup>
                  <Button colorScheme="blue">Resend</Button>
                </ButtonGroup>
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
                    <Button colorScheme="blue">Mark Paid</Button>
                  </ButtonGroup>
                )}
              </Flex>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Container>
  );
}
