import React from "react"
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text} from "@chakra-ui/core";
import NextLink from 'next/link'
import { useState } from "react";


const Index = () => {

  const [variables, setVariables] = useState({limit: 15, cursor: null as null | string })
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
    data!.posts.posts.map((p) => (
      <Flex key={p.id} shadow='md' p={2} borderWidth="1px">
        <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
          <IconButton icon="chevron-up" aria-label="UP" /> 
          {p.points}
          <IconButton icon="chevron-down" aria-label="DOWN" />
        </Flex>
        <Box>
          <Heading fontSize="xl">{p.title}</Heading>
          <Text>posted by {p.creator.username}</Text>
          <Text mt={4}>{p.textSnippet}</Text>  
        </Box>
      </Flex>
    ))}
    </Stack>
    )}
    { data && data.posts.hasMore ? (
    <Flex> 
      <Button
      isLoading={fetching}
      m="auto"
      my={10}
      onClick={() => {
        setVariables({
          limit: variables.limit,
          cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
        })
      }}
      >
        Load More...
      </Button>
    </Flex>
    )
    : null }
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
 