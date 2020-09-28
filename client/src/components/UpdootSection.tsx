import { Flex, IconButton } from '@chakra-ui/core';
import React from 'react';
import { PostsQuery } from '../generated/graphql';


// Passing the entire post object in case 
// more fields need to be added to this component
// the object will be updated automatically
interface UpdootSection {
    post: PostsQuery["posts"]["posts"][0]
}

export const UpdootSection: React.FC<UpdootSection> = ({ post }) => {
    return (
        <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
          <IconButton icon="chevron-up" aria-label="UP" /> 
          {post.points}
          <IconButton icon="chevron-down" aria-label="DOWN" />
        </Flex>
    )
}