import { Box, Button, Flex, Link } from '@chakra-ui/core';
import React from 'react';
import NextLink from "next/link";
import { useFindUserQuery } from '../generated/graphql';
import { ClassNames } from '@emotion/core';



interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {

    const [{data, fetching}] = useFindUserQuery()
    let body = null;

    // data is loading...
    if(fetching) {

    // user not logged in
    } else if (!data?.findUser) {
        body = (
        <>
        <NextLink href="/login">
            <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="register">
            <Link>Register</Link>
        </NextLink>
        </>
        )
    // user is logged in 
    } else {

        body = (
            <Flex>
                <Box mr={2}>Hello, {data.findUser.username}</Box>
                <Button variant="link">Logout</Button>
            </Flex>
        )
    }
    return (
        <Flex  
        bg="tomato"
        p={4}>
        <Box ml='auto'>
           {body}
        </Box>
        </Flex>
    )
}
