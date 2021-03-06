import React from 'react';
import { Formik, Form } from 'formik'
import { Box, Button, Link } from '@chakra-ui/core'
import { Wrapper } from '../components/wrapper'
import { InputField } from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from "next/link";
import { useState } from 'react';



interface registerProps {}


const Login: React.FC<registerProps> = ({}) => {
    const router = useRouter()
    const [passwordError, setPasswordError] = useState(false);
    const [, register] = useLoginMutation() // use custom hook from gen file to explicitly set grapqhl types
    return (
        <Wrapper variant="small">
            <Formik
            initialValues={{ usernameOrEmail: "", password: "" }} 
            // able to pass in as values since intitialValues are match our mutation variables
            // otherwise they must be passed in in an object i.e {username: values.username }
            onSubmit={ async (values, {setErrors}) => {
                const response = await register(values)
                // enable strict to true in tsconfig
                // allows chaining to access deeply nested properties 
                // ? returns undefined if there is no data
                if (response.data?.login.errors) {
                    // No need for ? here because typescript will infer that data 
                    // is defined from the if statement
                    setErrors(toErrorMap(response.data.login.errors));
                    setPasswordError(true)
                  } else if (response.data?.login.user) {
                      // Checks for query parameters from useIsAuth
                    if (typeof router.query.next === "string") {
                        router.push(router.query.next)
                    } else {
                        router.push("/")
                    }
                  }
            }} 
    >
      {({isSubmitting}) => (
            <Form>
               <InputField 
               name="usernameOrEmail"
               label="usernameOrEmail"
               placeholder="Username or Email"
               />
               <Box mt={6}>
               <InputField 
               name="password"
               label="password"
               placeholder="Password"
               type="password"
               />
               {passwordError ? 
                <NextLink href="/forgot-password">
                     <Link ml="auto">Reset Password?</Link>
                </NextLink>
                :
                null
                }
                </Box>
                <Button
                    mt={4}
                    // pass isSubmitting value from Formik to isLoading from Chakra 
                    isLoading={isSubmitting}
                    variantColor="green"
                    type="submit"
                >
                    Login
                </Button>
            </Form>
      )}
            </Formik>
        </Wrapper>
    );
};

// Must export default components in Next.js
// Next.js automatically sets export as a page route


// wrap with this to decide if the page needs server side rendering
export default withUrqlClient(createUrqlClient)(Login); 