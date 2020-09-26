import { MyContext } from 'src/types';
import { MiddlewareFn } from 'type-graphql';

// Middlewares in Graphql run before the resolvers
// Pass in MyContext so recognizes the Type

export const isAuth: MiddlewareFn<MyContext> = ({context}, next) => {
    if(!context.req.session.userId) {
        throw new Error("unauthorized")
    }

    // Just like controllers, next allows us to move to the next middleware
    return next();
}