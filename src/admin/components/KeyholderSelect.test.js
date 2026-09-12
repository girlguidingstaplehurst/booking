import { render, screen, waitFor } from "@testing-library/react";
import { KeyholderSelect } from "./KeyholderSelect";

describe("KeyholderSelect", () => {
  afterEach(() => jest.restoreAllMocks());

  test("offers active names without exposing key numbers", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      status: 200,
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => [
        { id: "one", name: "Alice Smith", keyNumber: 12, active: true },
        { id: "two", name: "Bob Jones", keyNumber: 27, active: false },
      ],
    });

    render(<KeyholderSelect label="Keyholder" name="keyholder" value="" onChange={() => {}} />);

    await waitFor(() => expect(screen.getByRole("option", { name: "Alice Smith" })).toBeInTheDocument());
    expect(screen.getByRole("option", { name: "Unassigned" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Bob Jones" })).not.toBeInTheDocument();
    expect(screen.queryByText(/12|27/)).not.toBeInTheDocument();
  });
});
