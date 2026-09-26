import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { ManageInvoice } from "./ManageInvoice";

jest.mock("react-router-dom", () => ({
  useLoaderData: jest.fn(),
  useRevalidator: jest.fn(),
}));

jest.mock("./components/invoiceActions", () => ({
  markInvoicePaid: jest.fn(),
}));

const invoice = {
  id: "invoice-1",
  reference: "INV-001",
  contact: "customer@example.org",
  status: "raised",
  sent: "2026-09-12T08:00:00Z",
  items: [
    { id: "item-1", description: "Hall hire", cost: 120 },
    { id: "item-2", description: "Cleaning deposit", cost: 50 },
  ],
  events: [
    {
      id: "event-1",
      name: "Summer event",
      from: "2026-09-12T09:00:00Z",
      to: "2026-09-12T11:00:00Z",
    },
  ],
};

function renderInvoice(overrides = {}) {
  useLoaderData.mockReturnValue({ ...invoice, ...overrides });
  useRevalidator.mockReturnValue({ revalidate: jest.fn() });
  return render(
    <ChakraProvider>
      <ManageInvoice />
    </ChakraProvider>,
  );
}

describe("ManageInvoice", () => {
  test("shows invoice association, items, and total", () => {
    renderInvoice();

    expect(screen.getByText("Summer event", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Hall hire")).toBeInTheDocument();
    expect(screen.getByText("Cleaning deposit")).toBeInTheDocument();
    expect(screen.getByText("£120.00")).toBeInTheDocument();
    expect(screen.getByText("£50.00")).toBeInTheDocument();
    expect(screen.getByText("£170.00")).toBeInTheDocument();
  });

  test("shows an event group association and supports empty items", () => {
    renderInvoice({
      events: [],
      eventGroup: {
        id: "group-1",
        name: "Summer sessions",
        from: "2026-09-12T09:00:00Z",
        to: "2026-09-14T11:00:00Z",
      },
      items: [],
    });

    expect(screen.getByText("Summer sessions")).toBeInTheDocument();
    expect(screen.getByText("£0.00")).toBeInTheDocument();
  });
});
