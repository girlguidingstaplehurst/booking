import { Flex, Heading, Image, Stack, Text, useToken } from "@chakra-ui/react";

function HeroImageAndText({ fields, children }) {
  const image = <Image
    boxSize="50%"
    objectFit="contain"
    src={fields.heroImage.fields.file.url}
    alt={fields.heroImage.fields.description}
  />

  const text = (
    <Stack gap={4} flex="1">
      <Heading size="lg" colorScheme="brand">
        {fields.title}
      </Heading>
      <Text>{fields.content}</Text>
    </Stack>
  );

  if (fields.heroImagePosition === "Right") {
    return (
      <Flex gap={4}>
        {text}
        {image}
      </Flex>
    )
  } else {
    return (
      <Flex gap={4}>
        {image}
        {text}
      </Flex>
    )
  }
}

export default HeroImageAndText;
