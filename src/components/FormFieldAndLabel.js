import { Box, Flex, FormLabel, Input, Spacer, Text } from "@chakra-ui/react";

function FormFieldAndLabel({
  label,
  name,
  value,
  errValue,
  onChange,
  onBlur,
  fieldProps,
  fieldAs = Input,
}) {
  const Field = fieldAs;
  return (
    <Box>
      <Flex>
        <FormLabel htmlFor={name}>{label}</FormLabel>
        <Spacer />
        {errValue ? <Text>{errValue}</Text> : null}
      </Flex>
      <Field
        id={name}
        name={name}
        isInvalid={errValue}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        {...fieldProps}
      />
    </Box>
  );
}

export default FormFieldAndLabel;
