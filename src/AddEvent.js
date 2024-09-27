import { Button, Flex, Spacer, Stack, StackDivider } from "@chakra-ui/react";
import ContactInfo from "./ContactInfo";
import EventInfo from "./EventInfo";
import Summary from "./Summary";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import * as Yup from "yup";
import dayjs from "dayjs";

function transformDate(dateStr) {
  return dayjs(dateStr).date()
}

function AddEvent() {
  const navigate = useNavigate();

  // const EventSchema = Yup.object().shape({
  //   eventName: Yup.string()
  //     .min(2, "too short")
  //     .max(50, "too long")
  //     .required("Required"),
  //   eventDate: Yup.date()
  //     .transform(transformDate)
  //     .min(dayjs(), "must not be in the past")
  //     .max(dayjs().add(2, "years"), "must not be more than 2 years in the future")
  //     .required("Required"),
  //   eventTimeFrom: Yup.date().required("Required"),
  //   eventTimeTo: Yup.date().required("Required").min(Yup.ref("eventTimeFrom"), "to must be after from"),
  //   // visibility: "show",
  //   // name: "",
  //   // telephone: "",
  //   // email: "",
  // });

  const formik = useFormik({
    initialValues: {
      eventName: "",
      eventDate: "", //TODO pull this from prop?
      eventTimeFrom: "",
      eventTimeTo: "",
      visibility: "show",
      name: "",
      telephone: "",
      email: "",
    },
    // validationSchema: EventSchema,
    onSubmit: async (values) => {
      setSubmitting(true);

      //TODO make backend API request
      await fetch("/api/v1/add-event", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          event: {
            name: values.eventName,
            from: `${values.eventDate}T${values.eventTimeFrom}`,
            to: `${values.eventDate}T${values.eventTimeTo}`,
            publicly_visible: values.visibility === "show",
          },
          contact: {
            name: values.name,
            email_address : values.email,
          }
        }),
      });

      setSubmitting(false);
      return navigate("/");
    },
  });

  const [submitting, setSubmitting] = useState(false);

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={2}>
        <EventInfo formik={formik} />
        <StackDivider />
        <ContactInfo formik={formik} />
        <StackDivider />
        <Summary formik={formik} />
        <StackDivider />
        <Flex>
          <Spacer />
          <Button colorScheme="green" isLoading={submitting} type="submit">
            Book
          </Button>
        </Flex>
        <StackDivider />
      </Stack>
    </form>
  );
}

export default AddEvent;
