import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLoaderData, useNavigate, useRevalidator } from "react-router-dom";
import { KeyholderEditor, Keyholders } from "./Keyholders";
import { AdminPutter } from "../Poster";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLoaderData: jest.fn(),
  useNavigate: jest.fn(),
  useRevalidator: jest.fn(),
}));

jest.mock("../Poster", () => ({
  AdminPoster: jest.fn(),
  AdminPutter: jest.fn(),
}));

describe("Keyholders list", () => {
  beforeEach(() => {
    useLoaderData.mockReturnValue([
      { id: "one", name: "Alice Smith", keyNumber: 12, active: true },
      { id: "two", name: "Bob Jones", keyNumber: 27, active: false },
    ]);
    useRevalidator.mockReturnValue({ revalidate: jest.fn() });
    AdminPutter.mockResolvedValue({ ok: true });
  });

  afterEach(() => jest.clearAllMocks());

  test("shows records in a table with add, edit, and enable/disable actions", () => {
    render(<MemoryRouter><Keyholders /></MemoryRouter>);

    expect(screen.getByRole("link", { name: "Add Keyholder" })).toHaveAttribute(
      "href",
      "/admin/keyholders/new",
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Key number")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Edit" })[0]).toHaveAttribute(
      "href",
      "/admin/keyholders/one/edit",
    );
    expect(screen.getByRole("button", { name: "Disable" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enable" })).toBeInTheDocument();
  });

  test("disables an active keyholder through the row action", async () => {
    render(<MemoryRouter><Keyholders /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Disable" }));

    await waitFor(() =>
      expect(AdminPutter).toHaveBeenCalledWith("/api/v1/admin/keyholders/one", {
        name: "Alice Smith",
        keyNumber: 12,
        active: false,
      }),
    );
  });
});

describe("Keyholder editor", () => {
  beforeEach(() => {
    useNavigate.mockReturnValue(jest.fn());
  });

  afterEach(() => jest.clearAllMocks());

  test("renders the add keyholder page", async () => {
    useLoaderData.mockReturnValue(null);

    render(<MemoryRouter><KeyholderEditor /></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole("button", { name: "Add Keyholder" })).toBeDisabled());

    expect(screen.getByRole("heading", { name: "Add Keyholder" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Keyholder" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute(
      "href",
      "/admin/keyholders",
    );
  });

  test("renders the edit page with the existing record", async () => {
    useLoaderData.mockReturnValue({
      id: "one",
      name: "Alice Smith",
      keyNumber: 12,
      active: true,
    });

    render(<MemoryRouter><KeyholderEditor /></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole("button", { name: "Save changes" })).not.toBeDisabled());

    expect(screen.getByRole("heading", { name: "Edit Keyholder" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Alice Smith")).toBeInTheDocument();
    expect(screen.getByDisplayValue("12")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /active/i })).toBeChecked();
  });
});
