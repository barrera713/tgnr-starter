import { Alert, AlertIcon, Box, Button, Link } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/dist/client/router';
import React, { useState } from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import NextLink from "next/link";
// Next.js convention to name files with [] if a variable in in the url
// In this case token is the variable



const ChangePassword: NextPage<{token: string}> = () => {

    const router = useRouter()
    const [tokenError, setTokenError] = useState("");
    const [, changePassword] = useChangePasswordMutation()


    return <Wrapper variant="small">
            <Formik
                initialValues={{ newPassword: '' }} 
                // able to pass in as values since intitialValues are match our mutation variables
                // otherwise they must be passed in in an object i.e {username: values.username }
                onSubmit={ async (values, {setErrors}) => {
                    const response = await changePassword({ 
                        newPassword: values.newPassword,
                        token: typeof router.query.token === "string" ? router.query.token : ""
                    });

                    
                    if (response.data?.changePassword.errors) { 
                        const errorMap = toErrorMap(response.data.changePassword.errors);
                        // since token is not in our initial field
                        // create state for token error
                        // if token error exists, then set token error from server in state
                        if('token' in errorMap) {
                            setTokenError(errorMap.token)
                        } 
                        setErrors(errorMap)
                    } else if (response.data?.changePassword.user) {
                        router.push("/");
                    }
                }} 
            >
            {({isSubmitting}) => (
                <Form>
                    { tokenError ? 
                    <Alert status="warning">
                        <AlertIcon />
                        {tokenError}
                    </Alert>
                    : 
                    null
                    }
                <Box mt={6}>
                <InputField 
                name="newPassword"
                label="New Password"
                placeholder="New Password"
                type="password"
                />
                </Box>
                    {tokenError 
                    ? 
                    <NextLink href="/forgot-password">
                     <Link>Resend Link</Link>
                    </NextLink>
                    : 
                <Button
                    mt={4}
                    // pass isSubmitting value from Formik to isLoading from Chakra 
                    isLoading={isSubmitting}
                    variantColor="green"
                    type="submit"
                    >
                    Change Password
                </Button>
                    }
                </Form>
            )}
            </Formik>
    </Wrapper>
};

export default withUrqlClient(createUrqlClient)(ChangePassword);