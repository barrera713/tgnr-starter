import { Box, Button, Flex, Heading, Link } from '@chakra-ui/core';
import React from 'react';
import NextLink from "next/link";
import { useFindUserQuery, useLogoutMutation } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { useRouter } from 'next/router';



interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
    const [{fetching: logoutFetch}, logout] = useLogoutMutation()
    const [{data, fetching}] = useFindUserQuery({
        pause: isServer()
    })
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
            <Flex align="center">
                <NextLink href="/create-post">
                    <Button mr={2} as={Link}>
                    Create Post
                    </Button>
                </NextLink>
                <Box mr={2}>Hello, {data.findUser.username}</Box>
                <Button 
                variant="link"
                onClick={ async () => {
                    await logout();
                    router.reload();
                }}
                isLoading={logoutFetch}
                >
                    Logout
                </Button>
            </Flex>
        )
    }
    return (
        <Flex  
        zIndex={2}
        position="sticky"
        top={0}
        bg="tomato"
        p={4}
        >
            <Flex maxW={800} align="center" flex={1} m="auto">
                <NextLink href="/">
                    <Link>
                    <Heading>SubReddit</Heading>
                    </Link>
                </NextLink>
                <Box ml='auto'>
                {body}
                </Box>
            </Flex>
        </Flex>
    )
}
