import { MyContext } from "src/types";
import { Resolver, Query, Ctx, Arg, Mutation } from "type-graphql";
import { Post } from '../entities/Post';

@Resolver()
export class PostResolver {
    @Query(() => [Post]) // explicit type for Graphql
    posts(
        @Ctx() {em}: MyContext): Promise <Post []> { // explicit type for Typescript Post return - Array of posts
        return em.find(Post, {})
    }

    
    @Query(() => Post, { nullable: true }) // explicit type for Graphql
    post(
    // explicit type outside args for typescript
    // 'id' controls our identifier in our graphql playground
    @Arg('id') id: number,
    @Ctx() {em}: MyContext): Promise <Post | null> { // explicit type for Typescript Post or Null
        return em.findOne(Post, { id })
    }

    @Mutation(() => Post) 
    async createPost(
    @Arg('title') title: string,
    @Ctx() {em}: MyContext): Promise <Post> { 
        const post = em.create(Post, {title})
        await em.persistAndFlush(post)
        return post;
    }


    @Mutation(() => Post, { nullable: true }) 
    async updatePost(
        @Arg("id") id: number,
        @Arg("title", () => String, { nullable: true }) title: string,
        @Ctx() {em}: MyContext): Promise <Post | null> { 
        const post = await em.findOne(Post, {id});
        if(!post) {
            return null;
        };

        if(typeof title != 'undefined') {
            post.title = title;
        }
        return post;  
    }  


    @Mutation(() => Boolean  ) 
    async deletePost(
        @Arg("id") id: number,
        @Ctx() {em}: MyContext): Promise <boolean> { 
        try {
            await em.nativeDelete(Post, {id});
        } catch (err) {
            // Send error to client here
            console.log(err)
        } 
        return true;
        
    }
   
} 