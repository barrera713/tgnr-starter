import { isAuth } from "../middleware/isAuth";
import { MyContext } from "src/types";
import { Resolver, Query, Arg, Mutation, InputType, Field, Ctx, UseMiddleware, Int, FieldResolver, Root } from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from '../entities/Post';



@InputType()
class PostInput {
    @Field()
    title: string
    @Field()
    text: string
}




@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        // Called everytime there is Post object
        // Not part of out table
        // Slices the text before sending it to the client
        return root.text.slice(0, 50);
    }

    @Query(() => [Post]) // explicit type for Graphql
    async posts(
        @Arg('limit', () => Int) limit: number,
        // first time fetched cursor will not exist
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null
    ): Promise <Post []> { // explicit type for Typescript Post return - Array of posts
        const trueLimit = Math.min(50, limit); // cap at 50
        // Conditional query if "cursor" exists
        const queryBuilder = getConnection()
        .getRepository(Post)
        .createQueryBuilder("p")
        .orderBy('"createdAt"', 'DESC') // double quatations in order for postgreSQL to keep the 'A' uppercase
        .take(trueLimit) // according to docs - "take" is recommended for more complex queries instead of "limit"

        if(cursor) {
            // *cursor* gives us the position
            // then we decide how many we want after that position
            queryBuilder.where('"createdAt" < :cursor', // queries the next post
            // turn cursor into date before passing it to SQL
            // but first cursor must be parsed into an Int
            { cursor: new Date(parseInt(cursor)) }) 
        }; 

        return queryBuilder.getMany(); // .getMany() is what actually executes the SQL
    }

    
    @Query(() => Post, { nullable: true }) // explicit type for Graphql
    post(
    // explicit type outside args for typescript
    // 'id' controls our identifier in our graphql playground
    @Arg('id') id: number): Promise <Post | undefined> { // explicit type for Typescript Post or Null
        return Post.findOne(id)
    }

    @Mutation(() => Post) 
    @UseMiddleware(isAuth)
    async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
    ): Promise <Post> { 
        return Post.create({
            ...input,
            creatorId: req.session.userId
        }).save();
    }


    @Mutation(() => Post, { nullable: true }) 
    async updatePost(
        @Arg("id") id: number,
        @Arg("title", () => String, { nullable: true }) title: string
        ): Promise <Post | null> { 
        const post = await Post.findOne(id);
        if(!post) {
            return null;
        };

        if(typeof title != 'undefined') {
            await Post.update({id}, {title})
        }

        return post;  
    }  


    @Mutation(() => Boolean  ) 
    async deletePost( @Arg("id") id: number ): Promise <boolean> { 
        try {
            await Post.delete(id);
        } catch (err) {
            // Send error to client here
            console.log(err)
        } 
        return true;
        
    }
   
} 