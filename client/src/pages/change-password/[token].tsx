import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
// Next.js convention to name files with [] if a variable in in the url
// In this case token is the variable
import React from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import register from '../register';



const ChangePassword: NextPage<{token: string}> = ({ token }) => {
    return <Wrapper variant="small">
            <Formik
                initialValues={{ newPassword: '' }} 
                // able to pass in as values since intitialValues are match our mutation variables
                // otherwise they must be passed in in an object i.e {username: values.username }
                onSubmit={ async (values, {setErrors}) => {
                    // const response = await register(values)
                    // if (response.data?.login.errors) { 
                    //     setErrors(toErrorMap(response.data.login.errors));
                    // } else if (response.data?.login.user) {
                    //     router.push("/");
                    // }
                }} 
            >
            {({isSubmitting}) => (
                <Form>
                <Box mt={6}>
                <InputField 
                name="newPassword"
                label="New Password"
                placeholder="New Password"
                type="password"
                />
                    </Box>
                    <Button
                        mt={4}
                        // pass isSubmitting value from Formik to isLoading from Chakra 
                        isLoading={isSubmitting}
                        variantColor="green"
                        type="submit"
                    >
                        Change Password
                    </Button>
                </Form>
            )}
            </Formik>
    </Wrapper>
};

// special function from next.js
// gives access to query parameters
// to pass to the component
ChangePassword.getInitialProps = ({query}) => {
    return {
        token: query.token as string
    };
};

export default ChangePassword;