import { Box } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { Layout } from '../../../components/Layout';
import { createUrqlClient } from '../../../utils/createUrqlClient';



const EditPost = ({}) => {
    return (<Layout>
        <Box>Hello</Box>
    </Layout>)
}


export default withUrqlClient(createUrqlClient)(EditPost);