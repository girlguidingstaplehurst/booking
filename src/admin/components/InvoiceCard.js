import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Heading,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
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

function discountForDuration(duration, discountTable) {
  return 0;
}

export function InvoiceCard({ contact, events }) {
  const [checkboxState, setCheckboxState] = useState(
    Array(events.length).fill(true),
  );
  const totalCost = useMemo(
    () =>
      events.reduce((acc, event, index) => {
        const duration = dayjs
          .duration(dayjs(event.to).diff(event.from))
          .asHours();

        const discount = discountForDuration(duration, event.discountTable);

        const deposit = checkboxState[index] ? 100 : 0;

        const total = duration * event.rate - discount + deposit;
        return acc + total;
      }, 0),
    [events, checkboxState],
  );

  return (
    <Card>
      <CardHeader>
        <Heading size="m">{contact}</Heading>
      </CardHeader>
      <CardBody>
        <TableContainer variant="simple">
          <Table>
            <Thead>
              <Tr>
                <Th />
                <Th>Description</Th>
                <Th>Price</Th>
              </Tr>
            </Thead>
            {events.map((event, index) => {
              const duration = dayjs
                .duration(dayjs(event.to).diff(event.from))
                .asHours();
              const price = priceFormat.format(duration * event.rate);

              const discount = discountForDuration(
                duration,
                event.discountTable,
              );

              return (
                <Tbody key={event.id}>
                  <Tr>
                    <Th colSpan={3} align="center">
                      {event.name} ({dayjs(event.from).toString()} -{" "}
                      {dayjs(event.to).toString()}
                    </Th>
                  </Tr>
                  <Tr>
                    <Td />
                    <Td>Hire for {duration.toFixed(1)} hours</Td>
                    <Td>{price}</Td>
                  </Tr>
                  {discount !== 0 ? (
                    <Tr>
                      <Td />
                      <Td>Discount</Td>
                      <Td>{priceFormat.format(-discount)}</Td>
                    </Tr>
                  ) : null}
                  <Tr>
                    <Td>
                      <Checkbox
                        isChecked={checkboxState[index]}
                        onChange={(event) => {
                          let items = [...checkboxState];
                          items[index] = event.target.checked;
                          setCheckboxState(items);
                        }}
                      />
                    </Td>
                    <Td>
                      {checkboxState[index] ? (
                        "Refundable deposit"
                      ) : (
                        <s>Refundable deposit</s>
                      )}
                    </Td>
                    <Td>
                      {checkboxState[index] ? (
                        priceFormat.format(100)
                      ) : (
                        <s>{priceFormat.format(100)}</s>
                      )}
                    </Td>
                  </Tr>
                </Tbody>
              );
            })}
            <Tr>
              <Td />
              <Th>Total Cost</Th>
              <Td>{priceFormat.format(totalCost)}</Td>
            </Tr>
          </Table>
        </TableContainer>
      </CardBody>
      <CardFooter minWidth="max-content">
        <Spacer />
        <ButtonGroup flex="0">
          <Button colorScheme="blue">Send Invoice</Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
