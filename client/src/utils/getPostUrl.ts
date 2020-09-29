import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";
import { useGetPostId } from "./useGetPostId";

export const GetPostUrl = () => {
    const intId = useGetPostId();
    return usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId 
        }
    }) 
}