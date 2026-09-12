import {
  Button,
  ButtonGroup,
  Box,
  Checkbox,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  IconButton,
  Input,
  Spacer,
  Table,
  TableContainer,
  Text,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useState } from "react";
import { TbTrash } from "react-icons/tb";
import { useFormik } from "formik";
import { NumericFormat } from "react-number-format";
import useAuth from "../useAuth";
import RoundedButton from "../../components/RoundedButton";
import { populateInvoiceItems } from "./invoiceCalculations";

const priceFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function EditableInvoiceCard({ preparation }) {
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuth();
  const isIndividual = preparation.mode === "individual";
  const eventNames = preparation.events.map((event) => event.name).join(", ");

  const formik = useFormik({
    initialValues: {
      contact: preparation.contact,
      items: populateInvoiceItems(preparation),
      ...(preparation.eventGroup ? { eventGroup: preparation.eventGroup } : {}),
      ...(!preparation.eventGroup
        ? { events: preparation.events.map((event) => event.id) }
        : {}),
      cleaningDeposit: false,
    }, // validationSchema: EventSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      const invoice = { ...values };
      delete invoice.cleaningDeposit;

      const resp = await fetch("/api/v1/admin/send-invoice", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(invoice),
      });

      setSubmitting(false);
      return resp;
    },
  });

  const totalCost = formik.values.items.reduce(
    (acc, item) => acc + item.cost,
    0,
  );

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <CardHeader>
          <Flex>
            <Box>
              <Heading size="m">{preparation.name || eventNames}</Heading>
              <Heading size="s">{preparation.contactName}</Heading>
              <Text>{preparation.contact}</Text>
              {isIndividual && <Text>{eventNames}</Text>}
            </Box>
            <Spacer />
            <Button
              onClick={() =>
                formik.setValues({
                  ...formik.initialValues,
                  items: populateInvoiceItems(preparation),
                })
              }
            >
              Reset
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <TableContainer variant="simple">
            <Table>
              <Thead>
                <Tr>
                  <Th />
                  <Th>Description</Th>
                  <Th textAlign="right" paddingRight={10}>
                    Price
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {formik.values.items.map((item, index) => (
                  <Tr key={index}>
                    <Td>
                      <IconButton
                        aria-label="Remove"
                        icon={<TbTrash />}
                        onClick={() =>
                          formik.setFieldValue(
                            "items",
                            formik.values.items.filter((_, i) => i !== index),
                          )
                        }
                      />
                    </Td>
                    <Td>
                      <Input
                        name={`items[${index}].description`}
                        value={item.description}
                        onChange={formik.handleChange}
                      />
                    </Td>
                    <Td textAlign="right">
                      <NumericFormat
                        value={item.cost}
                        allowNegative={true}
                        prefix="£"
                        decimalScale={2}
                        fixedDecimalScale={true}
                        thousandSeparator={true}
                        customInput={Input}
                        width="12ch"
                        textAlign="right"
                        onValueChange={({ floatValue }) => {
                          formik.setFieldValue(
                            `items[${index}].cost`,
                            floatValue,
                          );
                        }}
                      />
                    </Td>
                  </Tr>
                ))}
                <Tr>
                  <Td />
                  <Th>Total Cost</Th>
                  <Td textAlign="right" paddingRight={10}>
                    {priceFormat.format(totalCost)}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
          {isIndividual && (
            <Checkbox
              isChecked={formik.values.cleaningDeposit}
              onChange={(event) => {
                const enabled = event.target.checked;
                formik.setValues({
                  ...formik.values,
                  cleaningDeposit: enabled,
                  items: populateInvoiceItems(preparation, enabled),
                });
              }}
            >
              Add cleaning and damage deposit
            </Checkbox>
          )}
        </CardBody>
        <CardFooter minWidth="max-content">
          <Spacer />
          <ButtonGroup flex="0">
            <RoundedButton
              colorScheme="brand"
              isLoading={submitting}
              type="submit"
            >
              Send Invoice
            </RoundedButton>
          </ButtonGroup>
        </CardFooter>
      </Card>
    </form>
  );
}
