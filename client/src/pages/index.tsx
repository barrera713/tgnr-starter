import React from "react"
import { NavBar } from "../components/NavBar"
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from "../generated/graphql";


const Index = () => {

  const [{data}] = usePostsQuery();

  return (
    <>
    <NavBar />
      <div>Hello World</div>
      <br />
  {!data ? <div>Loading...</div> : data.posts.map(p => 
    <div key={p.id}>
      {p.title}
      <br/>
    </div>)}
    </> 
  );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
 