import React from "react";
import { act } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  createMemoryRouter,
  RouterProvider,
} from "react-router-dom";
import { AdminPoster } from "../Poster";
import { Dashboard, normalizeDashboardData } from "./Dashboard";

jest.mock("../Poster", () => ({
  AdminPoster: jest.fn(),
}));

function renderDashboard(data, loader = jest.fn().mockResolvedValue(data)) {
  const router = createMemoryRouter([
    { path: "/", element: <Dashboard />, loader },
  ], { initialEntries: ["/"] });

  render(
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>,
  );

  return { loader, router };
}

const outstandingData = {
  events: [{
    id: "event-1",
    name: "Event",
    from: "2026-09-12T10:00:00Z",
    to: "2026-09-12T11:00:00Z",
    status: "approved",
    invoices: [{ id: "invoice-1", reference: "INV-001", status: "raised" }],
    keyholderIn: "in@example.org",
    keyholderOut: "out@example.org",
  }],
  eventGroups: [],
};

const approvalWorkflowData = {
  events: [
    {
      id: "provisional-event",
      name: "Provisional Event",
      from: "2026-09-12T10:00:00Z",
      to: "2026-09-12T11:00:00Z",
      status: "provisional",
      invoices: [],
      keyholderIn: "",
      keyholderOut: "",
    },
    {
      id: "approved-event",
      name: "Approved Event",
      from: "2026-09-13T10:00:00Z",
      to: "2026-09-13T11:00:00Z",
      status: "approved",
      invoices: [],
      keyholderIn: "",
      keyholderOut: "out@example.org",
    },
    {
      id: "awaiting-documents-event",
      name: "Awaiting Documents Event",
      from: "2026-09-14T10:00:00Z",
      to: "2026-09-14T11:00:00Z",
      status: "awaiting documents",
      invoices: [],
      keyholderIn: "",
      keyholderOut: "",
    },
  ],
  eventGroups: [],
};

describe("Dashboard invoice behavior", () => {
  beforeEach(() => {
    AdminPoster.mockReset();
  });

  test("normalizes missing invoice collections", () => {
    expect(normalizeDashboardData({
      events: [{ id: "event-1" }],
      eventGroups: [{ id: "group-1" }],
    })).toEqual({
      events: [{ id: "event-1", invoices: [] }],
      eventGroups: [{ id: "group-1", invoices: [] }],
    });
  });

  test("marks an invoice paid and refreshes Dashboard data", async () => {
    AdminPoster.mockResolvedValue({ ok: true });
    const { loader } = renderDashboard(outstandingData);

    await screen.findByRole("heading", { name: "Dashboard" });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Mark Paid" }));
    });

    await waitFor(() => expect(AdminPoster).toHaveBeenCalledWith(
      "/api/v1/admin/invoices/by-id/invoice-1/mark-as-paid",
      null,
    ));
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2));
  });

  test("shows payment failure and keeps the action available", async () => {
    AdminPoster.mockResolvedValue({
      ok: false,
      json: async () => ({ error_message: "Payment failed" }),
    });
    renderDashboard(outstandingData);

    await screen.findByRole("heading", { name: "Dashboard" });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Mark Paid" }));
    });

    expect(await screen.findByText("Payment failed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark Paid" })).toBeEnabled();
  });

  test("prevents duplicate payment submissions", async () => {
    let resolvePayment;
    AdminPoster.mockReturnValue(new Promise((resolve) => {
      resolvePayment = resolve;
    }));
    renderDashboard(outstandingData);

    await screen.findByRole("heading", { name: "Dashboard" });
    const button = screen.getByRole("button", { name: "Mark Paid" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(AdminPoster).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolvePayment({ ok: true });
    });
  });

  test("shows only approved individual events in invoice and keyholder workflows", async () => {
    renderDashboard(approvalWorkflowData);

    await screen.findByRole("heading", { name: "Dashboard" });

    const approvalSection = screen.getByRole("heading", { name: "Events awaiting approval" }).parentElement;
    const invoiceSection = screen.getByRole("heading", { name: "Events to be invoiced" }).parentElement;
    const keyholderSection = screen.getByRole("heading", { name: "Needing keyholders" }).parentElement;

    expect(within(approvalSection).getByText("Provisional Event")).toBeInTheDocument();
    expect(within(approvalSection).getByText("Awaiting Documents Event")).toBeInTheDocument();
    expect(within(invoiceSection).getByText("Approved Event")).toBeInTheDocument();
    expect(within(keyholderSection).getByText("Approved Event")).toBeInTheDocument();
    expect(within(invoiceSection).queryByText("Provisional Event")).not.toBeInTheDocument();
    expect(within(invoiceSection).queryByText("Awaiting Documents Event")).not.toBeInTheDocument();
    expect(within(keyholderSection).queryByText("Provisional Event")).not.toBeInTheDocument();
    expect(within(keyholderSection).queryByText("Awaiting Documents Event")).not.toBeInTheDocument();
  });

  test("does not show an approval action on Dashboard event cards", async () => {
    renderDashboard(approvalWorkflowData);

    await screen.findByRole("heading", { name: "Dashboard" });

    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Review" })).toHaveLength(4);
  });
});
