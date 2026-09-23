import {
  Box,
  Button,
  Divider,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DateTimeRangeAccumulator from "./DateTimeRangeAccumulator";

const emptyDateSet = () => ({ id: Date.now() + Math.random() });

export function findDuplicateOccurrences(dateSets) {
  const seen = new Set();
  const duplicates = new Set();

  dateSets.flatMap(({ instances }) => instances || []).forEach(({ from, to }) => {
    const key = `${from}|${to}`;
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  });

  return duplicates;
}

export function flattenDateSetInstances(dateSets) {
  return dateSets.flatMap(({ instances }) => instances || []);
}

function MultiDateTimeRangeAccumulator({ setter, label = "Event Dates", initialTimeRanges = [] }) {
  const [dateSets, setDateSets] = useState(() => [emptyDateSet()]);
  const [instancesBySet, setInstancesBySet] = useState({});

  const updateSet = useCallback((id, instances) => {
    setInstancesBySet((current) => ({ ...current, [id]: instances }));
  }, []);

  const removeSet = (id) => {
    setDateSets((current) => current.filter((dateSet) => dateSet.id !== id));
    setInstancesBySet((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const setData = useMemo(() => dateSets.map((dateSet) => ({
    ...dateSet,
    instances: instancesBySet[dateSet.id] || [],
  })), [dateSets, instancesBySet]);
  const instances = useMemo(() => flattenDateSetInstances(setData), [setData]);
  const duplicates = useMemo(() => findDuplicateOccurrences(setData), [setData]);

  const hasEmptySet = setData.some(({ instances: setInstances }) => !setInstances.length);
  const duplicateError = duplicates.size
    ? "Remove duplicate date and time occurrences before submitting."
    : "";

  const combinedError = duplicateError || (hasEmptySet ? "Complete each date set and select at least one occurrence." : "");
  useEffect(() => {
    setter(combinedError ? [] : instances);
  }, [combinedError, instances, setter]);

  return (
    <Box>
      <Text fontWeight="bold" marginBottom={2}>{label}</Text>
      {dateSets.map((dateSet, index) => (
        <DateSetEditor
          key={dateSet.id}
          dateSet={dateSet}
          index={index}
          canRemove={dateSets.length > 1}
          onRemove={removeSet}
          onUpdate={updateSet}
          initialTimes={index === 0 ? initialTimeRanges : []}
        />
      ))}
      {combinedError && <Text color="red.500" marginBottom={3}>{combinedError}</Text>}
      <Button type="button" onClick={() => setDateSets((current) => [...current, emptyDateSet()])}>
        Add another date set
      </Button>
      <Divider marginTop={4} />
      <Text fontWeight="bold" marginTop={3}>
        {instances.length} total occurrence{instances.length === 1 ? "" : "s"} will be submitted
      </Text>
    </Box>
  );
}

function DateSetEditor({ dateSet, index, canRemove, onRemove, onUpdate, initialTimes }) {
  const update = useCallback(
    (nextInstances) => onUpdate(dateSet.id, nextInstances),
    [dateSet.id, onUpdate],
  );

  return (
    <Box borderWidth="1px" borderRadius="md" padding={4} marginBottom={4}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom={2}>
        <Text fontWeight="bold">Date set {index + 1}</Text>
        {canRemove && (
          <Button type="button" size="sm" onClick={() => onRemove(dateSet.id)}>
            Remove date set
          </Button>
        )}
      </Flex>
      <DateTimeRangeAccumulator
        setter={update}
        label=""
        idPrefix={`date-set-${dateSet.id}`}
        initialTimes={initialTimes}
      />
    </Box>
  );
}

export default MultiDateTimeRangeAccumulator;
