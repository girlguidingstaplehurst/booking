import { Heading, Link, Stack } from "@chakra-ui/react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import { Link as ReactRouterLink, useLoaderData } from "react-router-dom";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dayjsLocalizer(dayjs);

function ShowCalendar() {
  const eventsList = useLoaderData();
  const events = eventsList.events.map((event) => ({
    title: event.name,
    start: dayjs(event.from).toDate(),
    end: dayjs(event.to).toDate() ,
    allDay: false,
  }));

  return (
    <Stack spacing={4}>
      <Heading>Bookings</Heading>
      <Link as={ReactRouterLink} to="/add-event">
        Add Event
      </Link>
      <Calendar
        localizer={localizer}
        defaultDate={new Date()}
        defaultView="month"
        events={events}
        style={{ height: "100vh" }}
      />
    </Stack>
  );
}

export default ShowCalendar;
