import {
  Box,
  Checkbox,
  FormLabel,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

function dateTime(date, time) {
  return dayjs(`${date}T${time}`);
}

export function validateSchedule({ startDate, endDate, from, to, repeatWeekly }) {
  if (!startDate || !from || !to) {
    return "Enter a date, start time, and end time.";
  }

  if (repeatWeekly && !endDate) {
    return "Enter a repeat-until date.";
  }

  if (repeatWeekly && endDate < startDate) {
    return "The end date must be on or after the first date.";
  }

  if (!dateTime(startDate, from).isBefore(dateTime(startDate, to))) {
    return "The end time must be after the start time.";
  }

  return "";
}

export function validateWeeklySchedule(schedule) {
  return validateSchedule({ ...schedule, repeatWeekly: true });
}

export function generateWeeklyOccurrences({ startDate, endDate, from, to }) {
  if (validateWeeklySchedule({ startDate, endDate, from, to })) {
    return [];
  }

  const occurrences = [];
  let date = dayjs(startDate);
  const lastDate = dayjs(endDate);

  while (!date.isAfter(lastDate, "day")) {
    const occurrenceDate = date.format("YYYY-MM-DD");
    occurrences.push({
      date: occurrenceDate,
      from: dateTime(occurrenceDate, from).toISOString(),
      to: dateTime(occurrenceDate, to).toISOString(),
    });
    date = date.add(7, "day");
  }

  return occurrences;
}

function DateTimeRangeAccumulator({ setter, label = "Event Dates" }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [excludedDates, setExcludedDates] = useState(() => new Set());

  const schedule = { startDate, endDate, from, to };
  const validationError = repeatWeekly
    ? validateWeeklySchedule(schedule)
    : validateSchedule({ ...schedule, repeatWeekly: false });
  const occurrences = useMemo(
    () => repeatWeekly
      ? generateWeeklyOccurrences({ startDate, endDate, from, to })
      : validationError
        ? []
        : [{
            date: startDate,
            from: dateTime(startDate, from).toISOString(),
            to: dateTime(startDate, to).toISOString(),
          }],
    [startDate, endDate, from, to, repeatWeekly, validationError],
  );
  const includedOccurrences = useMemo(
    () => occurrences.filter((occurrence) => !excludedDates.has(occurrence.date)),
    [occurrences, excludedDates],
  );

  useEffect(() => {
    const validDates = new Set(occurrences.map((occurrence) => occurrence.date));
    setExcludedDates((dates) => {
      const nextDates = new Set(
        [...dates].filter((date) => validDates.has(date)),
      );
      if (nextDates.size === dates.size && [...nextDates].every((date) => dates.has(date))) {
        return dates;
      }
      return nextDates;
    });
  }, [occurrences]);

  useEffect(() => {
    setter(validationError ? [] : includedOccurrences.map(({ from: start, to: end }) => ({
      from: start,
      to: end,
    })));
  }, [includedOccurrences, setter, validationError]);

  const updateInput = (update, clearExclusions = false) => (event) => {
    update(event.target.value);
    setter([]);
    if (clearExclusions) {
      setExcludedDates(new Set());
    }
  };

  const updateRepeatWeekly = (event) => {
    setRepeatWeekly(event.target.checked);
    setter([]);
    setExcludedDates(new Set());
  };

  const toggleDate = (date) => {
    setExcludedDates((dates) => {
      const nextDates = new Set(dates);
      if (nextDates.has(date)) {
        nextDates.delete(date);
      } else {
        nextDates.add(date);
      }
      return nextDates;
    });
  };

  return (
    <Box>
      <Text fontWeight="bold" marginBottom={2}>{label}</Text>
      <Checkbox isChecked={repeatWeekly} onChange={updateRepeatWeekly} marginBottom={2}>
        Repeat weekly
      </Checkbox>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <Box>
          <FormLabel htmlFor="recurrence-start-date">
            {repeatWeekly ? "First meeting date" : "Event date"}
          </FormLabel>
          <Input
            id="recurrence-start-date"
            value={startDate}
            onChange={updateInput(setStartDate, true)}
            type="date"
          />
        </Box>
        {repeatWeekly && (
          <Box>
            <FormLabel htmlFor="recurrence-end-date">Repeat weekly until</FormLabel>
            <Input
              id="recurrence-end-date"
              value={endDate}
              onChange={updateInput(setEndDate)}
              type="date"
            />
          </Box>
        )}
        <Box>
          <FormLabel htmlFor="recurrence-start-time">From</FormLabel>
          <Input
            id="recurrence-start-time"
            value={from}
            onChange={updateInput(setFrom)}
            type="time"
          />
        </Box>
        <Box>
          <FormLabel htmlFor="recurrence-end-time">To</FormLabel>
          <Input
            id="recurrence-end-time"
            value={to}
            onChange={updateInput(setTo)}
            type="time"
          />
        </Box>
      </SimpleGrid>
      {validationError && (startDate || endDate || from || to) && (
        <Text color="red.500" marginTop={2}>{validationError}</Text>
      )}
      {!validationError && occurrences.length > 0 && (
        <Box marginTop={4}>
          <Text fontWeight="bold">
            {includedOccurrences.length} occurrence{includedOccurrences.length === 1 ? "" : "s"} will be submitted
          </Text>
          <Stack spacing={1} marginTop={2}>
            {occurrences.map((occurrence) => (
              <Checkbox
                key={occurrence.date}
                isChecked={!excludedDates.has(occurrence.date)}
                onChange={() => toggleDate(occurrence.date)}
              >
                {dayjs(occurrence.date).format("ddd D MMM YYYY")} ({from}-{to})
              </Checkbox>
            ))}
          </Stack>
          {!includedOccurrences.length && (
            <Text color="red.500" marginTop={2}>Select at least one occurrence.</Text>
          )}
        </Box>
      )}
    </Box>
  );
}

export default DateTimeRangeAccumulator;
