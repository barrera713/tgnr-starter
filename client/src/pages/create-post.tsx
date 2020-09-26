import { Box, Link, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/wrapper';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';
import register from './register';



const CreatePost: React.FC<{}> = ({}) => {
    return (
        <Wrapper variant="small">
            <Formik
            initialValues={{ title: "", text: "" }} 
            // able to pass in as values since intitialValues are match our mutation variables
            // otherwise they must be passed in in an object i.e {username: values.username }
            onSubmit={ async (values) => {
                console.log(values)
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
        </Wrapper>
    )
}


export default CreatePost; 