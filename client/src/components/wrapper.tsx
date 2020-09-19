import { Box } from '@chakra-ui/core';


interface WrapperProps{
    // Using React props to render size of form
    variant?: "small" | "regular"
}

export const Wrapper: React.FC<WrapperProps> = ({
    children,
    // setting default variant to "regular" 
    variant = "regular"
}) => {
  
    return(
        <Box 
        mt={8}
        mx="auto"
        maxW={variant === "regular" ? "800px" : "400px"}
        w="100%"
        >
        {children}
        </Box>
    )
}