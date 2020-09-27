import React from "react"
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Link } from "@chakra-ui/core";
import NextLink from 'next/link'


const Index = () => {

  const [{data}] = usePostsQuery();

  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>Create Post</Link>
      </NextLink>
      <div>Hello World</div>
      <br />
  {!data ? <div>Loading...</div> : data.posts.map(p => 
    <div key={p.id}>
      {p.title}
      <br/>
    </div>)}
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
 