import { Flex, IconButton } from '@chakra-ui/core';
import React from 'react';
import { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

// created Fragment to simply
// Passing the entire post object in case 
// more fields need to be added to this component
// the object will be updated automatically
interface UpdootSection {
    post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSection> = ({ post }) => {

    // created union state
    // since fetching would not infer for which button is would be "fetching"
    const [loadingState, setLoadingState] = useState<'up-loading' | 'down-loading' | 'not-loading'>('not-loading');
    const [, vote] = useVoteMutation();
 
    return (
        <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
          <IconButton 
          icon="chevron-up" 
          aria-label="UP" 
          isLoading={loadingState === 'up-loading'}
          onClick={async () => {
            if(post.voteStatus === 1) {
              return;
            }
            setLoadingState('up-loading')
            vote({
                postId: post.id,
                value: 1 
            })
            setLoadingState('not-loading')
            }}
            variantColor={post.voteStatus === 1 ? "green" : undefined}
          /> 
          {post.points}
          <IconButton 
          icon="chevron-down" 
          aria-label="DOWN"
          isLoading={loadingState === 'down-loading'}
          onClick={async () => {
            if(post.voteStatus === -1) {
              return;
            }
            setLoadingState('down-loading')
            vote({
                postId: post.id,
                value: -1 
            })
            setLoadingState('not-loading')
          }}
          variantColor={post.voteStatus === -1 ? "red" : undefined}
          />
        </Flex>
    )
}