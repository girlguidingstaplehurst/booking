import { Button, Flex, Heading, Link, Spacer, Stack } from "@chakra-ui/react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import { Link as ReactRouterLink, useLoaderData, useNavigate } from "react-router-dom";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMemo, useState } from "react";

const localizer = dayjsLocalizer(dayjs);

function ShowCalendar() {
  let eventsList = useLoaderData();
  if (eventsList.events === undefined || eventsList.events === null) {
    eventsList = {
      events: [
        {
          name: "Fake Event Right now",
          from: dayjs().startOf("hour").toDate(),
          to: dayjs().endOf("hour").toDate(),
        },
      ],
    };
  }

  const events = eventsList.events.map((event) => ({
    title: event.name,
    start: dayjs(event.from).toDate(),
    end: dayjs(event.to).toDate(),
    allDay: false,
  }));

  const [date, setDate] = useState(dayjs().toDate());

  const minTime = useMemo(() => dayjs("09:00", "HH:mm").toDate(), []);
  const maxTime = useMemo(() => dayjs("22:00", "HH:mm").toDate(), []);

  const navigate = useNavigate();

  return (
    <Stack spacing={4}>
      <Flex>
        <Heading>Bookings</Heading>
        <Spacer />
        <Button as={ReactRouterLink} to="/add-event" colorScheme="blue">
          Add Event
        </Button>
      </Flex>
      <Calendar
        localizer={localizer}
        defaultView="week"
        events={events}
        date={date}
        min={minTime}
        max={maxTime}
        selectable={true}
        onSelectSlot={({start, end}) => {
          navigate(`/add-event?start=${dayjs(start).toISOString()}&end=${dayjs(end).toISOString()}`)
        }}
        onNavigate={(newDate) => {
          if (dayjs(newDate).isBefore(dayjs())) {
            setDate(dayjs().toDate());
          } else {
            setDate(newDate);
          }
        }}
        style={{ height: "80vh" }}
      />
    </Stack>
  );
}

export default ShowCalendar;
