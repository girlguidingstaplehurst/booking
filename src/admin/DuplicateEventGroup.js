import {
  Container,
  Flex,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AdminFetcher } from "../Fetcher";
import { AdminPoster } from "../Poster";
import FormFieldAndLabel from "../components/FormFieldAndLabel";
import RoundedButton from "../components/RoundedButton";
import PageHeader from "./components/PageHeader";
import MultiDateTimeRangeAccumulator from "./components/MultiDateTimeRangeAccumulator";
import { RateSelect } from "./components/RateSelect";
import { KeyholderSelect } from "./components/KeyholderSelect";

export async function duplicateEventGroupLoader({ params }) {
  const response = await AdminFetcher(`/api/v1/admin/event-groups/${params.groupID}`, {});
  const data = response?.json ? await response.json() : response;
  if (!data?.id) return { group: null, source: null };
  return {
    group: { id: data.id, name: data.name, from: "", to: "", invoices: [] },
    source: {
      name: data.name,
      details: data.details,
      visible: data.publicly_visible,
      contact: data.contact.email_address,
      contactName: data.contact.name,
      rate: data.rate,
      keyholder: data.keyholder?.id || "",
      keyholderName: data.keyholder?.name || "",
      timeRanges: data.time_ranges || [],
    },
  };
}

const schema = Yup.object({
  rate: Yup.string().required("Select a valid rate"),
  keyholder: Yup.string().required("Select an active keyholder"),
});

export function DuplicateEventGroup() {
  const { group, source } = useLoaderData();
  const navigate = useNavigate();
  const [instances, setInstances] = useState([]);
  const [error, setError] = useState("");

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      rate: source?.rate || "",
      keyholder: source?.keyholder || "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setError("");
      if (!instances.length) {
        setError("Add at least one valid event date.");
        return;
      }
      if (!values.rate || !values.keyholder) return;
      const response = await AdminPoster("/api/v1/admin/duplicate-event-group", {
        event_group_id: group.id,
        rate: values.rate,
        keyholder: values.keyholder,
        instances,
      });
      if (response?.ok) navigate("/admin");
      else setError("Unable to duplicate event group.");
    },
  });

  if (!group || !source) {
    return <Container maxW="4xl"><PageHeader title="Duplicate event group" /><Text>Event group not found.</Text></Container>;
  }

  return (
    <Container maxW="4xl">
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={4}>
          <PageHeader title={`Duplicate "${group.name}"`} />
          <FormFieldAndLabel label="Event Title" name="name" value={source.name} fieldProps={{ isDisabled: true }} />
          <FormFieldAndLabel label="Event Details" name="details" value={source.details} fieldAs="textarea" onChange={() => {}} fieldProps={{ disabled: true, rows: 8 }} />
          <FormFieldAndLabel label="Event Visibility" name="visibility" value={source.visible ? "show" : "hide"} fieldAs={Select} fieldProps={{ isDisabled: true, children: [<option key="show" value="show">Show event information</option>, <option key="hide" value="hide">Hide event information</option>] }} />
          <MultiDateTimeRangeAccumulator initialTimeRanges={source.timeRanges} value={instances} setter={setInstances} name="instances" label="New Event Dates" />
          <Text fontWeight="bold">Event Group Rate</Text>
          <RateSelect eventGroup rateID={formik.values.rate} currentName="Current rate" onChange={(event) => formik.setFieldValue("rate", event.target.value)} onBlur={() => formik.setFieldTouched("rate", true)} error={formik.touched.rate && formik.errors.rate} />
          <KeyholderSelect label="Keyholder" name="keyholder" value={formik.values.keyholder} currentID={source.keyholder} currentName={source.keyholderName} errValue={formik.touched.keyholder && formik.errors.keyholder} onChange={formik.handleChange} />
          <Text>Name: {source.contactName}</Text>
          <Text>Email: {source.contact}</Text>
          <Flex marginBottom={10} flexDirection="column" gap={4}>
            <Text color="red">{error}</Text>
            <RoundedButton type="submit" colorScheme="green" width="100%" isLoading={formik.isSubmitting}>Duplicate Event Group</RoundedButton>
          </Flex>
        </Stack>
      </form>
    </Container>
  );
}
