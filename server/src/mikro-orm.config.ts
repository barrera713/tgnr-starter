import { Post } from "./entities/Post";
import { __prod__ } from "./entities/constants";
import { MikroORM } from '@mikro-orm/core';
import path from 'path';
import { User } from "./entities/User";


export default {
    migrations: {
        path: path.join(__dirname, './migrations'), // path to the folder with migrations
        pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files - added j for javascript
    },
    entities: [Post, User],
    dbName: 'lireddit',
    type: 'postgresql',
    debug: !__prod__ // True while not in production

    // gets parameteres of the typeof mikroORM.init function 
    // revcieves parameters in arr
    // Get first parameter
} as Parameters<typeof MikroORM.init>[0]; 

