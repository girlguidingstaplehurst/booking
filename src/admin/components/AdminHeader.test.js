import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import useAuth from "../useAuth";

jest.mock("../useAuth", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const theme = extendTheme({
  colors: {
    brand: {
      900: "#161b4e",
    },
  },
});

function renderHeader(email = "david.edmonds@kathielambcentre.org") {
  useAuth.mockReturnValue({ payload: { email } });

  return render(
    <ChakraProvider theme={theme}>
      <MemoryRouter>
        <AdminHeader />
      </MemoryRouter>
    </ChakraProvider>,
  );
}

describe("AdminHeader", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the desktop and compact mobile headings", () => {
    renderHeader();

    expect(screen.getByText("Booking Administration")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Admin" })).toBeInTheDocument();
  });

  test("keeps a long email address inside a wrapping text element", () => {
    const email = "david.edmonds@kathielambcentre.org";

    renderHeader(email);

    const emailElement = screen.getByText(email);
    expect(emailElement).toBeInTheDocument();
    expect(emailElement).toHaveStyle("overflow-wrap: anywhere");
  });

  test("preserves the exit destination", () => {
    renderHeader();

    expect(screen.getByRole("link", { name: "Exit Administration page" })).toHaveAttribute("href", "/");
  });
});
