import {
  Badge,
  Button,
  Container,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Stack,
} from "@chakra-ui/react";
import React from "react";
import {
  Link as RouterLink,
  useLoaderData,
  useNavigate,
  useRevalidator,
} from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AdminPoster, AdminPutter } from "../Poster";
import FormFieldAndLabel from "../components/FormFieldAndLabel";
import RoundedButton from "../components/RoundedButton";
import PageHeader from "./components/PageHeader";
import { keyholdersLoader } from "./components/KeyholderSelect";

const schema = Yup.object({
  name: Yup.string().trim().required("Required"),
  keyNumber: Yup.number()
    .integer("Must be a whole number")
    .min(1, "Must be at least 1")
    .required("Required"),
});

function formValues(keyholder) {
  return {
    name: keyholder?.name || "",
    keyNumber: keyholder?.keyNumber ?? "",
    active: keyholder?.active ?? true,
  };
}

export async function keyholderEditorLoader({ params }) {
  if (!params.keyholderID) {
    return null;
  }
  const keyholders = await keyholdersLoader();
  return keyholders.find(({ id }) => id === params.keyholderID) || null;
}

async function readError(response, fallback) {
  if (!response) {
    return fallback;
  }
  try {
    const error = await response.json();
    return error.error_message || fallback;
  } catch (error) {
    return fallback;
  }
}

export function Keyholders() {
  const keyholders = useLoaderData() || [];
  const revalidator = useRevalidator();
  const [pendingID, setPendingID] = React.useState("");
  const [actionError, setActionError] = React.useState("");

  const setActive = async (keyholder) => {
    setPendingID(keyholder.id);
    setActionError("");
    const response = await AdminPutter(`/api/v1/admin/keyholders/${keyholder.id}`, {
      name: keyholder.name,
      keyNumber: keyholder.keyNumber,
      active: !keyholder.active,
    });
    setPendingID("");
    if (response?.ok) {
      revalidator.revalidate();
    } else {
      setActionError(await readError(response, "Unable to update keyholder status."));
    }
  };

  return (
    <Container maxW="4xl">
      <Stack spacing={4}>
        <PageHeader title="Keyholders">
          <RoundedButton as={RouterLink} to="/admin/keyholders/new">
            Add Keyholder
          </RoundedButton>
        </PageHeader>
        {actionError && <Text color="red">{actionError}</Text>}
        <TableContainer backgroundColor="white" borderRadius="md" boxShadow="md">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Key number</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {keyholders.map((keyholder) => (
                <Tr key={keyholder.id}>
                  <Td>{keyholder.name}</Td>
                  <Td>{keyholder.keyNumber}</Td>
                  <Td>
                    <Badge colorScheme={keyholder.active ? "green" : "gray"}>
                      {keyholder.active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  <Td>
                    <Stack direction={{ base: "column", sm: "row" }} spacing={2}>
                      <Button as={RouterLink} to={`/admin/keyholders/${keyholder.id}/edit`} size="sm">
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        colorScheme={keyholder.active ? "red" : "green"}
                        onClick={() => setActive(keyholder)}
                        isLoading={pendingID === keyholder.id}
                        isDisabled={Boolean(pendingID)}
                      >
                        {keyholder.active ? "Disable" : "Enable"}
                      </Button>
                    </Stack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Stack>
    </Container>
  );
}

export function KeyholderEditor() {
  const keyholder = useLoaderData();
  const navigate = useNavigate();
  const editing = Boolean(keyholder?.id);
  const [submitError, setSubmitError] = React.useState("");
  const formik = useFormik({
    initialValues: formValues(keyholder),
    enableReinitialize: true,
    validationSchema: schema,
    validateOnMount: true,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");
      const body = {
        name: values.name.trim(),
        keyNumber: Number(values.keyNumber),
        active: values.active,
      };
      const response = editing
        ? await AdminPutter(`/api/v1/admin/keyholders/${keyholder.id}`, body)
        : await AdminPoster("/api/v1/admin/keyholders", body);
      setSubmitting(false);
      if (response?.ok) {
        navigate("/admin/keyholders");
      } else {
        setSubmitError(await readError(response, "Unable to save keyholder."));
      }
    },
  });

  return (
    <Container maxW="4xl">
      <Stack spacing={6}>
        <PageHeader title={editing ? "Edit Keyholder" : "Add Keyholder"} />
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={4}>
            <FormFieldAndLabel
              label="Name"
              name="name"
              value={formik.values.name}
              errValue={formik.touched.name && formik.errors.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <FormFieldAndLabel
              label="Key number"
              name="keyNumber"
              type="number"
              value={formik.values.keyNumber}
              errValue={formik.touched.keyNumber && formik.errors.keyNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fieldProps={{ type: "number" }}
            />
            {editing && (
              <label>
                <input
                  type="checkbox"
                  name="active"
                  checked={formik.values.active}
                  onChange={formik.handleChange}
                />{" "}
                Active
              </label>
            )}
            <Text color="red">{submitError}</Text>
            <Stack direction="row">
              <RoundedButton
                type="submit"
                isLoading={formik.isSubmitting}
                isDisabled={!formik.isValid}
              >
                {editing ? "Save changes" : "Add Keyholder"}
              </RoundedButton>
              <Button as={RouterLink} to="/admin/keyholders">
                Cancel
              </Button>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
