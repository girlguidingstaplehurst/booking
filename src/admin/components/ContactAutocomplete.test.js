import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { ContactAutocomplete } from "./ContactAutocomplete";
import { listContacts } from "../../Fetcher";

jest.mock("../../Fetcher", () => ({ listContacts: jest.fn() }));

describe("ContactAutocomplete", () => {
  function Harness() {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    return (
      <ContactAutocomplete
        name={name}
        email={email}
        onNameChange={(event) => setName(event.target.value)}
        onEmailChange={(event) => setEmail(event.target.value)}
      />
    );
  }

  beforeEach(() => {
    listContacts.mockResolvedValue([
      { name: "Alex Booker", email: "alex@example.org" },
      { name: "Alex Smith", email: "smith@example.org" },
      { name: "Alex Booker", email: "other@example.org" },
    ]);
  });

  test("filters case-insensitively and selects name and email", async () => {
    render(<Harness />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { name: "name", value: "booker" } });
    fireEvent.focus(input);

    expect(await screen.findAllByRole("option")).toHaveLength(2);
    fireEvent.click(screen.getByText("alex@example.org"));

    expect(screen.getByRole("combobox")).toHaveValue("Alex Booker");
    expect(screen.getByLabelText("Email")).toHaveValue("alex@example.org");
  });

  test("allows unmatched entry and keyboard selection", async () => {
    render(<Harness />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { name: "name", value: "New Contact" } });
    fireEvent.focus(input);
    expect(screen.queryByRole("option")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { name: "name", value: "Alex" } });
    await screen.findAllByRole("option");
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(screen.getByLabelText("Email")).toHaveValue("alex@example.org"));
  });

  test("treats an invalid response as an empty suggestion list", async () => {
    listContacts.mockResolvedValue(undefined);
    render(
      <ContactAutocomplete
        name="New Contact"
        email=""
        onNameChange={jest.fn()}
        onEmailChange={jest.fn()}
      />,
    );

    fireEvent.focus(screen.getByRole("combobox"));
    await waitFor(() => expect(listContacts).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
});
