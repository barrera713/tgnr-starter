import React from 'react';
import { Formik, Form, Field} from 'formik'
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/core'
import { Wrapper } from '../components/wrapper'
import { InputField } from '../components/InputField';
import { useMutation } from 'urql';


interface registerProps {}

const REGISTER_MUT = `
mutation Register($username: String!, $password: String!) {
    register(options: {username: $username, password: $password}) {
      errors {
        field
        message
      }
      user {
        username
      }
    }
  }
`

const Register: React.FC<registerProps> = ({}) => {
    const [, register] = useMutation(REGISTER_MUT)
    return (
        <Wrapper variant="small">
            <Formik
            initialValues={{ username: "", password: "" }} 
            // able to pass in as values since intitialValues are match our mutation variables
            // otherwise they must be passed in in an object i.e {username: values.username }
            onSubmit={(values) => {
                return register(values)
                }
            } 
    >
      {({isSubmitting}) => (
            <Form>
               <InputField 
               name="username"
               label="username"
               placeholder="Username"
               type="text"
               />
               <Box mt={4}>
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
export default Register;