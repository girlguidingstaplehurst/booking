import { Container, Stack } from "@chakra-ui/react";
import { useLoaderData } from "react-router-dom";
import { AdminFetcher } from "../Fetcher";
import { EditableInvoiceCard } from "./components/EditableInvoiceCard";
import PageHeader from "./components/PageHeader";
import dayjs from "dayjs";

function stubEvent(id, name, offsetHours = 0) {
  const from = dayjs().startOf("hour").add(offsetHours, "hours");
  return {
    id,
    name,
    from: from.toDate(),
    to: from.add(1, "hour").toDate(),
    status: "provisional",
    rate: 25,
    discountTable: {},
  };
}

export function buildInvoicePreparationsStub(eventIDs, eventGroup) {
  if (eventGroup) {
    return {
      preparations: [
        {
          mode: "group",
          contact: "group.contact@example.org",
          contactName: "Group Contact",
          name: `Fake Event Group (${eventGroup})`,
          eventGroup,
          rate: {
            id: "default",
            description: "External Hire Rate",
            hourlyRate: 25,
            discountTable: {},
            perSession: [],
          },
          events: [
            stubEvent("group-session-1", "Fake Event Group", 0),
            stubEvent("group-session-2", "Fake Event Group", 2),
          ],
        },
      ],
    };
  }

  const ids = (eventIDs || "fake-event").split(",").filter(Boolean);
  const events = ids.map((id, index) =>
    stubEvent(id, `Fake Event ${index + 1}`, index * 2),
  );
  return {
    preparations: [
      {
        mode: "individual",
        contact: "event.contact@example.org",
        contactName: "Event Contact",
        name: events.map((event) => event.name).join(", "),
        events,
      },
    ],
  };
}

export async function createInvoice(eventIDs, eventGroup) {
  const query = eventGroup ? `eventGroup=${eventGroup}` : `events=${eventIDs}`;
  return AdminFetcher(`/api/v1/admin/invoices/for-events?${query}`, {
    ...buildInvoicePreparationsStub(eventIDs, eventGroup),
  });
}

export function CreateInvoice() {
  const invoices = useLoaderData();

  return (
    <Container maxW="4xl">
      <Stack spacing={4}>
        <PageHeader title="Create invoice" />
        {(invoices.preparations || []).map((preparation) => (
          <EditableInvoiceCard
            key={`${preparation.mode}-${preparation.eventGroup || preparation.contact}`}
            preparation={preparation}
          />
        ))}
      </Stack>
    </Container>
  );
}
