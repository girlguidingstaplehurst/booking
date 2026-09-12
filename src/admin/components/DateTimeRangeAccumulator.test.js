import dayjs from "dayjs";
import {
  generateWeeklyOccurrences,
  validateWeeklySchedule,
} from "./DateTimeRangeAccumulator";

describe("weekly recurrence generation", () => {
  const schedule = {
    startDate: "2026-10-05",
    endDate: "2026-10-26",
    from: "18:00",
    to: "20:00",
  };

  test("generates weekly occurrences through the inclusive end date", () => {
    expect(generateWeeklyOccurrences(schedule).map(({ date }) => date)).toEqual([
      "2026-10-05",
      "2026-10-12",
      "2026-10-19",
      "2026-10-26",
    ]);
  });

  test("does not add a partial week after the end date", () => {
    expect(
      generateWeeklyOccurrences({ ...schedule, endDate: "2026-10-25" }),
    ).toHaveLength(3);
  });

  test("keeps the configured local times across a daylight-saving transition", () => {
    const occurrences = generateWeeklyOccurrences({
      startDate: "2026-03-23",
      endDate: "2026-04-06",
      from: "18:00",
      to: "20:00",
    });

    expect(occurrences).toHaveLength(3);
    expect(occurrences.map(({ from, to }) => [
      dayjs(from).format("HH:mm"),
      dayjs(to).format("HH:mm"),
    ])).toEqual([
      ["18:00", "20:00"],
      ["18:00", "20:00"],
      ["18:00", "20:00"],
    ]);
  });

  test("rejects an end date before the first date", () => {
    expect(validateWeeklySchedule({ ...schedule, endDate: "2026-10-04" })).toBe(
      "The end date must be on or after the first date.",
    );
    expect(generateWeeklyOccurrences({ ...schedule, endDate: "2026-10-04" })).toEqual([]);
  });

  test("rejects an end time that is not after the start time", () => {
    expect(validateWeeklySchedule({ ...schedule, to: "18:00" })).toBe(
      "The end time must be after the start time.",
    );
    expect(generateWeeklyOccurrences({ ...schedule, to: "17:00" })).toEqual([]);
  });

  test("rejects an incomplete schedule", () => {
    expect(validateWeeklySchedule({ ...schedule, startDate: "" })).toBeTruthy();
    expect(generateWeeklyOccurrences({ ...schedule, startDate: "" })).toEqual([]);
  });
});
