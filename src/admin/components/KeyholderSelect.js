import { FormControl, FormLabel, Select } from "@chakra-ui/react";
import React from "react";
import { AdminFetcher } from "../../Fetcher";

export async function keyholdersLoader() {
  const response = await AdminFetcher("/api/v1/admin/keyholders", []);
  if (response?.json) {
    return await response.json();
  }
  return response || [];
}

export function KeyholderSelect({
  label,
  name,
  value,
  onChange,
  currentName,
  currentID,
}) {
  const [keyholders, setKeyholders] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    keyholdersLoader().then((loaded) => {
      if (mounted) {
        setKeyholders(Array.isArray(loaded) ? loaded : []);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const options = keyholders.filter(
    (keyholder) => keyholder.active || keyholder.id === currentID,
  );
  const hasCurrentOption = currentID && options.some(({ id }) => id === currentID);

  return (
    <FormControl>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Select id={name} name={name} value={value || ""} onChange={onChange}>
        <option value="">Unassigned</option>
        {currentID && !hasCurrentOption && (
          <option value={currentID}>{currentName || "Current keyholder"}</option>
        )}
        {options.map((keyholder) => (
          <option key={keyholder.id} value={keyholder.id}>
            {keyholder.name}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}
