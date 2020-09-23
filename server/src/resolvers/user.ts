import { MyContext } from "src/types";
import { Resolver, Ctx, Arg, Mutation, InputType, Field, ObjectType, Query } from "type-graphql";
import { User } from '../entities/User';
const argon2 = require('argon2');
import { EntityManager } from '@mikro-orm/postgresql'; 

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

        let user;
        try {
            const hashedPW = await argon2.hash(options.password);
            // c 
            // Manually adding this because I am using Knex and NOT Mikro
            const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
                username: options.username,
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
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext):  Promise <UserResponse> {
        const user = await em.findOne(User, { username: options.username })
        if(!user) {
            return {
                errors: [{
                    field: 'username',
                    message: "Username or password does not match."
                }]
            }
        }
        const valid = await argon2.verify(user.password, options.password);
        if(!valid) {
            // server side error
            return {
                errors: [{
                    field: 'username',
                    message: "Username or password does not match."
                }]
            }
        } 

        req.session.userId = user.id;
        return { user }
        
        
    }
    
} 