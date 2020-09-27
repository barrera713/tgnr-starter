import React from "react"
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Box, Button, Flex, Heading, Link, Stack, Text} from "@chakra-ui/core";
import NextLink from 'next/link'
import { useState } from "react";


const Index = () => {

  const [variables, setVariables] = useState({limit: 10, cursor: null as null | string })
  const [{ data, fetching }] = usePostsQuery({
    variables
  });

  if(!data && !fetching) {
    return <div>Something went wrong.</div>
  }

  return (
    <Layout>
      <Flex p={4}>
        <Heading>SubReddit</Heading>
      <NextLink href="/create-post">
        <Link ml="auto">
          <Button>Create Post</Button>
        </Link>
      </NextLink>
      </Flex>
  {!data && fetching ? 
  (<div>Loading...</div>)
  : ( 
    <Stack spacing={8}>  
    { /* ! declares data to be defined since Typescript cannot infer it */ 
    data!.posts.map((p) => (
      <Box key={p.id} shadow='md' p={2} borderWidth="1px">
        <Heading fontSize="xl">{p.title}</Heading>
        <Text mt={4}>{p.textSnippet}</Text>
      </Box>
    ))}
    </Stack>
    )}
    { data ?
    <Flex>
      <Button
      isLoading={fetching}
      m="auto"
      my={10}
      onClick={() => {
        setVariables({
          limit: variables.limit,
          cursor: data.posts[data.posts.length - 1].createdAt
        })
      }}
      >
        Load More...
      </Button>
    </Flex>
    : null }
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
 