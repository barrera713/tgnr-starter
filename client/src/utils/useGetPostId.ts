import { useRouter } from "next/dist/client/router";

export const useGetPostId = () => {
     // pauses query if ID is not valid
    const router = useRouter();
    const intId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
    return intId;
}   