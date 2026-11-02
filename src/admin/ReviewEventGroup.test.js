import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import { useLoaderData, useParams } from "react-router-dom";
import { ReviewEventGroup } from "./ReviewEventGroup";

jest.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useLoaderData: jest.fn(),
  useParams: jest.fn(),
}));

function renderGroup(data, groupID = "group-1") {
  useLoaderData.mockReturnValue(data);
  useParams.mockReturnValue({ groupID });

  return render(
    <ChakraProvider>
      <ReviewEventGroup />
    </ChakraProvider>,
  );
}

describe("ReviewEventGroup", () => {
  test("shows remaining sessions and group invoice actions", () => {
    const today = dayjs().startOf("day");
    renderGroup({
      eventGroups: [{
        id: "group-1",
        name: "Summer Sessions",
        from: today.toISOString(),
        to: today.add(7, "day").toISOString(),
        createdAt: "2026-11-02T12:00:00Z",
        invoices: [{ id: "invoice-1", reference: "INV-001", status: "raised" }],
      }],
      events: [
        {
          id: "session-today",
          eventGroupID: "group-1",
          from: today.add(9, "hour").toISOString(),
          to: today.add(10, "hour").toISOString(),
        },
        {
          id: "session-completed",
          eventGroupID: "group-1",
          from: today.subtract(2, "day").toISOString(),
          to: today.subtract(1, "day").toISOString(),
        },
      ],
    });

    expect(screen.getByRole("heading", { name: 'Review "Summer Sessions"' })).toBeInTheDocument();
    expect(screen.getByText("Mon 2 Nov 2026 at 12:00")).toHaveAttribute(
      "datetime",
      "2026-11-02T12:00:00Z",
    );
    expect(screen.getByText("INV-001 - raised")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create New Invoice" })).toHaveAttribute(
      "href",
      "/admin/create-invoice?eventGroup=group-1",
    );
    expect(screen.getByRole("link", { name: "Review Session" })).toHaveAttribute(
      "href",
      "/admin/review/session-today",
    );
    expect(screen.getAllByRole("link", { name: "Review Session" })).toHaveLength(1);
  });

  test("renders an explicit state for an unknown group", () => {
    renderGroup({ events: [], eventGroups: [] }, "missing-group");

    expect(screen.getByText("Event group not found.")).toBeInTheDocument();
  });

  test("shows Unknown when the group's creation time is unavailable", () => {
    const today = dayjs().startOf("day");
    renderGroup({
      eventGroups: [{
        id: "group-1",
        name: "Historical Sessions",
        from: today.toISOString(),
        to: today.add(7, "day").toISOString(),
        invoices: [],
      }],
      events: [],
    });

    expect(screen.getByText("Created: Unknown")).toBeInTheDocument();
  });
});
