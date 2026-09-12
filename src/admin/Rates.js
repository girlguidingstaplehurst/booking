import {
  Box,
  Button,
  Container,
  Heading,
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
import FormFieldAndLabel from "../components/FormFieldAndLabel";
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

export const rateSchema = Yup.object({
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
    ...(editing ? {} : { id: values.id.trim() }),
    description: values.description.trim(),
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
    validateOnMount: true,
    validationSchema: rateSchema,
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
        try {
          const error = await response.json();
          setSubmitError(error.error_message || "Unable to save rate.");
        } catch (error) {
          setSubmitError("Unable to save rate.");
        }
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
            {editing ? <Text>ID: {formik.values.id}</Text> : <FormFieldAndLabel
              label="ID"
              name="id"
              value={formik.values.id}
              errValue={formik.touched.id && formik.errors.id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />}
            <FormFieldAndLabel
              label="Description"
              name="description"
              value={formik.values.description}
              errValue={formik.touched.description && formik.errors.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <FormControl>
              <FormLabel>Pricing type</FormLabel>
              <RadioGroup value={formik.values.pricingMode} onChange={(value) => formik.setFieldValue("pricingMode", value)}>
                <Stack direction="row">
                  <Radio value="hourly">Hourly rate</Radio>
                  <Radio value="perSession">Progressive per-session pricing</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            {formik.values.pricingMode === "hourly" && <FormFieldAndLabel
              label="Hourly rate"
              name="hourlyRate"
              value={formik.values.hourlyRate}
              errValue={formik.touched.hourlyRate && formik.errors.hourlyRate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fieldProps={{ type: "number", min: "0", step: "0.01" }}
            />}
            {formik.values.pricingMode === "perSession" && <Stack padding={4} borderWidth="1px" borderRadius="md">
              <Text fontWeight="bold">Up to the included session count</Text>
              <FormFieldAndLabel
                label="Session count"
                name="sessionCount"
                value={formik.values.sessionCount}
                errValue={formik.touched.sessionCount && formik.errors.sessionCount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fieldProps={{ type: "number", min: "1", step: "1" }}
              />
              <FormFieldAndLabel
                label="Fixed price"
                name="sessionPrice"
                value={formik.values.sessionPrice}
                errValue={formik.touched.sessionPrice && formik.errors.sessionPrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fieldProps={{ type: "number", min: "0", step: "0.01" }}
              />
              <FormFieldAndLabel
                label="Price per additional session"
                name="extraSessionPrice"
                value={formik.values.extraSessionPrice}
                errValue={formik.touched.extraSessionPrice && formik.errors.extraSessionPrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fieldProps={{ type: "number", min: "0", step: "0.01" }}
              />
            </Stack>}
            {submitError && <Text color="red.500">{submitError}</Text>}
            <RoundedButton
              type="submit"
              isLoading={formik.isSubmitting}
              isDisabled={!formik.isValid || formik.isSubmitting}
            >
              Save rate
            </RoundedButton>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
