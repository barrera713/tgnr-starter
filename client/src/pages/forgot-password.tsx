import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/wrapper';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useRequestResetPasswordMutation } from '../generated/graphql';



const ForgotPassword: React.FC <{}> = ({}) => {
    
    const [complete, setComplete] = useState(false);
    const [, RequestResetPassword] = useRequestResetPasswordMutation();

    return(
        <Wrapper variant="small">
            <Formik
            initialValues={{ email: "" }} 

            onSubmit={ async (values) => {
                await RequestResetPassword(values)
                setComplete(true)
            }} 
    >
      {({isSubmitting}) => complete ? <Box>A link has been sent to your email.</Box> : (
            <Form>
               <InputField 
               name="email"
               label="email"
               placeholder="Email"
               type="type"
               />
                <Button
                    mt={4}
                    // pass isSubmitting value from Formik to isLoading from Chakra 
                    isLoading={isSubmitting}
                    variantColor="green"
                    type="submit"
                >
                    Reset Password
                </Button>
            </Form>
      )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(ForgotPassword); 