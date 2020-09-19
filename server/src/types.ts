import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from "express";

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
    // & sign joins two types together
    req: Request & { session: Express.Session }; // solution to stop from having to add ! everytime for session
    res: Response;
};