import * as contentful from "contentful";
import { Heading, Link, List, ListItem, OrderedList, Skeleton, Stack, Text, UnorderedList } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import dayjs from "dayjs";

const client = contentful.createClient({
  space: "o3u1j7dkyy42",
  accessToken: "mnamX4N0qebOgpJN6KJVgakUGcSLFrFEvcHhdtcEO14",
});

function ManagedContent({ name }) {
  const [content, setContent] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const getContent = async () => {
      const entry = await client.getEntries({
        content_type: "klgcPage",
        limit: 1,
        "fields.name": name,
      });
      return entry.items[0];
    };

    getContent().then((item) => {
      setContent(item);
      setLoaded(true);
    });
  }, [name]);

  const options = {
    renderMark: {
      [MARKS.BOLD]: (text) => <b>{text}</b>,
    },
    renderNode: {
      [BLOCKS.HEADING_2]: (node, children) => <Heading size="lg">{children}</Heading>,
      [BLOCKS.HEADING_3]: (node, children) => <Heading size="md">{children}</Heading>,
      [BLOCKS.HEADING_4]: (node, children) => <Heading size="sm">{children}</Heading>,
      [BLOCKS.PARAGRAPH]: (node, children) => <Text>{children}</Text>,
      [BLOCKS.OL_LIST]: (node, children) => <OrderedList>{children}</OrderedList>,
      [BLOCKS.UL_LIST]: (node, children) => <UnorderedList>{children}</UnorderedList>,
      [BLOCKS.LIST_ITEM]: (node, children) => <ListItem>{children}</ListItem>,
      [INLINES.HYPERLINK]: (node, children) => <Link>{children}</Link>,
    },
  };

  return (
    <Skeleton isLoaded={loaded}>
      <Stack gap={4}>
        <Heading>{content.fields?.heading}</Heading>
        <Text>Last updated {dayjs(content.sys?.updatedAt).toString()}</Text>
        {documentToReactComponents(content.fields?.richContent, options)}
      </Stack>
    </Skeleton>
  );
}

export default ManagedContent;
