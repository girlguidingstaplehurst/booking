import React from "react";
import { act } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  createMemoryRouter,
  RouterProvider,
} from "react-router-dom";
import { AdminPoster } from "../Poster";
import dayjs from "dayjs";
import {
  Dashboard,
  getBookedEvents,
  getRemainingEventGroups,
  isEventActiveToday,
  normalizeDashboardData,
  DASHBOARD_SECTION_COOKIE,
  readDashboardSectionState,
} from "./Dashboard";

jest.mock("../Poster", () => ({
  AdminPoster: jest.fn(),
}));

const expandedSectionState = {
  awaitingApproval: true,
  outstandingInvoices: true,
  eventsToBeInvoiced: true,
  needingKeyholders: true,
  remainingEventGroups: true,
  bookedEvents: true,
};

function clearDashboardCookie() {
  document.cookie = `${DASHBOARD_SECTION_COOKIE}=; max-age=0`;
}

function renderDashboard(
  data,
  loader = jest.fn().mockResolvedValue(data),
  sectionState = expandedSectionState,
) {
  clearDashboardCookie();
  document.cookie = `${DASHBOARD_SECTION_COOKIE}=${encodeURIComponent(
    JSON.stringify(sectionState),
  )}`;
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
      eventGroups: [{ id: "group-1", invoices: [], invoiceableSessionCount: 1 }],
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

    const approvalSection = screen.getByRole("button", { name: /Events awaiting approval/ }).parentElement;
    const invoiceSection = screen.getByRole("button", { name: /Events to be invoiced/ }).parentElement;
    const keyholderSection = screen.getByRole("button", { name: /Needing keyholders/ }).parentElement;

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

  test("hides invoice creation from remaining-session groups but keeps it for invoice preparation", async () => {
    const groupData = {
      events: [{
        id: "group-session",
        eventGroupID: "group-1",
        from: dayjs().add(1, "day").toISOString(),
        to: dayjs().add(1, "day").add(1, "hour").toISOString(),
        status: "approved",
        invoices: [],
      }],
      eventGroups: [{
        id: "group-1",
        name: "Weekly Group",
        from: dayjs().toISOString(),
        to: dayjs().add(1, "day").toISOString(),
        invoices: [],
      }],
    };
    renderDashboard(groupData);

    await screen.findByRole("heading", { name: "Dashboard" });

    const remainingSection = screen.getByRole("button", {
      name: /Event groups with remaining sessions/,
    }).parentElement;
    const invoiceSection = screen.getByRole("button", {
      name: /Events to be invoiced/,
    }).parentElement;

    expect(within(remainingSection).getByText("Weekly Group")).toBeInTheDocument();
    expect(within(remainingSection).getByRole("link", { name: "Review" })).toHaveAttribute(
      "href",
      "/admin/review-group/group-1",
    );
    expect(within(remainingSection).queryByRole("link", { name: "Create Invoice" }))
      .not.toBeInTheDocument();
    expect(within(invoiceSection).getByRole("link", { name: "Create Invoice" })).toHaveAttribute(
      "href",
      "/admin/create-invoice?eventGroup=group-1",
    );
  });
});

describe("Dashboard section controls", () => {
  afterEach(() => {
    clearDashboardCookie();
  });

  test("starts sections collapsed and displays total counts", async () => {
    renderDashboard(outstandingData, undefined, {});

    const section = await screen.findByRole("button", { name: /Outstanding invoices/ });
    expect(section).toHaveAttribute("aria-expanded", "false");
    expect(section.parentElement).not.toHaveTextContent("INV-001");
    expect(section).toHaveTextContent("1");
  });

  test("toggles a section and persists its state", async () => {
    renderDashboard(outstandingData, undefined, {});

    const section = await screen.findByRole("button", { name: /Outstanding invoices/ });
    fireEvent.click(section);

    expect(section).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/INV-001/)).toBeInTheDocument();
  });

  test("restores partial preferences and defaults missing sections to collapsed", async () => {
    renderDashboard(outstandingData, undefined, { outstandingInvoices: true });

    const section = await screen.findByRole("button", { name: /Outstanding invoices/ });
    expect(section).toHaveAttribute("aria-expanded", "true");
    expect(section.parentElement).toHaveTextContent("INV-001");
  });

  test("falls back to collapsed sections for malformed preferences", async () => {
    clearDashboardCookie();
    document.cookie = `${DASHBOARD_SECTION_COOKIE}=not-json`;
    renderDashboard(outstandingData, undefined, {});

    const section = await screen.findByRole("button", { name: /Outstanding invoices/ });
    expect(section).toHaveAttribute("aria-expanded", "false");
  });

  test("omits the red badge when a section has no red-flagged items", async () => {
    const currentData = {
      events: [{
        id: "future-event",
        name: "Future Event",
        from: dayjs().add(1, "day").toISOString(),
        to: dayjs().add(1, "day").add(1, "hour").toISOString(),
        status: "approved",
        invoices: [{ id: "invoice-1", reference: "INV-001", status: "raised" }],
      }],
      eventGroups: [],
    };
    renderDashboard(currentData, undefined, {});

    const section = await screen.findByRole("button", { name: /Outstanding invoices/ });
    expect(section).toHaveTextContent("1");
    expect(section.querySelector('[data-testid="red-flag-count"]')).not.toBeInTheDocument();
  });

  test("shows a red badge for cancelled invoices", async () => {
    renderDashboard({
      events: [{
        ...outstandingData.events[0],
        from: dayjs().add(1, "day").toISOString(),
        to: dayjs().add(1, "day").add(1, "hour").toISOString(),
        invoices: [{ id: "invoice-1", reference: "INV-001", status: "cancelled" }],
      }],
      eventGroups: [],
    }, undefined, {});

    const section = await screen.findByRole("button", { name: /Outstanding invoices/ });
    const redBadge = section.querySelector('[data-testid="red-flag-count"]');
    expect(redBadge).toHaveTextContent("1");
    expect(redBadge).toHaveAttribute("data-testid", "red-flag-count");
  });
});

describe("Dashboard booked event sections", () => {
  const today = dayjs("2026-09-13T12:00:00Z");
  const workflowSections = [{ events: [{ id: "workflow-event" }] }];

  test("keeps groups with sessions ending today and hides completed groups", () => {
    const groups = getRemainingEventGroups(
      [
        {
          id: "today-session",
          eventGroupID: "active-group",
          from: "2026-09-13T09:00:00Z",
          to: "2026-09-13T10:00:00Z",
        },
        {
          id: "completed-session",
          eventGroupID: "completed-group",
          from: "2026-09-12T09:00:00Z",
          to: "2026-09-12T10:00:00Z",
        },
      ],
      [{ id: "active-group" }, { id: "completed-group" }],
      today,
    );

    expect(groups.map((group) => group.id)).toEqual(["active-group"]);
    expect(groups[0].sessions.map((session) => session.id)).toEqual(["today-session"]);
  });

  test("shows approved ungrouped events not already in workflow sections", () => {
    const events = getBookedEvents(
      [
        {
          id: "workflow-event",
          status: "approved",
          to: "2026-09-20T10:00:00Z",
        },
        {
          id: "future-event",
          status: "approved",
          from: "2026-09-20T09:00:00Z",
          to: "2026-09-20T10:00:00Z",
        },
        {
          id: "ended-event",
          status: "approved",
          from: "2026-09-12T09:00:00Z",
          to: "2026-09-12T10:00:00Z",
        },
        {
          id: "group-session",
          status: "approved",
          eventGroupID: "group-1",
          to: "2026-09-20T10:00:00Z",
        },
      ],
      workflowSections,
      today,
    );

    expect(events.map((event) => event.id)).toEqual(["future-event"]);
  });

  test("treats multi-day and today-ending events as active today", () => {
    expect(isEventActiveToday({
      from: "2026-09-12T09:00:00Z",
      to: "2026-09-13T10:00:00Z",
    }, today)).toBe(true);
    expect(isEventActiveToday({
      from: "2026-09-14T09:00:00Z",
      to: "2026-09-14T10:00:00Z",
    }, today)).toBe(false);
  });
});
