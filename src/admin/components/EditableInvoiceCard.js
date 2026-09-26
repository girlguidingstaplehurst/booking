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
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { token } = useAuth();
  const isIndividual = preparation.mode === "individual";
  const isGroup = preparation.mode === "group";
  const isHourlyGroup = isGroup && !preparation.rate?.perSession?.length;
  const eventNames = preparation.events.map((event) => event.name).join(", ");

  const selectedEvents = (events) =>
    preparation.events.filter((event) => events.includes(event.id));

  const formik = useFormik({
    initialValues: {
      contact: preparation.contact,
      items: populateInvoiceItems(preparation),
      ...(preparation.eventGroup ? { eventGroup: preparation.eventGroup } : {}),
       events: preparation.events.map((event) => event.id),
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
      if (resp?.ok) {
        navigate("/admin");
      }
      return resp;
    },
  });

  const updateSelectedEvents = (events) => {
    const nextPreparation = { ...preparation, events: selectedEvents(events) };
    formik.setValues({
      ...formik.values,
      events,
      items: populateInvoiceItems(nextPreparation, formik.values.cleaningDeposit),
    });
  };

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
          {isHourlyGroup && (
            <Box marginTop={4}>
              <Checkbox
                isChecked={formik.values.events.length === preparation.events.length}
                isIndeterminate={formik.values.events.length > 0 && formik.values.events.length < preparation.events.length}
                onChange={(event) => updateSelectedEvents(event.target.checked ? preparation.events.map((item) => item.id) : [])}
              >
                Select all sessions ({preparation.events.length})
              </Checkbox>
              {preparation.events.map((event) => (
                <Checkbox
                  key={event.id}
                  display="block"
                  isChecked={formik.values.events.includes(event.id)}
                  onChange={() => updateSelectedEvents(
                    formik.values.events.includes(event.id)
                      ? formik.values.events.filter((id) => id !== event.id)
                      : [...formik.values.events, event.id],
                  )}
                >
                  {event.name}
                </Checkbox>
              ))}
              <Text>{formik.values.events.length} session{formik.values.events.length === 1 ? "" : "s"} selected</Text>
            </Box>
          )}
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
        <CardFooter>
          <ButtonGroup width="100%">
            <RoundedButton
              colorScheme="green"
              width="100%"
              isLoading={submitting}
              isDisabled={isGroup && formik.values.events.length === 0}
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
