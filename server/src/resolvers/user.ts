import { MyContext } from "src/types";
import { Resolver, Ctx, Arg, Mutation, Field, ObjectType, Query } from "type-graphql";
import { User } from '../entities/User';
const argon2 = require('argon2');
import { EntityManager } from '@mikro-orm/postgresql'; 
import { COOKIE_NAME, FORGOT_PASSWORD } from "../entities/constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { v4 } from 'uuid';
import { sendEmail } from "../utils/sendEmail";

;

// Can be returned from mutations
@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    // If successful will return user
    // else return errors
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, {nullable: true})
    user?: User
}


@Resolver()
export class UserResolver {
    @Mutation(() => Boolean)
    async forgotPassword(@Arg('email') email: string, @Ctx() {em, redis }: MyContext ) {
        const user = await em.findOne(User, { email: email })
        if(!user) {
            // return true for security reasons
            // prevents attacker from continuing to fish for existing emails
            return true;
        }

        // create token
        // store in redis
        // when user sends token back to server, look up value to get user.id
        const token = v4();
        await redis.set(FORGOT_PASSWORD + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3 ) // 3 days (arbitrary)
        await sendEmail(email,
            `<a href="http://localhost:3000/change-password${token}/ "> reset password</a>`
        );
        return true;
    }

    @Query(() => User, { nullable: true })
    async findUser(@Ctx() { em, req }: MyContext)  {
        if(!req.session.userId) {
            // Not logged in
            return null;
        } else {
            const user = await em.findOne(User, { id: req.session.userId });
            return user;
        }
    }

    @Mutation(() => UserResponse ) 
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext ): Promise <UserResponse> {
        // Section for sanitizing data and handling errors
        const errors = validateRegister(options);
        if(errors) {
            return { errors }
        }

        let user;
        try {
            const hashedPW = await argon2.hash(options.password);
            // c 
            // Manually adding this because I am using Knex and NOT Mikro
            const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
                username: options.username,
                email: options.email,
                password: hashedPW,
                updated_at: new Date(),
                created_at: new Date(),
                 
            })
            .returning('*') // returns all fields
            user = result[0]; 
            req.session.userId = user.id;
            return { user } // User must be return as object
        } catch (err) {
            if(err.code === '23505') {
                return {
                    errors: [{
                        field: "username",
                        message: "Username has already been taken"
                    }]
                };
            } else {
                console.log('[ERROR]', err)
                return {
                    errors: [{
                        field: "username",
                        message: "Server error, please refresh and try again."
                    }]
                }; 
            }
        }
    }
        

    @Mutation(() => UserResponse) 
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { em, req }: MyContext):  Promise <UserResponse> {
        const user = await em.findOne(User, usernameOrEmail.includes('@') 
        ? { email: usernameOrEmail }
        : {username: usernameOrEmail }
        );
        if(!user) {
            return {
                errors: [{
                    field: 'usernameOrEmail',
                    message: "Username or password does not match."
                }]
            }
        }
        const valid = await argon2.verify(user.password, password);
        if(!valid) {
            // server side error
            return {
                errors: [{
                    field: 'usernameOrEmail',
                    message: "Username or password does not match."
                }]
            }
        } 

        req.session.userId = user.id;
        return { user }
        
        
    }



    @Mutation(() => Boolean)
        logout( @Ctx() { req, res }: MyContext) {
            return new Promise((resolve) => 
            // destroys session from Redis store
            req.session.destroy( (err: any) => {
                // clears cookie in server memory
                // regardless if it was able to destroy session from Redis
                res.clearCookie(COOKIE_NAME)
                if (err) {
                    console.log('[SESSION DESTROY ERROR:', err)
                    resolve(false);
                    return;
                };

            resolve(true);
        }))
    }
    
} 