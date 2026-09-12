import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DateTimeRangeAccumulator from "./DateTimeRangeAccumulator";

describe("DateTimeRangeAccumulator", () => {
  test("previews occurrences and allows weeks to be skipped and restored", async () => {
    const setter = jest.fn();

    render(<DateTimeRangeAccumulator setter={setter} />);

    fireEvent.click(screen.getByLabelText("Repeat weekly"));
    fireEvent.change(screen.getByLabelText("First meeting date"), {
      target: { value: "2026-10-05" },
    });
    fireEvent.change(screen.getByLabelText("Repeat weekly until"), {
      target: { value: "2026-10-19" },
    });
    fireEvent.change(screen.getByLabelText("From"), {
      target: { value: "18:00" },
    });
    fireEvent.change(screen.getByLabelText("To"), {
      target: { value: "20:00" },
    });

    expect(await screen.findByText("3 occurrences will be submitted")).toBeInTheDocument();
    const middleWeek = screen.getByLabelText("Mon 12 Oct 2026 (18:00-20:00)");
    fireEvent.click(middleWeek);
    expect(screen.getByText("2 occurrences will be submitted")).toBeInTheDocument();
    await waitFor(() => expect(setter).toHaveBeenLastCalledWith([
      {
        from: expect.any(String),
        to: expect.any(String),
      },
      {
        from: expect.any(String),
        to: expect.any(String),
      },
    ]));

    screen
      .getAllByRole("checkbox")
      .slice(1)
      .filter((checkbox) => checkbox.checked)
      .forEach((checkbox) => fireEvent.click(checkbox));
    expect(screen.getByText("Select at least one occurrence.")).toBeInTheDocument();
    await waitFor(() => expect(setter).toHaveBeenLastCalledWith([]));

    [
      "Mon 5 Oct 2026 (18:00-20:00)",
      "Mon 12 Oct 2026 (18:00-20:00)",
      "Mon 19 Oct 2026 (18:00-20:00)",
    ].forEach((label) => fireEvent.click(screen.getByLabelText(label)));
    expect(screen.getByText("3 occurrences will be submitted")).toBeInTheDocument();
    await waitFor(() => expect(setter).toHaveBeenLastCalledWith([
      {
        from: expect.any(String),
        to: expect.any(String),
      },
      {
        from: expect.any(String),
        to: expect.any(String),
      },
      {
        from: expect.any(String),
        to: expect.any(String),
      },
    ]));
  });

  test("creates one occurrence by default", async () => {
    const setter = jest.fn();

    render(<DateTimeRangeAccumulator setter={setter} />);

    fireEvent.change(screen.getByLabelText("Event date"), {
      target: { value: "2026-10-05" },
    });
    fireEvent.change(screen.getByLabelText("From"), {
      target: { value: "18:00" },
    });
    fireEvent.change(screen.getByLabelText("To"), {
      target: { value: "20:00" },
    });

    expect(await screen.findByText("1 occurrence will be submitted")).toBeInTheDocument();
    await waitFor(() => expect(setter).toHaveBeenLastCalledWith([
      {
        from: expect.any(String),
        to: expect.any(String),
      },
    ]));
    expect(screen.queryByLabelText("Repeat weekly until")).not.toBeInTheDocument();
  });

  test("returns to one occurrence when recurrence is disabled", async () => {
    const setter = jest.fn();

    render(<DateTimeRangeAccumulator setter={setter} />);
    fireEvent.click(screen.getByLabelText("Repeat weekly"));
    fireEvent.change(screen.getByLabelText("First meeting date"), {
      target: { value: "2026-10-05" },
    });
    fireEvent.change(screen.getByLabelText("Repeat weekly until"), {
      target: { value: "2026-10-19" },
    });
    fireEvent.change(screen.getByLabelText("From"), {
      target: { value: "18:00" },
    });
    fireEvent.change(screen.getByLabelText("To"), {
      target: { value: "20:00" },
    });
    expect(await screen.findByText("3 occurrences will be submitted")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Repeat weekly"));
    expect(screen.getByText("1 occurrence will be submitted")).toBeInTheDocument();
    expect(screen.queryByLabelText("Repeat weekly until")).not.toBeInTheDocument();
    await waitFor(() => expect(setter).toHaveBeenLastCalledWith([
      {
        from: expect.any(String),
        to: expect.any(String),
      },
    ]));
  });

  test("blocks an incomplete one-off schedule", () => {
    const setter = jest.fn();

    render(<DateTimeRangeAccumulator setter={setter} />);
    fireEvent.change(screen.getByLabelText("Event date"), {
      target: { value: "2026-10-05" },
    });
    fireEvent.change(screen.getByLabelText("From"), {
      target: { value: "18:00" },
    });

    expect(screen.getByText("Enter a date, start time, and end time.")).toBeInTheDocument();
    expect(setter).toHaveBeenLastCalledWith([]);
  });
});
