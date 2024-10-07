import {
  Heading,
  Link,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Link as ReactRouterLink, useLoaderData } from "react-router-dom";
import dayjs from "dayjs";

export async function populateAdminHome() {
  return await fetch("/api/v1/events");
}

export function AdminHome() {
  let eventsList = useLoaderData();
  if (eventsList.events === undefined || eventsList.events === null) {
    eventsList = {
      events: [
        {
          id: "aaabbbccc",
          name: "Fake Event Right now",
          from: dayjs().startOf("hour").toDate(),
          to: dayjs().endOf("hour").toDate(),
          status: "provisional",
        },
      ],
    };
  }

  return (
    <Stack spacing={4}>
        <Table variant="striped">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>From</Th>
            <Th>To</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {eventsList.events.map((event) => (
            <Tr>
              <Td>{event.name}</Td>
              <Td>{dayjs(event.from).format("YYYY-MM-DD HH:mm:ss")}</Td>
              <Td>{dayjs(event.to).format("YYYY-MM-DD HH:mm:ss")}</Td>
              <Td>{event.status}</Td>
              <Td>
                <Link as={ReactRouterLink} to={"/admin/review/" + event.id}>
                  Review
                </Link>
              </Td>
          </Tr>
          ))}
        </Tbody>
      </Table>
    </Stack>
  );
}
