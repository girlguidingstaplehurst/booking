import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  Container,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import React from "react";
import { useNavigate } from "react-router-dom";
import { listInvoiceableEvents } from "../Fetcher";
import { ContactAutocomplete } from "./components/ContactAutocomplete";
import PageHeader from "./components/PageHeader";

export function ContactInvoice() {
  const navigate = useNavigate();
  const [contactName, setContactName] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [events, setEvents] = React.useState([]);
  const [selectedIDs, setSelectedIDs] = React.useState(new Set());
  const [loading, setLoading] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!contactEmail) {
      setEvents([]);
      setSelectedIDs(new Set());
      setLoaded(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setLoaded(false);
    setSelectedIDs(new Set());
    listInvoiceableEvents(contactEmail).then((data) => {
      if (!mounted) return;
      setEvents((data?.events || []).slice().sort((a, b) =>
        dayjs(a.from).valueOf() - dayjs(b.from).valueOf(),
      ));
      if (data?.contact?.name) setContactName(data.contact.name);
      setLoading(false);
      setLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, [contactEmail]);

  const toggleEvent = (eventID) => {
    setSelectedIDs((current) => {
      const next = new Set(current);
      if (next.has(eventID)) next.delete(eventID);
      else next.add(eventID);
      return next;
    });
  };

  const selectAll = (event) => {
    setSelectedIDs(event.target.checked ? new Set(events.map((item) => item.id)) : new Set());
  };

  const continueToInvoice = () => {
    if (selectedIDs.size === 0) return;
    navigate(`/admin/create-invoice?events=${encodeURIComponent([...selectedIDs].join(","))}`);
  };

  return (
    <Container maxW="4xl">
      <Stack spacing={4}>
        <PageHeader title="Invoice by contact" />
        <ContactAutocomplete
          name={contactName}
          email={contactEmail}
          onNameChange={(event) => setContactName(event.target.value)}
          onEmailChange={(event) => setContactEmail(event.target.value)}
        />
        {loading && <Text>Loading invoiceable events...</Text>}
        {!loading && loaded && events.length === 0 && (
          <Alert status="info">
            <AlertIcon />
            This contact has no invoiceable individual events.
          </Alert>
        )}
        {!loading && events.length > 0 && (
          <Box background="white" padding={5} borderRadius="md" boxShadow="md">
            <Stack spacing={3}>
              <Heading size="m">Invoiceable events</Heading>
              <Checkbox
                isChecked={selectedIDs.size === events.length}
                isIndeterminate={selectedIDs.size > 0 && selectedIDs.size < events.length}
                onChange={selectAll}
              >
                Select all ({events.length})
              </Checkbox>
              {events.map((event) => (
                <Checkbox
                  key={event.id}
                  isChecked={selectedIDs.has(event.id)}
                  onChange={() => toggleEvent(event.id)}
                >
                  <Text as="span" fontWeight="semibold">{event.name}</Text>
                  <Text as="span" marginLeft={2}>
                    {dayjs(event.from).format("ddd D MMM YYYY h:mm A")} - {dayjs(event.to).format("h:mm A")}
                  </Text>
                </Checkbox>
              ))}
              <Text>{selectedIDs.size} event{selectedIDs.size === 1 ? "" : "s"} selected</Text>
              <Button
                colorScheme="green"
                onClick={continueToInvoice}
                isDisabled={selectedIDs.size === 0}
              >
                Create invoice
              </Button>
              {selectedIDs.size === 0 && (
                <Text role="alert">Select at least one event to create an invoice.</Text>
              )}
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
