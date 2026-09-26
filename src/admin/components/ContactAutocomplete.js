import { Box, FormLabel, Input, Text } from "@chakra-ui/react";
import React from "react";
import FormFieldAndLabel from "../../components/FormFieldAndLabel";
import { listContacts } from "../../Fetcher";

export function ContactAutocomplete({
  name,
  email,
  onNameChange,
  onEmailChange,
  nameError,
  emailError,
}) {
  const [contacts, setContacts] = React.useState([]);
  const [focused, setFocused] = React.useState(false);
  const [highlighted, setHighlighted] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    listContacts().then((loaded) => {
      if (mounted) setContacts(Array.isArray(loaded) ? loaded : []);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const query = (name || "").trim().toLowerCase();
  const matches = query
    ? contacts.filter((contact) =>
        typeof contact?.name === "string" && contact.name.toLowerCase().includes(query),
      )
    : [];

  const selectContact = (contact) => {
    onNameChange({ target: { name: "name", value: contact.name } });
    onEmailChange({ target: { name: "email", value: contact.email } });
    setFocused(false);
  };

  const onKeyDown = (event) => {
    if (!focused || matches.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((index) => (index + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) => (index - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      selectContact(matches[highlighted]);
    } else if (event.key === "Escape") {
      setFocused(false);
    }
  };

  return (
    <Box position="relative">
      <FormLabel htmlFor="name">Name</FormLabel>
      <Input
        id="name"
        name="name"
        value={name}
        isInvalid={nameError}
        onChange={onNameChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 0)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        role="combobox"
        aria-expanded={focused && matches.length > 0}
        aria-controls="contact-suggestions"
      />
      {focused && matches.length > 0 && (
        <Box
          id="contact-suggestions"
          role="listbox"
          position="absolute"
          zIndex={1}
          width="100%"
          background="white"
          borderWidth="1px"
          borderRadius="md"
          boxShadow="md"
        >
          {matches.map((contact, index) => (
            <Box
              key={contact.email}
              role="option"
              aria-selected={index === highlighted}
              padding={2}
              cursor="pointer"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectContact(contact)}
            >
              <Text>{contact.name}</Text>
              <Text fontSize="sm" color="gray.600">{contact.email}</Text>
            </Box>
          ))}
        </Box>
      )}
      <FormFieldAndLabel
        label="Email"
        name="email"
        value={email}
        errValue={emailError}
        onChange={onEmailChange}
      />
    </Box>
  );
}
