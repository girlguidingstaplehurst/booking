import dayjs from "dayjs";
import { toCalendarEvents } from "./ShowCalendar";

test("converts booking events into calendar events", () => {
  const from = "2026-01-10T10:00:00Z";
  const to = "2026-01-10T12:00:00Z";

  expect(toCalendarEvents([{ name: "Meeting", from, to, status: "approved" }])).toEqual([
    {
      title: "Meeting",
      start: dayjs(from).toDate(),
      end: dayjs(to).toDate(),
      allDay: false,
      status: "approved",
    },
  ]);
});
