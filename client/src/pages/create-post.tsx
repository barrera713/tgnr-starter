import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import React, { useEffect } from 'react';
import { InputField } from '../components/InputField';
import { useCreatePostMutation, useFindUserQuery } from '../generated/graphql';
import { useRouter } from 'next/router'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { Layout } from '../components/Layout';




const CreatePost: React.FC<{}> = ({}) => {
    const [{ data, fetching }] = useFindUserQuery();
    const router = useRouter();
    const [, CreatePost] = useCreatePostMutation();

    useEffect(() => {
        // redirects to login if user is NOT loggin in
        if(!fetching && !data?.findUser) {
            router.replace('/login')
        }
    }, [fetching, data, router])

    return (
        <Layout variant="small">
            <Formik
            initialValues={{ title: "", text: "" }} 
            // able to pass in as values since intitialValues are match our mutation variables
            // otherwise they must be passed in in an object i.e {username: values.username }
            onSubmit={ async (values) => {
                const {error} = await CreatePost({ input: values })
                if(!error) {
                    // handled by global handler
                    router.push('/')
                }
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
                    Create Post
                </Button>
            </Form>
      )}
            </Formik>
        </Layout>
    )
}


export default withUrqlClient(createUrqlClient)(CreatePost); 