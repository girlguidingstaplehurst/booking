import { render, screen, waitFor } from "@testing-library/react";
import { AdminFetcher } from "../../Fetcher";
import { RateSelect } from "./RateSelect";

jest.mock("../../Fetcher", () => ({
  AdminFetcher: jest.fn(),
}));

const rates = [
  {
    id: "hourly",
    description: "Hourly rate",
    hourlyRate: 25,
    pricingMode: "hourly",
    perSession: [],
  },
  {
    id: "progressive",
    description: "Progressive rate",
    hourlyRate: 0,
    pricingMode: "perSession",
    perSession: [{ count: 10, price: 150 }, { price: 13.5 }],
  },
  {
    id: "fixed",
    description: "Fixed rate",
    sessionPrice: 80,
    pricingMode: "fixedSession",
    perSession: [],
  },
];

const onChange = jest.fn();

describe("RateSelect", () => {
  beforeEach(() => {
    AdminFetcher.mockResolvedValue({ json: async () => rates });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("shows hourly and progressive rates by default", async () => {
    render(<RateSelect rateID="hourly" onChange={onChange} />);

    expect(await screen.findByRole("option", { name: /Hourly rate/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Progressive rate/ })).toBeInTheDocument();
  });

  test("shows fixed-session rates with their per-session price", async () => {
    render(<RateSelect rateID="hourly" onChange={onChange} />);

    expect(await screen.findByRole("option", { name: /Fixed rate - £80\/session/ })).toBeInTheDocument();
  });

  test("filters progressive rates when hourly-only mode is enabled", async () => {
    render(<RateSelect rateID="hourly" hourlyOnly onChange={onChange} />);

    expect(await screen.findByRole("option", { name: /Hourly rate/ })).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: /Progressive rate/ })).not.toBeInTheDocument(),
    );
  });

  test("preserves an existing progressive rate as a disabled option", async () => {
    render(
      <RateSelect
        rateID="progressive"
        hourlyOnly
        preserveCurrentRate
        onChange={onChange}
      />,
    );

    const option = await screen.findByRole("option", { name: /Progressive rate/ });
    expect(option).toBeDisabled();
    expect(screen.getByRole("option", { name: /Hourly rate/ })).toBeInTheDocument();
  });
});
