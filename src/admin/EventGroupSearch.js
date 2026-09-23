import { Box, Heading, Input, SimpleGrid, Spinner, Text } from "@chakra-ui/react";
import React from "react";
import { searchEventGroups } from "../Fetcher";
import { Link as ReactRouterLink } from "react-router-dom";
import RoundedButton from "../components/RoundedButton";
import dayjs from "dayjs";

export function EventGroupSearch() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const requestID = React.useRef(0);

  React.useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    const id = ++requestID.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      const response = await searchEventGroups(trimmed);
      if (id !== requestID.current) return;
      const data = response?.json ? await response.json() : response;
      setResults(Array.isArray(data) ? data : []);
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Box>
      <Heading size="md" marginBottom={4}>Event Group Search</Heading>
      <Input
        aria-label="Event Group Search"
        placeholder="Search event group titles"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {loading && <Spinner marginTop={4} aria-label="Searching" />}
      {!loading && query.trim().length >= 3 && results.length === 0 && (
        <Text marginTop={4}>No event groups found.</Text>
      )}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} marginTop={4}>
        {results.map((group) => (
          <Box key={group.id} borderRadius="md" overflow="hidden" boxShadow="md">
            <Box backgroundColor="brand.300" padding={5}>
              <Text color="brand.900" fontSize="xl" fontWeight="bold">{group.name}</Text>
              <Text color="white" fontSize="md" fontWeight="bold">Event Group</Text>
            </Box>
            <Box backgroundColor="white" padding={5}>
              <Text color="brand.900" fontSize="lg" fontWeight="semibold">
                {dayjs(group.from).format("ddd MMM D")}
              </Text>
              <Text color="brand.300" marginTop={2}>
                {`${dayjs(group.from).format("h:mm A")} - ${dayjs(group.to).format("h:mm A")}`}
              </Text>
              <RoundedButton as={ReactRouterLink} to={`/admin/review-group/${group.id}`} marginTop={4}>
                Review
              </RoundedButton>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
