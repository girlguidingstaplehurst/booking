import { Heading, Link, Stack } from "@chakra-ui/react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import { useState } from "react";
import { Link as ReactRouterLink } from "react-router-dom";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dayjsLocalizer(dayjs);

function ShowCalendar() {
  const [events] = useState([]);

  return (
    <Stack spacing={4}>
      <Heading>Bookings</Heading>
      <Link as={ReactRouterLink} to="/add-event">
        Add Event
      </Link>
      <Calendar
        localizer={localizer}
        defaultDate={new Date()}
        defaultView="week"
        events={events}
        style={{ height: "100vh" }}
      />
    </Stack>
  );
}

export default ShowCalendar;
