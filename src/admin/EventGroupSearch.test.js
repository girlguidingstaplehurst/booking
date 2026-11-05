import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EventGroupSearch } from "./EventGroupSearch";
import { searchEventGroups } from "../Fetcher";

jest.mock("../Fetcher", () => ({
  searchEventGroups: jest.fn(),
}));

describe("EventGroupSearch", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    searchEventGroups.mockResolvedValue({
      json: async () => [{
        id: "group-1",
        name: "Summer Sessions",
        from: "2026-01-01T10:00:00Z",
        to: "2026-01-02T10:00:00Z",
        invoiceableSessionCount: 1,
      }],
    });
  });

  afterEach(() => jest.useRealTimers());

  test("does not search below three characters and searches as the user types", async () => {
    render(<MemoryRouter><EventGroupSearch /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Event Group Search"), { target: { value: "su" } });
    act(() => jest.advanceTimersByTime(300));
    expect(searchEventGroups).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Event Group Search"), { target: { value: "sum" } });
    act(() => jest.advanceTimersByTime(300));
    await act(async () => {});
    expect(searchEventGroups).toHaveBeenCalledWith("sum");
    expect(await screen.findByText("Summer Sessions")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review" })).toHaveAttribute("href", "/admin/review-group/group-1");
    expect(screen.getByRole("link", { name: "Create Invoice" })).toHaveAttribute(
      "href",
      "/admin/create-invoice?eventGroup=group-1",
    );
  });

  test("keeps Review but hides invoice creation when no sessions are invoiceable", async () => {
    searchEventGroups.mockResolvedValue({
      json: async () => [{
        id: "group-1",
        name: "Summer Sessions",
        from: "2026-01-01T10:00:00Z",
        to: "2026-01-02T10:00:00Z",
        invoiceableSessionCount: 0,
      }],
    });

    render(<MemoryRouter><EventGroupSearch /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Event Group Search"), { target: { value: "sum" } });
    act(() => jest.advanceTimersByTime(300));
    await act(async () => {});

    expect(await screen.findByText("Summer Sessions")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review" })).toHaveAttribute(
      "href",
      "/admin/review-group/group-1",
    );
    expect(screen.queryByRole("link", { name: "Create Invoice" })).not.toBeInTheDocument();
  });
});
