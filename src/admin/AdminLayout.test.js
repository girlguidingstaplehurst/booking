import { ChakraProvider, extendTheme, useBreakpoint } from "@chakra-ui/react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import AdminLayout from "./AdminLayout";

jest.mock("@chakra-ui/react", () => ({
  ...jest.requireActual("@chakra-ui/react"),
  useBreakpoint: jest.fn(),
}));

jest.mock("./RequireAuth", () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock("./components/AdminHeader", () => ({
  __esModule: true,
  default: () => null,
}));

const theme = extendTheme({
  colors: {
    brand: {
      300: "#00a7e5",
      500: "#007bc4",
      900: "#161b4e",
    },
  },
});

function renderAdmin(initialEntry = "/admin") {
  const router = createMemoryRouter([
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { index: true, element: <div>Dashboard content</div> },
        { path: "rates", element: <div>Rates content</div> },
      ],
    },
  ], { initialEntries: [initialEntry] });

  render(
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>,
  );

  return router;
}

describe("AdminLayout navigation", () => {
  beforeEach(() => {
    useBreakpoint.mockReturnValue("md");
    window.matchMedia = jest.fn(() => ({
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders desktop Dashboard and Rates links with the current route marked", () => {
    renderAdmin("/admin/rates");

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: "Rates" })).toHaveAttribute("href", "/admin/rates");
    expect(screen.getByRole("link", { name: "Rates" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
    expect(screen.queryByRole("button", { name: "Open Admin Navigation Menu" })).not.toBeInTheDocument();
  });

  test("renders only Dashboard and Rates in the narrow-viewport drawer", () => {
    useBreakpoint.mockReturnValue("base");
    renderAdmin();

    fireEvent.click(screen.getByRole("button", { name: "Open Admin Navigation Menu" }));
    const drawer = screen.getByRole("dialog");

    expect(within(drawer).getAllByRole("link")).toHaveLength(2);
    expect(within(drawer).getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: "Rates" })).toBeInTheDocument();
    expect(within(drawer).queryByRole("link", { name: /invoice|event/i })).not.toBeInTheDocument();
  });

  test("closes the drawer after navigating to Rates", async () => {
    useBreakpoint.mockReturnValue("sm");
    const router = renderAdmin();

    fireEvent.click(screen.getByRole("button", { name: "Open Admin Navigation Menu" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Rates" }));

    expect(router.state.location.pathname).toBe("/admin/rates");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
