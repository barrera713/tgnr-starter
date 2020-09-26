import React, { InputHTMLAttributes } from 'react'
import { useField } from 'formik';
import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/core';
import { __ApiPreviewProps } from 'next/dist/next-server/server/api-utils';
 

// specifying type for InputField 
// essentially allows InputField to take any props
// that a regular input field would take  
type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string,
    name: string,
    textarea?: boolean
};

export const InputField: React.FC<InputFieldProps> = ({
    label, 
    textarea,
    size: _, // Removes size from props and assign it to _ (unused variables)
    ...props
    }
    ) => {

    let InputOrTextArea = Input;
    if(textarea) {
        InputOrTextArea = Textarea
    }
    // setting field here allows us to pass 
    // all the other functions to our Input
    const [field, {error}] = useField(props);
    return( 
        // !! => empty string will return false
        <FormControl isInvalid={!!error}> 
        <FormLabel 
        htmlFor={field.name}>
            {label}
        </FormLabel>
        <InputOrTextArea 
        {...field}
        {...props}
        id={field.name} 
        />
        {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
    )
};