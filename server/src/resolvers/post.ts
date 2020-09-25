import { Resolver, Query, Arg, Mutation } from "type-graphql";
import { Post } from '../entities/Post';

@Resolver()
export class PostResolver {
    @Query(() => [Post]) // explicit type for Graphql
    posts(): Promise <Post []> { // explicit type for Typescript Post return - Array of posts
        return Post.find()
    }

    
    @Query(() => Post, { nullable: true }) // explicit type for Graphql
    post(
    // explicit type outside args for typescript
    // 'id' controls our identifier in our graphql playground
    @Arg('id') id: number): Promise <Post | undefined> { // explicit type for Typescript Post or Null
        return Post.findOne(id)
    }

    @Mutation(() => Post) 
    async createPost(
    @Arg('title') title: string): Promise <Post> { 
        // 2 sql queries
        return Post.create({ title}).save();
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