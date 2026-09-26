import { ChakraProvider, extendTheme, useBreakpoint } from "@chakra-ui/react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { authenticatedLoader, getStoredToken, requireAdminAuth } from "./auth";

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

function renderAdmin(initialEntry = "/admin", dashboardLoader) {
  const router = createMemoryRouter([
    {
      path: "/admin",
      element: <AdminLayout />,
      loader: requireAdminAuth,
      children: [
        ...(dashboardLoader
          ? [{ index: true, element: <div>Dashboard content</div>, loader: authenticatedLoader(dashboardLoader) }]
          : [{ index: true, element: <div>Dashboard content</div> }]),
        { path: "rates", element: <div>Rates content</div> },
        { path: "keyholders", element: <div>Keyholders content</div> },
      ],
    },
    { path: "/login", element: <div>Login content</div> },
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
    sessionStorage.setItem("token", JSON.stringify("valid-token"));
    useBreakpoint.mockReturnValue("md");
    window.matchMedia = jest.fn(() => ({
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test("renders desktop Dashboard and Rates links with the current route marked", async () => {
    renderAdmin("/admin/rates");

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/admin");
      expect(screen.getByRole("link", { name: "Rates" })).toHaveAttribute("href", "/admin/rates");
      expect(screen.getByRole("link", { name: "Keyholders" })).toHaveAttribute("href", "/admin/keyholders");
      expect(screen.getByRole("link", { name: "Rates" })).toHaveAttribute("aria-current", "page");
      expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
      expect(screen.queryByRole("button", { name: "Open Admin Navigation Menu" })).not.toBeInTheDocument();
    });
  });

  test("renders Dashboard, Rates, and Keyholders in the narrow-viewport drawer", async () => {
    useBreakpoint.mockReturnValue("base");
    renderAdmin();

    await waitFor(() => expect(screen.getByRole("button", { name: "Open Admin Navigation Menu" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Open Admin Navigation Menu" }));
    const drawer = screen.getByRole("dialog");

    expect(within(drawer).getAllByRole("link")).toHaveLength(4);
    expect(within(drawer).getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: "Rates" })).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: "Keyholders" })).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: "Invoice by contact" })).toBeInTheDocument();
  });

  test("closes the drawer after navigating to Rates", async () => {
    useBreakpoint.mockReturnValue("sm");
    const router = renderAdmin();

    await waitFor(() => expect(screen.getByRole("button", { name: "Open Admin Navigation Menu" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Open Admin Navigation Menu" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Rates" }));

    expect(router.state.location.pathname).toBe("/admin/rates");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  test("redirects to login before loading the dashboard without a token", async () => {
    sessionStorage.clear();
    expect(getStoredToken()).toBeNull();
    const dashboardLoader = jest.fn();
    const response = await authenticatedLoader(dashboardLoader)();

    expect(response.headers.get("Location")).toBe("/login");
    expect(dashboardLoader).not.toHaveBeenCalled();
  });

  test("redirects nested admin URLs to login without a token", async () => {
    sessionStorage.clear();
    const ratesLoader = jest.fn();
    const response = await authenticatedLoader(ratesLoader)();

    expect(response.headers.get("Location")).toBe("/login");
    expect(ratesLoader).not.toHaveBeenCalled();
  });
});
