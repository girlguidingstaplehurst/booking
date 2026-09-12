import { buildRateBody, fallbackRates, rateFormValues, rateLoader, rateSummary, ratesLoader } from "./Rates";

describe("rate data", () => {
  afterEach(() => jest.restoreAllMocks());

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
    expect(buildRateBody({ id: "standard", description: "Standard", hourlyRate: "25", pricingMode: "hourly" }, false)).toEqual({
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
});
