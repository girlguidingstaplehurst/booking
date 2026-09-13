import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AdminPoster } from "../Poster";
import { CreateEventGroup } from "./CreateEventGroup";

jest.mock("../Poster", () => ({
  AdminPoster: jest.fn(),
}));

jest.mock("./components/RateSelect", () => ({
  RateSelect: ({ hourlyOnly }) => (
    <select aria-label="Rate" data-hourly-only={hourlyOnly ? "true" : "false"} />
  ),
}));

describe("CreateEventGroup", () => {
  beforeEach(() => {
    sessionStorage.setItem("token", JSON.stringify("test-token"));
    jest.spyOn(global, "fetch").mockResolvedValue({
      status: 200,
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => [
        { id: "one", name: "Alice Smith", active: true },
      ],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    sessionStorage.clear();
  });

  test("rejects an unassigned event group before sending the request", async () => {
    render(
      <MemoryRouter>
        <CreateEventGroup />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Event Title"), {
      target: { value: "Weekly meeting" },
    });
    fireEvent.change(screen.getByLabelText("Event Details"), {
      target: { value: "Meeting details" },
    });
    fireEvent.change(screen.getByLabelText("Event date"), {
      target: { value: "2026-10-05" },
    });
    fireEvent.change(screen.getByLabelText("From"), {
      target: { value: "18:00" },
    });
    fireEvent.change(screen.getByLabelText("To"), {
      target: { value: "20:00" },
    });
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Alex Booker" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alex@example.com" },
    });

    expect(screen.getByRole("option", { name: "Unassigned" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Create Event Group" }));

    expect(await screen.findByText("Required")).toBeInTheDocument();
    expect(screen.queryByText("too short")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Rate")).toHaveAttribute("data-hourly-only", "false");
    expect(screen.getByRole("button", { name: "Create Event Group" })).toHaveStyle({ width: "100%" });
    expect(AdminPoster).not.toHaveBeenCalled();
  });

  test("rejects event details longer than 50,000 characters", async () => {
    render(
      <MemoryRouter>
        <CreateEventGroup />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Event Details"), {
      target: { value: "x".repeat(50001) },
    });
    fireEvent.blur(screen.getByLabelText("Event Details"));

    expect(await screen.findByText("too long")).toBeInTheDocument();
  });
});
