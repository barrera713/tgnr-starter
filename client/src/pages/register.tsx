import React from 'react';
import { Formik, Form, Field} from 'formik'
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/core'
import { Wrapper } from '../components/wrapper'
import { InputField } from '../components/InputField';


interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
    return (
        <Wrapper variant="small">
            <Formik
            initialValues={{ username: "", password: "" }}
            onSubmit={(values) => console.log({values})}
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