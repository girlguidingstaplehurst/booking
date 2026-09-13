import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";

import ThankYou from "./ThankYou";

jest.mock("./components/ManagedContent", () => function ManagedContent() {
  return <div>Managed thank-you content</div>;
});

test("renders a return link independently of managed content", () => {
  render(
    <ChakraProvider>
      <MemoryRouter>
        <ThankYou />
      </MemoryRouter>
    </ChakraProvider>,
  );

  expect(screen.getByText("Managed thank-you content")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Return to main page" })).toHaveAttribute(
    "href",
    "/",
  );
});
