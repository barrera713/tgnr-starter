import React from 'react';
import { Formik, Form, Field} from 'formik'
import { Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/core'
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
      {({values, handleChange}) => (
            <Form>
               <InputField 
               name="username"
               label="username"
               placeholder="Username"
               />
                <Button
                    mt={4}
                    variantColor="teal"
                    type="submit"
                >
                    Submit
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