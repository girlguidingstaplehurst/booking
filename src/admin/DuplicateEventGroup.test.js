import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { useLoaderData } from "react-router-dom";
import { DuplicateEventGroup } from "./DuplicateEventGroup";

jest.mock("react-router-dom", () => ({
  useLoaderData: jest.fn(),
  useNavigate: () => jest.fn(),
}));

jest.mock("../Poster", () => ({ AdminPoster: jest.fn() }));
jest.mock("./components/RateSelect", () => ({ RateSelect: ({ rateID }) => <select aria-label="Rate" value={rateID} readOnly><option value={rateID}>{rateID}</option></select> }));
jest.mock("./components/KeyholderSelect", () => ({ KeyholderSelect: ({ value }) => <select aria-label="Keyholder" value={value} readOnly><option value={value}>{value}</option></select> }));

describe("DuplicateEventGroup", () => {
  test("copies setup, leaves dates empty, and exposes editable rate and keyholder", () => {
    useLoaderData.mockReturnValue({
      group: { id: "group-1", name: "Summer Sessions" },
      source: {
        name: "Summer Sessions",
        details: "Details",
        visible: true,
        contact: "alex@example.com",
        contactName: "Alex Booker",
        rate: "old-rate",
        keyholder: "old-keyholder",
        keyholderName: "Old Keyholder",
      },
    });
    render(<ChakraProvider><DuplicateEventGroup /></ChakraProvider>);
    expect(screen.getByDisplayValue("Summer Sessions")).toBeDisabled();
    expect(screen.getByDisplayValue("Details")).toBeDisabled();
    expect(screen.getByLabelText("Rate")).toHaveValue("old-rate");
    expect(screen.getByLabelText("Keyholder")).toHaveValue("old-keyholder");
    expect(screen.getByText("New Event Dates")).toBeInTheDocument();
  });
});
