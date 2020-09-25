import { withUrqlClient } from 'next-urql';
import React from 'react';
import { createUrqlClient } from '../utils/createUrqlClient';


const ForgotPassword: React.FC <{}> = ({}) => {
    return(
        <div>Forgot Password Page</div>
    )
}

export default withUrqlClient(createUrqlClient)(ForgotPassword); 