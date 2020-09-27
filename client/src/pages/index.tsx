import React from "react"
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Box, Heading, Link, Stack, Text} from "@chakra-ui/core";
import NextLink from 'next/link'


const Index = () => {

  const [{data}] = usePostsQuery({
    variables: {
      limit: 10
    }
  });

  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>Create Post</Link>
      </NextLink>
      <div>Hello World</div>
      <br />
  {!data ? 
  (<div>Loading...</div>)
  : ( 
    <Stack spacing={8}>
    {data.posts.map((p) => (
      // <div key={p.id}>{p.title}</div>
      <Box key={p.id} shadow='md' p={2} borderWidth="1px">
        <Heading fontSize="xl">{p.title}</Heading>
        <Text mt={4}>{p.textSnippet}</Text>
      </Box>
    ))}
    </Stack>
    )}
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
 