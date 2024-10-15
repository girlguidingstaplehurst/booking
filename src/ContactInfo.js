import { Box, FormLabel, Heading, Input } from "@chakra-ui/react";

function ContactInfo({ formik }) {
  return (
    <>
      <Heading>Contact Info</Heading>
      <Box>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          id="name"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
      </Box>
      <Box>
        <FormLabel htmlFor="email">Email Address</FormLabel>
        <Input
          id="email"
          value={formik.values.email}
          onChange={formik.handleChange}
        />
      </Box>
    </>
  );
}

export default ContactInfo;
