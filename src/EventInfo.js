import {
  Box,
  Center,
  Flex,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Spacer,
  Text,
} from "@chakra-ui/react";

function EventInfo({ formik }) {
  return (
    <>
      <Heading>Event</Heading>

      <Flex>
        <FormLabel htmlFor="eventName">Event Name</FormLabel>
        <Spacer />
        {formik.errors.eventName ? (
          <Text>{formik.errors.eventName}</Text>
        ) : null}
      </Flex>
      <Input
        name="eventName"
        isInvalid={formik.errors.eventName}
        value={formik.values.eventName}
        onChange={formik.handleChange}
      />

      <Flex>
        <FormLabel htmlFor="eventDate">Event Date</FormLabel>
        <Spacer />
        {formik.errors.eventDate ? (
          <Text>{formik.errors.eventDate}</Text>
        ) : null}
      </Flex>

      <Input
        name="eventDate"
        type="date"
        isInvalid={formik.errors.eventDate}
        value={formik.values.eventDate}
        onChange={formik.handleChange}
      />

      <SimpleGrid columns={2} gap={4}>
        <Box>
          <Flex>
            <FormLabel htmlFor="eventTimeFrom">From</FormLabel>
            <Spacer />
            {formik.errors.eventTimeFrom ? (
              <Text>{formik.errors.eventTimeFrom}</Text>
            ) : null}
          </Flex>

          <Input
            name="eventTimeFrom"
            type="time"
            isInvalid={formik.errors.eventTimeFrom}
            value={formik.values.eventTimeFrom}
            onChange={formik.handleChange}
          />
        </Box>
        <Box>
          <FormLabel htmlFor="eventTimeTo">To</FormLabel>
          <Input
            name="eventTimeTo"
            type="time"
            value={formik.values.eventTimeTo}
            onChange={formik.handleChange}
          />
        </Box>
      </SimpleGrid>

      <FormLabel htmlFor="visibility">Event Visibility</FormLabel>
      <Center>
        <Select
          name="visibility"
          value={formik.values.visibility}
          onChange={formik.handleChange}
        >
          <option value="show">
            Show event information on public calendar
          </option>
          <option value="hide">
            Hide event information on public calendar
          </option>
        </Select>
      </Center>
    </>
  );
}

export default EventInfo;
