import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ContactInvoice } from "./ContactInvoice";
import { listContacts, listInvoiceableEvents } from "../Fetcher";

jest.mock("../Fetcher", () => ({
  listContacts: jest.fn(),
  listInvoiceableEvents: jest.fn(),
}));

const events = [
  {
    id: "event-1",
    name: "Earlier event",
    from: "2026-01-01T10:00:00Z",
    to: "2026-01-01T12:00:00Z",
  },
  {
    id: "event-2",
    name: "Later event",
    from: "2026-02-01T10:00:00Z",
    to: "2026-02-01T12:00:00Z",
  },
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/admin/invoice-by-contact"]}>
      <Routes>
        <Route path="/admin/invoice-by-contact" element={<ContactInvoice />} />
        <Route path="/admin/create-invoice" element={<div>Invoice preparation</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ContactInvoice", () => {
  beforeEach(() => {
    listContacts.mockResolvedValue([{ name: "Contact Person", email: "contact@example.org" }]);
    listInvoiceableEvents.mockResolvedValue({
      contact: { name: "Contact Person", email: "contact@example.org" },
      events,
    });
  });

  test("loads and displays invoiceable events for a selected contact", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "contact@example.org" },
    });

    expect(await screen.findByText("Earlier event")).toBeInTheDocument();
    expect(screen.getByText("Later event")).toBeInTheDocument();
    expect(listInvoiceableEvents).toHaveBeenCalledWith("contact@example.org");
  });

  test("selects all events and navigates with every selected ID", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "contact@example.org" },
    });
    await screen.findByText("Earlier event");

    fireEvent.click(screen.getByLabelText("Select all (2)"));
    expect(screen.getByText("2 events selected")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Create invoice" }));

    expect(await screen.findByText("Invoice preparation")).toBeInTheDocument();
  });

  test("shows an empty state when the contact has no invoiceable events", async () => {
    listInvoiceableEvents.mockResolvedValue({
      contact: { name: "Contact Person", email: "contact@example.org" },
      events: [],
    });
    renderPage();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "contact@example.org" },
    });

    expect(await screen.findByText("This contact has no invoiceable individual events.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create invoice" })).not.toBeInTheDocument();
  });

  test("does not allow continuation without a selected event", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "contact@example.org" },
    });
    await screen.findByText("Earlier event");

    expect(screen.getByRole("button", { name: "Create invoice" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Select at least one event");
  });
});
