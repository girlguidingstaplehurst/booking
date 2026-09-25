import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { AdminPutter } from "../Poster";
import { ReviewEvent } from "./ReviewEvent";

jest.mock("react-router-dom", () => ({
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
  useLoaderData: jest.fn(),
  useRevalidator: jest.fn(),
}));

jest.mock("../Poster", () => ({
  AdminPoster: jest.fn(),
  AdminPutter: jest.fn(),
}));

jest.mock("./components/RateSelect", () => ({
  RateUpdater: ({ rateID }) => <div data-rate-id={rateID}>Rate updater</div>,
}));

jest.mock("./components/KeyholderSelect", () => ({
  KeyholderSelect: ({ label, name, value, onChange, currentName }) => (
    <label>
      {label}
      <select aria-label={label} name={name} value={value} onChange={onChange}>
        <option value="">Unassigned</option>
        {currentName && <option value={value}>{currentName}</option>}
      </select>
    </label>
  ),
}));

jest.mock("./components/TriggerModal", () => () => null);
jest.mock("./components/ActionButton", () => () => null);

const event = {
  id: "event-1",
  name: "Summer Camp",
  details: "Event details",
  from: "2026-09-12T09:00:00Z",
  to: "2026-09-12T11:00:00Z",
  status: "cancelled",
  visible: true,
  contact: "contact@example.org",
  email: "contact@example.org",
  assignee: "booking@example.org",
  keyholderIn: { id: "key-in", name: "Alex Booker" },
  keyholderOut: { id: "key-out", name: "Sam Smith" },
  invoices: [],
  rateID: "default",
};

function renderReviewEvent(overrides = {}) {
  useLoaderData.mockReturnValue({ ...event, ...overrides });
  useRevalidator.mockReturnValue({ revalidate: jest.fn() });

  return render(
    <ChakraProvider>
      <ReviewEvent />
    </ChakraProvider>,
  );
}

describe("ReviewEvent keyholders", () => {
  beforeEach(() => {
    AdminPutter.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("shows assignment controls without the duplicate summary column", () => {
    renderReviewEvent();

    expect(screen.getByLabelText("Keyholder in")).toBeInTheDocument();
    expect(screen.getByLabelText("Keyholder out")).toBeInTheDocument();
    expect(screen.queryByText("In: Alex Booker")).not.toBeInTheDocument();
    expect(screen.queryByText("Out: Sam Smith")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update Keyholders" })).toHaveStyle({
      borderRadius: "100px",
    });
  });

  test("saves assigned keyholders and revalidates", async () => {
    const revalidate = jest.fn();
    useLoaderData.mockReturnValue(event);
    useRevalidator.mockReturnValue({ revalidate });
    render(
      <ChakraProvider>
        <ReviewEvent />
      </ChakraProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Update Keyholders" }));

    await waitFor(() =>
      expect(AdminPutter).toHaveBeenCalledWith(
        "/api/v1/admin/events/event-1/keyholders",
        { keyholderIn: "key-in", keyholderOut: "key-out" },
      ),
    );
    expect(revalidate).toHaveBeenCalled();
  });

  test("shows an error when keyholder updates fail", async () => {
    AdminPutter.mockResolvedValue({ ok: false });
    renderReviewEvent({ keyholderIn: null, keyholderOut: null });

    fireEvent.click(screen.getByRole("button", { name: "Update Keyholders" }));

    expect(await screen.findByText("Unable to update keyholders.")).toBeInTheDocument();
    expect(screen.getByLabelText("Keyholder in")).toHaveValue("");
    expect(screen.getByLabelText("Keyholder out")).toHaveValue("");
  });

  test("updates event dates and revalidates", async () => {
    const revalidate = jest.fn();
    useLoaderData.mockReturnValue(event);
    useRevalidator.mockReturnValue({ revalidate });
    render(
      <ChakraProvider>
        <ReviewEvent />
      </ChakraProvider>,
    );

    fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2026-09-14" } });
    fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2026-09-14" } });
    fireEvent.click(screen.getByRole("button", { name: "Update Dates and Times" }));

    await waitFor(() => expect(AdminPutter).toHaveBeenCalledWith(
      "/api/v1/admin/events/event-1/dates",
      {
        from: "2026-09-14T09:00:00.000Z",
        to: "2026-09-14T11:00:00.000Z",
      },
    ));
    expect(revalidate).toHaveBeenCalled();
  });

  test("shows a date conflict without refreshing the event", async () => {
    AdminPutter.mockResolvedValue({
      ok: false,
      json: async () => ({ error_message: "a booking exists for these dates" }),
    });
    renderReviewEvent();

    fireEvent.click(screen.getByRole("button", { name: "Update Dates and Times" }));

    expect(await screen.findByText("a booking exists for these dates")).toBeInTheDocument();
    expect(useRevalidator().revalidate).not.toHaveBeenCalled();
  });
});
