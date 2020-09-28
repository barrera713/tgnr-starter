import React from "react"
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text} from "@chakra-ui/core";
import NextLink from 'next/link'
import { useState } from "react";
import { UpdootSection } from "../components/UpdootSection";


const Index = () => {

  const [, deletePost] = useDeletePostMutation()
  const [variables, setVariables] = useState({limit: 15, cursor: null as null | string })
  const [{ data, fetching }] = usePostsQuery({
    variables
  });

  if(!data && !fetching) {
    return <div>Something went wrong.</div>
  }

  return (
    <Layout>
  {!data && fetching ? 
  (<div>Loading...</div>)
  : ( 
    <Stack spacing={8}>  
    { /* ! declares data to be defined since Typescript cannot infer it */ 
    data!.posts.posts.map((p) => (
      <Flex key={p.id} shadow='md' p={2} borderWidth="1px">
        <UpdootSection post={p} />
        <Box flex={1}>
          <NextLink href="/post/[id]" as={`/post/${p.id}`}>
            <Link>
              <Heading fontSize="xl">{p.title}</Heading>
            </Link>
          </NextLink>
          <Text>posted by {p.creator.username}</Text>
          <Flex align="center">
            <Text mt={4}>{p.textSnippet}</Text>  
            <IconButton 
            icon="delete" 
            aria-label="Delete Post" 
            ml="auto" 
            variantColor="red" 
            onClick={() => {
              deletePost({ id: p.id });
            }}
            />
          </Flex>
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
 