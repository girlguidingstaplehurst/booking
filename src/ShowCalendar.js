import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Flex,
  Heading,
  Spacer,
  Stack,
  Text,
  useDisclosure,
  useToken,
} from "@chakra-ui/react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import {
  Link as ReactRouterLink,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCallback, useMemo, useRef, useState } from "react";
import RoundedButton from "./components/RoundedButton";
import ManagedContent from "./components/ManagedContent";

const localizer = dayjsLocalizer(dayjs);

function ShowCalendar() {
  const minDate = useMemo(
    () => dayjs().add(14, "days").startOf("day"),
    [dayjs.now],
  );
  const [date, setDate] = useState(minDate);

  let eventsList = useLoaderData();
  if (eventsList.events === undefined || eventsList.events === null) {
    eventsList = {
      events: [
        {
          name: "Fake Event Right now",
          from: minDate.add(10, "hours").toDate(),
          to: minDate.add(11, "hours").toDate(),
          status: "provisional",
        },
        {
          name: "Approved event",
          from: minDate.add(35, "hours").toDate(),
          to: minDate.add(36, "hours").toDate(),
          status: "approved",
        },
      ],
    };
  }

  const events = eventsList.events.map((event) => ({
    title: event.name,
    start: dayjs(event.from).toDate(),
    end: dayjs(event.to).toDate(),
    allDay: false,
    status: event.status,
  }));

  const minTime = useMemo(() => dayjs("09:00", "HH:mm").toDate(), [minDate]);
  const maxTime = useMemo(() => dayjs("22:00", "HH:mm").toDate(), [minDate]);

  const navigate = useNavigate();

  const [grey300, brand500, brand900, white, black] = useToken("colors", [
    "gray.300",
    "brand.500",
    "brand.900",
    "white",
    "black",
  ]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const markUnavailableDays = useCallback(
    (date) => ({
      ...(dayjs(date).isBefore(minDate) && {
        style: {
          backgroundColor: grey300,
          color: "black",
        },
      }),
    }),
    [minDate],
  );

  const colorEvents = useCallback((event) => {
    return {
      ...(event.status === "provisional" && {
        style: {
          backgroundColor: brand500,
          color: white,
          fontSize: "12px",
        },
      }),
      ...(event.status === "approved" && {
        style: {
          backgroundColor: brand900,
          color: white,
          fontSize: "12px",
        },
      }),
    };
  });

  const closeRef = useRef();

  return (
    <Stack spacing={4}>
      <ManagedContent name="make-a-booking"/>
      {/*<Heading>Make a Booking</Heading>*/}
      {/*<Text>*/}
      {/*  Booking your event at the Kathie Lamb Guide Centre is easy and*/}
      {/*  convenient. Simply select your preferred date and time below, and then*/}
      {/*  fill in the online booking form with the name of your event and your*/}
      {/*  contact details, check the price, and hit Book! Our team will review*/}
      {/*  your request promptly and get back to you with the next steps.*/}
      {/*</Text>*/}
      {/*<Text>*/}
      {/*  Once your booking is confirmed, we'll work closely with you to suit your*/}
      {/*  specific needs. With our dedicated staff and commitment to exceptional*/}
      {/*  service, you can rest assured that your event will be a resounding*/}
      {/*  success.*/}
      {/*</Text>*/}
      <Flex justifyContent="end" wrap="wrap" gap={4}>
        <Stack direction="row" gap={2}>
          <Text padding={2}>Key:</Text>
          <Box bg={brand500} fontSize="12px" color={white} padding={2}>
            Provisional booking
          </Box>
          <Box bg={brand900} fontSize="12px" color={white} padding={2}>
            Confirmed booking
          </Box>
          <Box bg={grey300} fontSize="12px" color={black} padding={2}>
            Unavailable time
          </Box>
        </Stack>
        <Spacer />
        <RoundedButton as={ReactRouterLink} to="/add-event">
          Add Event
        </RoundedButton>
      </Flex>
      <Calendar
        localizer={localizer}
        defaultView="week"
        events={events}
        date={date}
        min={minTime}
        max={maxTime}
        dayPropGetter={markUnavailableDays}
        slotPropGetter={markUnavailableDays}
        eventPropGetter={colorEvents}
        selectable={true}
        onSelectSlot={({ start, end }) => {
          if (!dayjs(start).isBefore(minDate)) {
            navigate(
              `/add-event?start=${dayjs(start).toISOString()}&end=${dayjs(end).toISOString()}`,
            );
          } else {
            onOpen();
          }
        }}
        onSelecting={({ start }) => {
          if (dayjs(start).isBefore(minDate)) {
            onOpen();
            return false;
          }
          return true;
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
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={closeRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Unable to book this date
            </AlertDialogHeader>

            <AlertDialogBody>
              We are unable to accept bookings for dates less than 14 days in
              the future.
            </AlertDialogBody>

            <AlertDialogFooter>
              <RoundedButton ref={closeRef} onClick={onClose} ml={3}>
                Close
              </RoundedButton>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Stack>
  );
}

export default ShowCalendar;
