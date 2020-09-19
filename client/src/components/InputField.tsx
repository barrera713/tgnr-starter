import React, { InputHTMLAttributes } from 'react'
import { useField } from 'formik';
import { FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/core';
 

// specifying type for InputField 
// essentially allows InputField to take any props
// that a regular input field would take  
type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string,
    placeholder: string
    name: string,
};

export const InputField: React.FC<InputFieldProps> = (props) => {
    // setting field here allows us to pass 
    // all the other functions to our Input
    const [field, {error}] = useField(props);
    return( 
        // !! => empty string will return false
        <FormControl isInvalid={!!error}> 
        <FormLabel 
        htmlFor={field.name}>
            {props.label}
        </FormLabel>
        <Input 
        {...field}
        id={field.name} 
        placeholder={props.placeholder} 
        />
        {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
    )
};