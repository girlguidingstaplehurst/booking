import {
  Container,
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import FormFieldAndLabel from "../components/FormFieldAndLabel";
import DateTimeRangeAccumulator from "./components/DateTimeRangeAccumulator";
import { RateSelect } from "./components/RateSelect";
import { AdminPoster } from "../Poster";
import RoundedButton from "../components/RoundedButton";
import PageHeader from "./components/PageHeader";
import { KeyholderSelect } from "./components/KeyholderSelect";

const schema = Yup.object({
  name: Yup.string().required("Required"),
  details: Yup.string().required("Required"),
  contactName: Yup.string().required("Required"),
  email: Yup.string().email().required("Required"),
  keyholder: Yup.string().required("Required"),
});

export function CreateEventGroup() {
  const navigate = useNavigate();
  const [instances, setInstances] = useState([]);
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      name: "",
      details: "",
      visibility: "show",
      rate: "default",
      contactName: "",
      email: "",
      keyholder: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setError("");
      if (instances.length === 0) {
        setError("Add at least one valid event date.");
        return;
      }
      const response = await AdminPoster("/api/v1/admin/add-event-group", {
        name: values.name,
        details: values.details,
        publicly_visible: values.visibility === "show",
        rate: values.rate,
        keyholder: values.keyholder,
        instances,
        contact: { name: values.contactName, email_address: values.email },
      });

      if (response?.ok) {
        navigate("/admin");
      } else {
        setError("Unable to create event group.");
      }
    },
  });

  return (
    <Container maxW="4xl">
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={4}>
          <PageHeader title="Create event group" />
          <FormFieldAndLabel
            label="Event Title"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
          />
          <FormFieldAndLabel
            label="Event Details"
            name="details"
            value={formik.values.details}
            onChange={formik.handleChange}
            fieldAs={Textarea}
            fieldProps={{ rows: 8 }}
          />
          <FormFieldAndLabel
            label="Event Visibility"
            name="visibility"
            value={formik.values.visibility}
            onChange={formik.handleChange}
            fieldAs={Select}
            fieldProps={{
              children: [
                <option value="show">Show event information</option>,
                <option value="hide">Hide event information</option>,
              ],
            }}
          />
          <DateTimeRangeAccumulator
            value={instances}
            setter={setInstances}
            name="instances"
            label="Event Dates"
          />
          <Text fontWeight="bold">Event Group Rate</Text>
          <RateSelect
            rateID={formik.values.rate}
            onChange={(event) =>
              formik.setFieldValue("rate", event.target.value)
            }
          />
          <Text fontWeight="bold">Contact</Text>
          <FormFieldAndLabel
            label="Name"
            name="contactName"
            value={formik.values.contactName}
            onChange={formik.handleChange}
          />
          <FormFieldAndLabel
            label="Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
          />
          <KeyholderSelect
            label="Keyholder"
            name="keyholder"
            value={formik.values.keyholder}
            errValue={formik.errors.keyholder}
            onChange={formik.handleChange}
          />
          <Text color="red">{error}</Text>
          <RoundedButton type="submit">Create Event Group</RoundedButton>
        </Stack>
      </form>
    </Container>
  );
}
