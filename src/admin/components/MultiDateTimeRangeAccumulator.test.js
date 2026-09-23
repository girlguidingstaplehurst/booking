import {
  findDuplicateOccurrences,
  flattenDateSetInstances,
} from "./MultiDateTimeRangeAccumulator";

describe("MultiDateTimeRangeAccumulator helpers", () => {
  test("flattens instances in date-set order", () => {
    const first = { from: "2026-10-05T18:00:00.000Z", to: "2026-10-05T20:00:00.000Z" };
    const second = { from: "2026-10-07T18:00:00.000Z", to: "2026-10-07T20:00:00.000Z" };

    expect(flattenDateSetInstances([
      { instances: [first] },
      { instances: [second] },
    ])).toEqual([first, second]);
  });

  test("finds exact duplicate date and time pairs", () => {
    const occurrence = { from: "2026-10-05T18:00:00.000Z", to: "2026-10-05T20:00:00.000Z" };

    expect(findDuplicateOccurrences([
      { instances: [occurrence] },
      { instances: [occurrence] },
    ])).toEqual(new Set([`${occurrence.from}|${occurrence.to}`]));
  });

  test("does not treat different time ranges on the same date as duplicates", () => {
    expect(findDuplicateOccurrences([
      { instances: [{ from: "2026-10-05T18:00:00.000Z", to: "2026-10-05T20:00:00.000Z" }] },
      { instances: [{ from: "2026-10-05T19:00:00.000Z", to: "2026-10-05T21:00:00.000Z" }] },
    ])).toEqual(new Set());
  });
});
