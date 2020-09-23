// if it is undefined this means we are in the server
// if it is NOT this means isServer is false
export const isServer = () => typeof window === "undefined";