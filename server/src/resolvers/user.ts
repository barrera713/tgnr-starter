import { MyContext } from "src/types";
import { Resolver, Ctx, Arg, Mutation, Field, ObjectType, Query, FieldResolver, Root } from "type-graphql";
import { User } from '../entities/User';
const argon2 = require('argon2');
import { COOKIE_NAME, FORGOT_PASSWORD } from "../entities/constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { v4 } from 'uuid';
import { sendEmail } from "../utils/sendEmail";
import { getConnection } from "typeorm";

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
    @Field(() => [FieldError], { nullable: true }) // Graphql Type
    errors?: FieldError[]; // TypeScript Type

    @Field(() => User, {nullable: true})
    user?: User
}


@Resolver(User)
export class UserResolver {
    // Only shows the email of the current user logged in
    // i.e hides other users email
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() {req}: MyContext ) {
        if(req.session.userId === user.id) {
            return user.email;
        };

        return "";
    }

    @Mutation(() => UserResponse)
    async changePassword( 
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() {req, redis}: MyContext
    ): Promise<UserResponse> { 
        const key = FORGOT_PASSWORD+token;
        const userId = await redis.get(key);
        if(!userId) {
        
            return {
                errors: [
                    {
                        field: "token", 
                        message: "Invalid or expired token"
                    }
                ]
            }
        }

        // parsed the ID here
        // redis may be storing everything as a string
        const userIdNum = parseInt(userId);
        const user = await User.findOne(userIdNum)
        // Rare case, but just to be safe in case the user is no found
        if(!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "User no longer exists"
                    }
                ]
            }
        } 

        if(newPassword.length <= 2) {
            return { errors: [
                {
                    field: "newPassword", 
                    message: "Password must be greater than 2 characters"
                }
            ]};
        }

        User.update({ id: userIdNum }, { password: await argon2.hash(newPassword)})
        // delete token after password reset
        await redis.del(key);
        // login the user after password reset
        req.session.userId = user.id;
        return { user };

    }

    @Mutation(() => Boolean)
    async forgotPassword(@Arg('email') email: string, @Ctx() { redis }: MyContext ) {
        const user = await User.findOne({ where: { email } });
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
            `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
        );
        return true;
    }

    @Query(() => User, { nullable: true })
    findUser(@Ctx() { req }: MyContext)  {
        if(!req.session.userId) {
            // Not logged in
            return null;
        } else {
            return User.findOne(req.session.userId);
        }
    }

    @Mutation(() => UserResponse ) 
    async register(
        @Arg('options') options: UsernamePasswordInput, // Graphql Type
        @Ctx() {req}: MyContext ): Promise <UserResponse> { // TypeScript type
        // Section for sanitizing data and handling errors
        const errors = validateRegister(options);
        if(errors) {
            return { errors }
        }

        let user;
        try {
            const hashedPW = await argon2.hash(options.password);
            const result = await getConnection()
            // User.create({}).save()
            // alternative to creating an entity
            // view post.ts Line 24 
            .createQueryBuilder()
            .insert()
            .into(User)
            .values({
                username: options.username,
                email: options.email,
                password: hashedPW
            })
            .returning('*') // * returns all fields
            .execute()
            user = result.raw[0] // User ID
            req.session.userId
            return { user };
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
        @Ctx() { req }: MyContext): Promise <UserResponse> {
        const user = await User.findOne(usernameOrEmail.includes('@') 
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail }}
        );
        if(!user) {
            return {
                errors: [{
                    field: 'usernameOrEmail', // this must match the name of the form input
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