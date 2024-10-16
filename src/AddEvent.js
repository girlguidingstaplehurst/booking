import {
  Button,
  Flex,
  Heading,
  Select,
  SimpleGrid,
  Spacer,
  Stack,
  StackDivider, Text,
  Tooltip
} from "@chakra-ui/react";
import Summary from "./Summary";
import { useFormik } from "formik";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import * as Yup from "yup";
import ReactRecaptcha3 from "react-google-recaptcha3";
import FormFieldAndLabel from "./components/FormFieldAndLabel";
import RoundedButton from "./components/RoundedButton";

function transformDate(dateStr) {
  return dayjs(dateStr).toDate();
}

function AddEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitErrors, setSubmitErrors] = useState("")

  useEffect(() => {
    ReactRecaptcha3.init("6LdCvFwmAAAAAKkKRWe7CuoK_7B3hteuBfx_4mlW")
  }, [])

  const start = searchParams.has("start")
    ? searchParams.get("start")
    : dayjs().add(14, "days").startOf("hour");
  const end = searchParams.has("end")
    ? searchParams.get("end")
    : dayjs().add(14, "days").add(1, "hour").startOf("hour");

  const EventSchema = Yup.object().shape({
    eventName: Yup.string()
      .min(2, "too short")
      .max(50, "too long")
      .required("Required"),
    eventDate: Yup.date()
      .transform(transformDate)
      .min(
        dayjs().add(14, "days").startOf("day"),
        "must not be less than 14 days in the future",
      )
      .max(
        dayjs().add(2, "years"),
        "must not be more than 2 years in the future",
      )
      .required("Required"),
    eventTimeFrom: Yup.mixed()
      .required("Required")
      .test(
        "must be before start time",
        "from must be before to",
        function (value) {
          const { eventTimeTo } = this.parent;
          return dayjs(value, "HH:mm").isBefore(dayjs(eventTimeTo, "HH:mm"));
        },
      )
      .test(
        "must not be before 0900",
        "from must not be before 09:00",
        function (value) {
          return dayjs(value, "HH:mm").isSameOrAfter(dayjs("09:00", "HH:mm"));
        },
      )
      .test(
        "must not be after 2200",
        "from must not be after 22:00",
        function (value) {
          return dayjs(value, "HH:mm").isSameOrBefore(dayjs("22:00", "HH:mm"));
        },
      ),
    eventTimeTo: Yup.mixed()
      .required("Required")
      .test(
        "must be after start time",
        "to must be after from",
        function (value) {
          const { eventTimeFrom } = this.parent;
          return dayjs(value, "HH:mm").isAfter(dayjs(eventTimeFrom, "HH:mm"));
        },
      )
      .test(
        "must not be before 0900",
        "to must not be before 09:00",
        function (value) {
          return dayjs(value, "HH:mm").isSameOrAfter(dayjs("09:00", "HH:mm"));
        },
      )
      .test(
        "must not be after 2200",
        "to must not be after 22:00",
        function (value) {
          return dayjs(value, "HH:mm").isSameOrBefore(dayjs("22:00", "HH:mm"));
        },
      ),
    name: Yup.string().required("Required"),
    email: Yup.string().email().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      eventName: "",
      eventDate: dayjs(start).format("YYYY-MM-DD"),
      eventTimeFrom: dayjs(start).format("HH:mm"),
      eventTimeTo: dayjs(end).format("HH:mm"),
      visibility: "show",
      name: "",
      email: "",
    },
    validationSchema: EventSchema,
    onSubmit: async (values) => {
      setSubmitErrors("");
      setSubmitting(true);

      const captchaToken = await ReactRecaptcha3.getToken()

      const from = dayjs(
        `${values.eventDate} ${values.eventTimeFrom}`,
        "YYYY-MM-DD HH:mm",
      );
      const to = dayjs(
        `${values.eventDate} ${values.eventTimeTo}`,
        "YYYY-MM-DD HH:mm",
      );

      const resp = await fetch("/api/v1/add-event", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          event: {
            name: values.eventName,
            from: from.toISOString(),
            to: to.toISOString(),
            publicly_visible: values.visibility === "show",
          },
          contact: {
            name: values.name,
            email_address: values.email,
          },
          captchaToken: captchaToken,
        }),
      });

      setSubmitting(false);

      if (!resp.ok) {
        const json = await resp.json()
        setSubmitErrors(`An error occured when booking (${json.error_message}). Please retry.`)
      } else {
        return navigate("/");
      }
    },
  });

  const [submitting, setSubmitting] = useState(false);

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={2}>
        <Heading>Add Event</Heading>
        <FormFieldAndLabel
          label="Event Name"
          name="eventName"
          value={formik.values.eventName}
          errValue={formik.errors.eventName}
          onChange={formik.handleChange}
        />

        <FormFieldAndLabel
          label="Event Date"
          name="eventDate"
          value={formik.values.eventDate}
          errValue={formik.errors.eventDate}
          onChange={formik.handleChange}
          fieldProps={{ type: "date" }}
        />

        <SimpleGrid columns={2} gap={4}>
          <FormFieldAndLabel
            label="From"
            name="eventTimeFrom"
            value={formik.values.eventTimeFrom}
            errValue={formik.errors.eventTimeFrom}
            onChange={formik.handleChange}
            fieldProps={{ type: "time" }}
          />
          <FormFieldAndLabel
            label="To"
            name="eventTimeTo"
            value={formik.values.eventTimeTo}
            errValue={formik.errors.eventTimeTo}
            onChange={formik.handleChange}
            fieldProps={{ type: "time" }}
          />
        </SimpleGrid>

        <FormFieldAndLabel
          label="Event Visibility"
          name="visibility"
          value={formik.values.visiblity}
          onChange={formik.handleChange}
          fieldAs={Select}
          fieldProps={{
            children: [
              <option value="show">
                Show event information on public calendar
              </option>,
              <option value="hide">
                Hide event information on public calendar
              </option>,
            ],
          }}
        />

        <Heading>Contact Info</Heading>
        <FormFieldAndLabel
          label="Name"
          name="name"
          value={formik.values.name}
          errValue={formik.errors.name}
          onChange={formik.handleChange}
        />

        <FormFieldAndLabel
          label="Email"
          name="email"
          value={formik.values.email}
          errValue={formik.errors.email}
          onChange={formik.handleChange}
        />

        <Summary formik={formik} />
        <Flex>
          <Text color="red">{submitErrors}</Text>
          <Spacer />
          <Tooltip
            label="One or more fields are invalid"
            isDisabled={formik.isValid}
          >
            <RoundedButton
              colorScheme="green"
              isLoading={submitting}
              isDisabled={!formik.isValid}
              type="submit"
            >
              Book
            </RoundedButton>
          </Tooltip>
        </Flex>
        <StackDivider />
      </Stack>
    </form>
  );
}

export default AddEvent;
