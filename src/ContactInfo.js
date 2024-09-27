import { FormLabel, Grid, GridItem, Heading, Input } from "@chakra-ui/react";

function ContactInfo({ formik }) {
  return (
    <>
      <Heading>Contact Info</Heading>
      <Grid columns={2} gap={4}>
        <GridItem>
          <FormLabel htmlFor="name">Name</FormLabel>
          <Input
            id="name"
            value={formik.values.name}
            onChange={formik.handleChange}
          />
        </GridItem>
        <GridItem>
          <FormLabel htmlFor="telephone">Telephone</FormLabel>
          <Input
            id="telephone"
            value={formik.values.telephone}
            onChange={formik.handleChange}
          />
        </GridItem>
        <GridItem colSpan={2}>
          <FormLabel htmlFor="email">Email Address</FormLabel>
          <Input
            id="email"
            value={formik.values.email}
            onChange={formik.handleChange}
          />
        </GridItem>
      </Grid>
    </>
  );
}

export default ContactInfo;
