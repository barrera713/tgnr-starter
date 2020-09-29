import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { GetPostUrl } from '../../../utils/getPostUrl';
import { useGetPostId } from '../../../utils/useGetPostId';



const EditPost = ({}) => {

    const router = useRouter();
    const intId = useGetPostId();
    const [{ data, fetching, error}] = GetPostUrl();
    const [] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId 
        }
    });
    const [, updatePost] = useUpdatePostMutation();

    if(fetching) {
        return(
            <Layout>
                Loading...
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

    return (<Layout variant="small">
               <Formik
            initialValues={{ title: data.post.title, text: data.post.text }} 
            onSubmit={ async (values) => {
                await updatePost({id: intId, ...values});
                router.back();
            }} 
    >
      {({isSubmitting}) => (
            <Form>
               <InputField 
               name="title"
               label="Title"
               placeholder="..."
               />
               <Box mt={6}>
               <InputField 
               name="text"
               label="Content"
               textarea
               placeholder="..."
               type="text"
               />
               {/* {passwordError ? 
                <NextLink href="/forgot-password">
                     <Link ml="auto">Reset Password?</Link>
                </NextLink>
                :
                null
                } */}
                </Box>
                <Button
                    mt={4}
                    // pass isSubmitting value from Formik to isLoading from Chakra 
                    isLoading={isSubmitting}
                    variantColor="green"
                    type="submit"
                >
                    Edit post
                </Button>
            </Form>
      )}
            </Formik>
    </Layout>)
}


export default withUrqlClient(createUrqlClient)(EditPost);