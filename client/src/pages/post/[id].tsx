import { Box, Heading } from '@chakra-ui/core'
import { withUrqlClient } from 'next-urql'
import React from 'react'
import { EditAndDeleteBtns } from '../../components/EditAndDeleteBtns'
import { Layout } from '../../components/Layout'
import { useFindUserQuery } from '../../generated/graphql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import { GetPostUrl } from '../../utils/getPostUrl'


const Post = () => {
    const [{data, fetching, error}] = GetPostUrl(); 
    const [{data:  meData}] = useFindUserQuery()
 
    if(fetching) {
        return(
            <Layout>
                <div>
                Loading...
                </div>
            </Layout>
        )
    }

    if(error) {
        return(<Layout>
            {error}
        </Layout>)
    }

    if(!data?.post) {
        return (
            <Layout>
                <Box>
                    Could not find the post you were loooking for...
                </Box>
            </Layout>
        )
    }
    
    return(
    <Layout>
        <Heading mb={4}>{data.post.title}</Heading>
        {data.post.text}
        { meData?.findUser?.id === data.post.creatorId ?
        <EditAndDeleteBtns id={data.post.id}/>
        : null
        }
    </Layout>)
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);