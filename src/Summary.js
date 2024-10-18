import {
  Card,
  CardBody,
  Heading,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(duration);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

const priceFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function Summary({ formik }) {
  const from = dayjs(formik.values.eventTimeFrom, ["HH:mm"]);
  const to = dayjs(formik.values.eventTimeTo, ["HH:mm"]);

  let duration = dayjs.duration(0, "h");
  if (from.isValid() && to.isValid()) {
    duration = dayjs.duration(to.diff(from));
  }

  let price = 0;
  if (duration.asHours() !== 0) {
    price = duration.asHours() * 25;
  }
  let discount = 0;
  if (duration.asHours() >= 5) {
    discount = 25;
  }

  return (
    <>
      <Heading>Summary</Heading>
      <Card>
        <CardBody>
          <TableContainer variant="simple">
            <Table>
              <TableCaption placement="top">
                <Heading>Hire Cost</Heading>
              </TableCaption>
              <Thead>
                <Tr>
                  <Th>Description</Th>
                  <Th>Price</Th>
                </Tr>
              </Thead>
              <Tbody>
                {duration.asHours() !== 0 ? (
                  <Tr>
                    <Td>Exclusive hire for {duration.asHours()} hours</Td>
                    <Td>{priceFormat.format(price)}</Td>
                  </Tr>
                ) : null}
                {discount !== 0 ? (
                  <Tr>
                    <Td>Fifth Hour Free!</Td>
                    <Td>{priceFormat.format(-discount)}</Td>
                  </Tr>
                ) : null}
                <Tr>
                  <Td>Refundable deposit</Td>
                  <Td>{priceFormat.format(100)}</Td>
                </Tr>
                <Tr>
                  <Th>Total Cost</Th>
                  <Td>{priceFormat.format(price + 100 - discount)}</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
      <Text size="l">
        Booking the hall requires acceptance of the Contract of Hire. Signing
        can either be done electronically, or via printed contract copies.
      </Text>
      <Text>Any other questions we want</Text>
    </>
  );
}

export default Summary;
