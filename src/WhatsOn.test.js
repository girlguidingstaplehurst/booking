import { render, screen } from "@testing-library/react";
import { useLoaderData } from "react-router-dom";
import WhatsOn from "./WhatsOn";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLoaderData: jest.fn(),
}));

jest.mock("./components/ManagedContent", () => () => null);

describe("What's On", () => {
  test("renders grouped and standalone display items with nested events", () => {
    useLoaderData.mockReturnValue({
      items: [
        {
          id: "group-1",
          type: "event_group",
          name: "Course",
          events: [
            { id: "event-1", name: "Session one", from: "2025-01-01T10:00:00Z", to: "2025-01-01T11:00:00Z" },
            { id: "event-2", name: "Session two", from: "2025-01-02T10:00:00Z", to: "2025-01-02T11:00:00Z" },
          ],
        },
        {
          id: "event-3",
          type: "event",
          name: "Standalone event",
          events: [{ id: "event-3", name: "Standalone event", from: "2025-01-03T10:00:00Z", to: "2025-01-03T11:00:00Z" }],
        },
      ],
    });

    render(<WhatsOn />);

    expect(screen.getByText("Course")).toBeInTheDocument();
    expect(screen.getByText("Wed Jan 1")).toBeInTheDocument();
    expect(screen.getByText("Thu Jan 2")).toBeInTheDocument();
    expect(screen.getByText("Standalone event")).toBeInTheDocument();
  });

  test("renders no event cards for an empty schedule", () => {
    useLoaderData.mockReturnValue({ items: [] });

    render(<WhatsOn />);

    expect(screen.queryByText("Session one")).not.toBeInTheDocument();
    expect(screen.queryByText("Standalone event")).not.toBeInTheDocument();
  });
});
