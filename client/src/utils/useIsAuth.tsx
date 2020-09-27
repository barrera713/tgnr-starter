import next from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useFindUserQuery } from "../generated/graphql";


export const useIsAuth = () => {
    const [{ data, fetching }] = useFindUserQuery();
    const router = useRouter();
    useEffect(() => {
        // redirects to login if user is NOT loggin in
        if(!fetching && !data?.findUser) {
            router.replace("/login?next=" + router.pathname);
        }
    }, [fetching, data, router])
}