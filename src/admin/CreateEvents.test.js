import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CreateEvents } from "./CreateEvents";

jest.mock("../Poster", () => ({
  AdminPoster: jest.fn(),
}));

jest.mock("./components/DateTimeRangeAccumulator", () => () => null);

jest.mock("./components/KeyholderSelect", () => ({ KeyholderSelect: () => null }));

jest.mock("./components/RateSelect", () => ({
  RateSelect: ({ hourlyOnly }) => (
    <select aria-label="Hiring Rate" data-hourly-only={hourlyOnly ? "true" : "false"} />
  ),
}));

describe("CreateEvents", () => {
  test("accepts short details and allows all rate modes", () => {
    render(
      <MemoryRouter>
        <CreateEvents />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Event Details"), {
      target: { value: "Short details" },
    });
    fireEvent.blur(screen.getByLabelText("Event Details"));

    expect(screen.queryByText("too short")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Hiring Rate")).toHaveAttribute("data-hourly-only", "false");
    const submitButton = screen.getByRole("button", { name: "Create Events" });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveStyle({ width: "100%" });
  });

  test("rejects details longer than 50,000 characters", async () => {
    render(
      <MemoryRouter>
        <CreateEvents />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Event Details"), {
      target: { value: "x".repeat(50001) },
    });
    fireEvent.blur(screen.getByLabelText("Event Details"));

    expect(await screen.findByText("too long")).toBeInTheDocument();
  });
});
