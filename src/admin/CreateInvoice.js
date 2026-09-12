import { Container, Stack } from "@chakra-ui/react";
import { useLoaderData } from "react-router-dom";
import { AdminFetcher } from "../Fetcher";
import dayjs from "dayjs";
import { EditableInvoiceCard } from "./components/EditableInvoiceCard";
import PageHeader from "./components/PageHeader";

export async function createInvoice(eventIDs, eventGroup) {
  const query = eventGroup ? `eventGroup=${eventGroup}` : `events=${eventIDs}`;
  return AdminFetcher(`/api/v1/admin/invoices/for-events?${query}`, {
    "even.t.booking@example.org": [
      {
        id: "aaabbbccc",
        name: "Fake Event Right now",
        from: dayjs().startOf("hour").toDate(),
        to: dayjs().startOf("hour").add(1, "hour").toDate(),
        status: "provisional",
        rate: 25.0,
        discountTable: {
          5: { type: "flat", value: 25 },
          10: { type: "flat", value: 50 },
        },
      },
      {
        id: "dddeeefff",
        name: "Now that's what I call a fake event",
        from: dayjs().startOf("hour").toDate(),
        to: dayjs().startOf("hour").add(5, "hours").toDate(),
        status: "provisional",
        rate: 25.0,
        discountTable: {
          5: { type: "flat", value: 25 },
        },
      },
    ],
    "a.n.otherperson@example.org": [
      {
        id: "aaabbbccc",
        name: "The only event",
        from: dayjs().startOf("hour").toDate(),
        to: dayjs().endOf("hour").toDate(),
        status: "provisional",
        rate: 25.0,
        discountTable: {
          5: { type: "flat", value: 25 },
        },
      },
    ],
  });
}

export function CreateInvoice() {
  const invoices = useLoaderData();

  return (
    <Container maxW="4xl">
      <Stack spacing={4}>
        <PageHeader title="Create invoice" />
        {Object.entries(invoices).map(([contact, events]) => (
          <EditableInvoiceCard
            key={contact}
            contact={contact}
            events={events}
            eventGroup={new URLSearchParams(window.location.search).get(
              "eventGroup",
            )}
          />
        ))}
      </Stack>
    </Container>
  );
}
