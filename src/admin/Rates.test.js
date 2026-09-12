import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import {
  buildRateBody,
  fallbackRates,
  rateFormValues,
  rateLoader,
  rateSchema,
  rateSummary,
  ratesLoader,
  RateEditor,
} from "./Rates";
import { AdminPoster, AdminPutter } from "../Poster";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLoaderData: jest.fn(),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("../Poster", () => ({
  AdminPoster: jest.fn(),
  AdminPutter: jest.fn(),
}));

describe("rate data", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("loads rates from the admin API", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      status: 200,
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => [{ id: "default", description: "External", hourlyRate: 25, perSession: [] }],
    });

    await expect(ratesLoader()).resolves.toEqual([
      { id: "default", description: "External", hourlyRate: 25, perSession: [] },
    ]);
  });

  test("uses representative fallback rates when the API is unavailable", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("offline"));

    await expect(ratesLoader()).resolves.toEqual(fallbackRates);
  });

  test("selects a rate for editing", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      status: 200,
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => [
        { id: "default", description: "External", hourlyRate: 25, perSession: [] },
        { id: "regular", description: "Regular", hourlyRate: 20, perSession: [] },
      ],
    });

    await expect(rateLoader({ params: { rateID: "regular" } })).resolves.toMatchObject({ id: "regular" });
  });

  test("builds an hourly-only rate body", () => {
    expect(buildRateBody({ id: " standard ", description: " Standard ", hourlyRate: "25", pricingMode: "hourly" }, false)).toEqual({
      id: "standard",
      description: "Standard",
      hourlyRate: 25,
      perSession: [],
    });
  });

  test("builds a progressive per-session rate body", () => {
    expect(buildRateBody({
      id: "standard",
      description: "Standard",
      hourlyRate: "25",
      pricingMode: "perSession",
      sessionCount: "10",
      sessionPrice: "150",
      extraSessionPrice: "13.5",
    }, false).perSession).toEqual([
      { count: 10, price: 150 },
      { price: 13.5 },
    ]);
  });

  test("populates edit fields from progressive pricing", () => {
    expect(rateFormValues({
      id: "standard",
      description: "Standard",
      hourlyRate: 25,
      perSession: [{ count: 10, price: 150 }, { price: 13.5 }],
    })).toMatchObject({
      id: "standard",
      pricingMode: "perSession",
      sessionCount: 10,
      sessionPrice: 150,
      extraSessionPrice: 13.5,
    });
  });

  test("summarizes hourly pricing", () => {
    expect(rateSummary({ hourlyRate: 25, perSession: [] })).toBe("£25.00 / hour");
  });

  test("summarizes progressive pricing", () => {
    expect(rateSummary({ perSession: [{ count: 10, price: 150 }, { price: 13.5 }] })).toBe(
      "10 sessions for £150, £13.50 thereafter",
    );
  });

  test("validates hourly and progressive pricing rules", async () => {
    await expect(rateSchema.validate({
      id: "rate",
      description: "Rate",
      pricingMode: "hourly",
      hourlyRate: -1,
    })).rejects.toThrow("Must not be negative");

    await expect(rateSchema.validate({
      id: "rate",
      description: "Rate",
      pricingMode: "perSession",
      sessionCount: 1.5,
      sessionPrice: 10,
      extraSessionPrice: 2,
    })).rejects.toThrow("Must be a whole number");

    await expect(rateSchema.validate({
      id: "rate",
      description: "Rate",
      pricingMode: "hourly",
      hourlyRate: 25,
    })).resolves.toMatchObject({ hourlyRate: 25 });
  });
});

describe("RateEditor", () => {
  const navigate = jest.fn();

  beforeEach(() => {
    useLoaderData.mockReturnValue(undefined);
    useParams.mockReturnValue({});
    useNavigate.mockReturnValue(navigate);
    AdminPoster.mockResolvedValue({ ok: true });
    AdminPutter.mockResolvedValue({ ok: true });
  });

  function fillHourlyRate() {
    fireEvent.change(screen.getByLabelText("ID"), { target: { value: "standard" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Standard" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Hourly rate" }), { target: { value: "25" } });
  }

  test("starts with Save disabled and shows field feedback after interaction", async () => {
    render(<RateEditor />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Save rate" })).toBeDisabled());

    fireEvent.blur(screen.getByLabelText("Description"));

    await waitFor(() => expect(screen.getByText("Required")).toBeInTheDocument());
    expect(screen.getByLabelText("Description")).toBeInvalid();
  });

  test("validates progressive fields without validating inactive hourly fields", async () => {
    render(<RateEditor />);

    fireEvent.click(screen.getByLabelText("Progressive per-session pricing"));
    fireEvent.blur(screen.getByLabelText("Session count"));

    await waitFor(() => expect(screen.getAllByText("Required").length).toBeGreaterThan(0));
    expect(screen.queryByRole("spinbutton", { name: "Hourly rate" })).not.toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Session count" })).toBeInvalid();
  });

  test("enables Save after correcting a valid hourly form", async () => {
    render(<RateEditor />);

    fillHourlyRate();

    await waitFor(() => expect(screen.getByRole("button", { name: "Save rate" })).toBeEnabled());
  });

  test("shows a server error and allows retry", async () => {
    AdminPoster.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error_message: "a rate with that identifier already exists" }),
    });
    render(<RateEditor />);
    fillHourlyRate();

    const save = screen.getByRole("button", { name: "Save rate" });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);

    await waitFor(() => expect(screen.getByText("a rate with that identifier already exists")).toBeInTheDocument());
    expect(save).toBeEnabled();
  });

  test("prevents duplicate submissions while saving", async () => {
    let resolveRequest;
    AdminPoster.mockImplementation(() => new Promise((resolve) => {
      resolveRequest = resolve;
    }));
    render(<RateEditor />);
    fillHourlyRate();

    const save = screen.getByRole("button", { name: "Save rate" });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);
    await waitFor(() => expect(AdminPoster).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: /Save rate/ }));

    expect(AdminPoster).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /Save rate/ })).toBeDisabled();
    resolveRequest({ ok: true });
  });
});
