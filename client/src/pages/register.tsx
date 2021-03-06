import React from 'react';
import { Formik, Form, Field, ErrorMessage} from 'formik'
import { Box, Button } from '@chakra-ui/core'
import { Wrapper } from '../components/wrapper'
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';


interface registerProps {}



const Register: React.FC<registerProps> = ({}) => {
    const router = useRouter()
    const [, register] = useRegisterMutation() // use custom hook from gen file to explicitly set grapqhl types
    return (
        <Wrapper variant="small">
            <Formik
            initialValues={{ email: "", username: "", password: "" }} 
            // able to pass in as values since intitialValues are match our mutation variables
            // otherwise they must be passed in in an object i.e {username: values.username }
            onSubmit={ async (values, {setErrors}) => {
                const response = await register({options: values})
                // enable strict to true in tsconfig
                // allows chaining to access deeply nested properties 
                // ? returns undefined if there is no data
                if (response.data?.register.errors) {
                    // No need for ? here because typescript will infer that data 
                    // is defined from the if statement
                    setErrors(toErrorMap(response.data.register.errors));
                  } else if (response.data?.register.user) {
                    router.push("/");
                  }
            }} 
    >
      {({isSubmitting}) => (
            <Form>
               <InputField 
               name="username"
               label="username"
               placeholder="Username"
               />
                <Box mt={6}>
               <InputField 
               name="email"
               label="email"
               placeholder="Email"
               type="email"
               />
               </Box>
               <Box mt={6}>
               <InputField 
               name="password"
               label="password"
               placeholder="Password"
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
                    Register
                </Button>
            </Form>
      )}
            </Formik>
        </Wrapper>
    );
};

// Must export default components in Next.js
// Next.js automatically sets export as a page route
export default withUrqlClient(createUrqlClient)(Register);