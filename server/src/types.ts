 import { Request, Response } from "express";
import { Redis } from 'ioredis';
import { createUpdootLoader } from "./utils/createUpdootLoader";
import { createUserLoader } from "./utils/createUserLoader";

export type MyContext = {
    // & sign joins two types together
    req: Request & { session: Express.Session }; // solution to stop from having to add ! everytime for session
    redis: Redis;
    res: Response;
    userLoader: ReturnType<typeof createUserLoader>; 
    updootLoader: ReturnType<typeof createUpdootLoader>; 

};