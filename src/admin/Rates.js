import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { Link as RouterLink, useNavigate, useParams, useLoaderData } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AdminFetcher } from "../Fetcher";
import { AdminPoster, AdminPutter } from "../Poster";
import RoundedButton from "../components/RoundedButton";
import PageHeader from "./components/PageHeader";

async function readResponse(response, fallback) {
  if (response?.json !== undefined) {
    return await response.json();
  }
  return response || fallback;
}

export const fallbackRates = [
  {
    id: "default",
    description: "External Hire Rate",
    hourlyRate: 25,
    perSession: [],
  },
  {
    id: "external-per-session",
    description: "External Per-session Rate",
    hourlyRate: 0,
    perSession: [{ count: 10, price: 150 }, { price: 13.5 }],
  },
];

export async function ratesLoader() {
  return readResponse(await AdminFetcher("/api/v1/admin/rates", fallbackRates), fallbackRates);
}

export async function rateLoader({ params }) {
  const rates = await ratesLoader();
  return rates.find((rate) => rate.id === params.rateID);
}

function formatMoney(value, trimWhole = false) {
  const formatted = Number(value).toFixed(2);
  return trimWhole ? formatted.replace(/\.00$/, "") : formatted;
}

export function rateSummary(rate) {
  if (rate.perSession?.length) {
    const first = rate.perSession[0];
    const additional = rate.perSession[1];
    return `${first.count} sessions for £${formatMoney(first.price, true)}, £${formatMoney(additional.price)} thereafter`;
  }
  return `£${formatMoney(rate.hourlyRate)} / hour`;
}

export function Rates() {
  const rates = useLoaderData();
  return (
    <Container maxW="4xl">
      <Stack spacing={6}>
        <PageHeader title="Rates">
          <RoundedButton as={RouterLink} to="/admin/rates/new">Add rate</RoundedButton>
        </PageHeader>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {rates.map((rate) => (
            <Box key={rate.id} borderRadius="md" boxShadow="md" padding={5} backgroundColor="white">
              <Box backgroundColor="brand.900" padding={4} margin={-5} marginBottom={4} borderTopRadius="md">
                <Heading size="md" color="white">{rate.description}</Heading>
                <Text color="brand.300" fontSize="md" fontWeight="bold">ID: {rate.id}</Text>
              </Box>
              <Text fontSize="lg" fontWeight="semibold">{rateSummary(rate)}</Text>
              <Button as={RouterLink} to={`/admin/rates/${rate.id}/edit`} marginTop={4} colorScheme="brand">
                Edit
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

const schema = Yup.object({
  id: Yup.string().trim().required("Required"),
  description: Yup.string().trim().required("Required"),
  pricingMode: Yup.string().oneOf(["hourly", "perSession"]).required("Required"),
  hourlyRate: Yup.number().min(0, "Must not be negative").when("pricingMode", {
    is: "hourly",
    then: (rule) => rule.required("Required"),
  }),
  sessionCount: Yup.number().integer("Must be a whole number").min(1, "Must be at least 1").when("pricingMode", {
    is: "perSession",
    then: (rule) => rule.required("Required"),
  }),
  sessionPrice: Yup.number().min(0, "Must not be negative").when("pricingMode", {
    is: "perSession",
    then: (rule) => rule.required("Required"),
  }),
  extraSessionPrice: Yup.number().min(0, "Must not be negative").when("pricingMode", {
    is: "perSession",
    then: (rule) => rule.required("Required"),
  }),
});

export function rateFormValues(rate) {
  const first = rate?.perSession?.[0];
  const second = rate?.perSession?.[1];
  return {
    id: rate?.id || "",
    description: rate?.description || "",
    hourlyRate: rate?.hourlyRate ?? "",
    pricingMode: rate?.perSession?.length ? "perSession" : "hourly",
    sessionCount: first?.count ?? "",
    sessionPrice: first?.price ?? "",
    extraSessionPrice: second?.price ?? "",
  };
}

export function buildRateBody(values, editing) {
  return {
    ...(editing ? {} : { id: values.id }),
    description: values.description,
    hourlyRate: values.pricingMode === "hourly" ? Number(values.hourlyRate) : 0,
    perSession: values.pricingMode === "perSession"
      ? [{ count: Number(values.sessionCount), price: Number(values.sessionPrice) }, { price: Number(values.extraSessionPrice) }]
      : [],
  };
}

export function RateEditor() {
  const rate = useLoaderData();
  const { rateID } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(rateID);
  const [submitError, setSubmitError] = React.useState("");

  const formik = useFormik({
    initialValues: rateFormValues(rate),
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");
      const body = buildRateBody(values, editing);
      const response = editing
        ? await AdminPutter(`/api/v1/admin/rates/${rateID}`, body)
        : await AdminPoster("/api/v1/admin/rates", body);
      setSubmitting(false);
      if (response?.ok) {
        navigate("/admin/rates");
      } else if (response) {
        const error = await response.json();
        setSubmitError(error.error_message || "Unable to save rate.");
      } else {
        setSubmitError("Unable to save rate.");
      }
    },
  });

  return (
    <Container maxW="4xl">
      <Stack spacing={6}>
        <PageHeader title={editing ? "Edit rate" : "Add rate"} />
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={4}>
            {editing ? <Text>ID: {formik.values.id}</Text> : <label>ID<Input name="id" value={formik.values.id} onChange={formik.handleChange} /></label>}
            <label>Description<Input name="description" value={formik.values.description} onChange={formik.handleChange} /></label>
            <FormControl>
              <FormLabel>Pricing type</FormLabel>
              <RadioGroup value={formik.values.pricingMode} onChange={(value) => formik.setFieldValue("pricingMode", value)}>
                <Stack direction="row">
                  <Radio value="hourly">Hourly rate</Radio>
                  <Radio value="perSession">Progressive per-session pricing</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            {formik.values.pricingMode === "hourly" && <label>Hourly rate<Input name="hourlyRate" type="number" min="0" step="0.01" value={formik.values.hourlyRate} onChange={formik.handleChange} /></label>}
            {formik.values.pricingMode === "perSession" && <Stack padding={4} borderWidth="1px" borderRadius="md">
              <Text fontWeight="bold">Up to the included session count</Text>
              <label>Session count<Input name="sessionCount" type="number" min="1" step="1" value={formik.values.sessionCount} onChange={formik.handleChange} /></label>
              <label>Fixed price<Input name="sessionPrice" type="number" min="0" step="0.01" value={formik.values.sessionPrice} onChange={formik.handleChange} /></label>
              <label>Price per additional session<Input name="extraSessionPrice" type="number" min="0" step="0.01" value={formik.values.extraSessionPrice} onChange={formik.handleChange} /></label>
            </Stack>}
            {submitError && <Text color="red.500">{submitError}</Text>}
            <RoundedButton type="submit" isLoading={formik.isSubmitting}>Save rate</RoundedButton>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
