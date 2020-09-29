import { Box, IconButton, Link } from '@chakra-ui/core';
import React from 'react';
import NextLink from 'next/link'; 
import { useDeletePostMutation } from '../generated/graphql';


interface EditAndDeleteBtnsProps {
    id: number,

}

export const EditAndDeleteBtns: React.FC<EditAndDeleteBtnsProps>=({id}) => {

    const [, deletePost] = useDeletePostMutation()

    return (
        <Box>
        <IconButton 
        mr={4}
        icon="delete" 
        aria-label="Delete Post" 
        variantColor="red" 
        onClick={() => {
          deletePost({ id });
        }}
        />
        <NextLink href="post/edit/[id]" as={`post/edit/${id}`}>
          <IconButton 
          as={Link}
          icon="edit" 
          aria-label="Edit Post" 
          variantColor="teal" 
          />
        </NextLink>
      </Box>
    )
}