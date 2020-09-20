import { MyContext } from "src/types";
import { Resolver, Ctx, Arg, Mutation, InputType, Field, ObjectType, Query } from "type-graphql";
import { User } from '../entities/User';
const argon2 = require('argon2');

// generally do not have to explicitly set graphql type
// graphql can infer it from typescript

// Used for Args
@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
};

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


    @Query(() => User, { nullable: false })
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
        if(options.username.length <= 2) {
            return {
                errors: [{
                    field: "username",
                    message: "Username must be greater than 2 characters"
                }]
            }
        }

        if(options.password.length <= 2) {
            return {
                errors: [{
                    field: "password",
                    message: "Password must be greater than 2 characters"
                }]
            }
        }

        try {
            const hashedPW = await argon2.hash(options.password);
            const user = await em.create(User, { username: options.username, password: hashedPW })
            await em.persistAndFlush(user);
            req.session.userId = user.id;
            return { user } // User must be return as object
        } catch (err) {
            if(err.code === '23505') {
                return {
                    errors: [{
                        field: "Register Failed",
                        message: "Username has already been taken"
                    }]
                };
            } else {
                console.log('[ERROR]', err)
                return {
                    errors: [{
                        field: "Server error",
                        message: "Check server for error"
                    }]
                }; 
            }
        }
    }
        

    @Mutation(() => UserResponse) 
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext):  Promise <UserResponse> {
        const user = await em.findOne(User, { username: options.username })
        if(!user) {
            return {
                errors: [{
                    field: 'login',
                    message: "Username or password does not match."
                }]
            }
        }
        const valid = await argon2.verify(user.password, options.password);
        if(!valid) {
            // server side error
            return {
                errors: [{
                    field: 'login',
                    message: "Username or password does not match."
                }]
            }
        } 

        req.session.userId = user.id;
        return { user }
        
        
    }
    
} 