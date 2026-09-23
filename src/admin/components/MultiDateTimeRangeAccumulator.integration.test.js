import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MultiDateTimeRangeAccumulator from "./MultiDateTimeRangeAccumulator";

describe("MultiDateTimeRangeAccumulator", () => {
  test("supports two independent weekly date sets", async () => {
    const setter = jest.fn();

    render(<MultiDateTimeRangeAccumulator setter={setter} />);
    fireEvent.click(screen.getByRole("button", { name: "Add another date set" }));

    const weeklyControls = screen.getAllByLabelText("Repeat weekly");
    fireEvent.click(weeklyControls[0]);
    fireEvent.click(weeklyControls[1]);
    const firstDates = screen.getAllByLabelText("First meeting date");
    const repeatUntil = screen.getAllByLabelText("Repeat weekly until");
    const from = screen.getAllByLabelText("From");
    const to = screen.getAllByLabelText("To");

    fireEvent.change(firstDates[0], { target: { value: "2026-10-05" } });
    fireEvent.change(repeatUntil[0], { target: { value: "2026-10-19" } });
    fireEvent.change(from[0], { target: { value: "18:00" } });
    fireEvent.change(to[0], { target: { value: "20:00" } });

    fireEvent.change(firstDates[1], { target: { value: "2026-10-07" } });
    fireEvent.change(repeatUntil[1], { target: { value: "2026-10-21" } });
    fireEvent.change(from[1], { target: { value: "18:00" } });
    fireEvent.change(to[1], { target: { value: "20:00" } });

    expect(await screen.findByText("6 total occurrences will be submitted")).toBeInTheDocument();
    await waitFor(() => expect(setter).toHaveBeenLastCalledWith([
      { from: expect.any(String), to: expect.any(String) },
      { from: expect.any(String), to: expect.any(String) },
      { from: expect.any(String), to: expect.any(String) },
      { from: expect.any(String), to: expect.any(String) },
      { from: expect.any(String), to: expect.any(String) },
      { from: expect.any(String), to: expect.any(String) },
    ]));
  });

  test("blocks exact duplicate occurrences", async () => {
    const setter = jest.fn();

    render(<MultiDateTimeRangeAccumulator setter={setter} />);
    fireEvent.click(screen.getByRole("button", { name: "Add another date set" }));

    const dates = screen.getAllByLabelText("Event date");
    const from = screen.getAllByLabelText("From");
    const to = screen.getAllByLabelText("To");
    dates.forEach((input) => fireEvent.change(input, { target: { value: "2026-10-05" } }));
    from.forEach((input) => fireEvent.change(input, { target: { value: "18:00" } }));
    to.forEach((input) => fireEvent.change(input, { target: { value: "20:00" } }));

    expect(await screen.findByText("Remove duplicate date and time occurrences before submitting.")).toBeInTheDocument();
    await waitFor(() => expect(setter).toHaveBeenLastCalledWith([]));
  });
});
