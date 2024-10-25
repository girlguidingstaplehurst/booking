import { AdminFetcher } from "../../Fetcher";
import { useFormik } from "formik";
import { Box, ButtonGroup, Flex, Select, Skeleton, Text } from "@chakra-ui/react";
import RoundedButton from "../../components/RoundedButton";
import { useEffect, useState } from "react";
import { AdminPoster } from "../../Poster";

async function setRate(eventID, rateID) {
  const response = await AdminPoster(
    `/api/v1/admin/events/${eventID}/set-rate`,
    { rate: rateID },
  );
  if (response !== undefined) {
    return response.json();
  }
}

function RateSelect({ eventID, rateID = "default" }) {
  const [rates, setRates] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [settingRate, setSettingRate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const resp = await AdminFetcher("/api/v1/admin/rates", [
        {
          id: "default",
          description: "External Hire Rate",
          hourlyRate: 25,
        },
        {
          id: "regular-external",
          description: "Regular External Hire Rate",
          hourlyRate: 20,
        },
      ]);

      if (resp.json !== undefined) {
        return await resp.json();
      } else {
        return resp;
      }
    };
    fetchData().then((r) => {
      setRates(r);
      setLoaded(true);
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      rate: rateID,
    },
    onSubmit: async (values) => {
      setSettingRate(true);
      await setRate(eventID, values.rate);
      setSettingRate(false);
    },
  });

  return (
    <Skeleton isLoaded={loaded}>
      <form onChange={formik.handleChange} onSubmit={formik.handleSubmit}>
        <Flex gap={2}>
          <Box flex="1">
            <Select
              name="rate"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {rates.map((item) => (
                <option
                  value={item.id}
                  key={item.id}
                  selected={item.id === formik.values.rate}
                >
                  {item.description} - £{item.hourlyRate}/hour
                </option>
              ))}
            </Select>
          </Box>
          <ButtonGroup>
            <RoundedButton
              colorScheme="brand"
              isDisabled={!formik.dirty}
              isLoading={settingRate}
              type="submit"
            >
              Update
            </RoundedButton>
          </ButtonGroup>
        </Flex>
      </form>
    </Skeleton>
  );
}

export default RateSelect;
