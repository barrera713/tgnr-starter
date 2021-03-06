import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { Resolver, Query, Arg, Mutation, InputType, Field, Ctx, UseMiddleware, Int, FieldResolver, Root, ObjectType } from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from '../entities/Post';
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";



@InputType()
class PostInput {
    @Field()
    title: string
    @Field()
    text: string
}


@ObjectType()
class PaginatedPosts {
    @Field(() => [Post]) 
    posts: Post[] 
    @Field(() => Boolean)
    hasMore: boolean;
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

    @FieldResolver(() => User)
    creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
        return userLoader.load(post.creatorId); // pass the creatorId so that dataloader can create one query to retrieve all users
    };


    @FieldResolver(() => Int, {nullable: true})
        async voteStatus(@Root() post: Post, @Ctx() { updootLoader, req }: MyContext) {
        // if user is not logged in they cannot upvote
        if(!req.session.userId) {
            return null;
        }
        const updoot = await updootLoader.load({postId: post.id, userId: req.session.userId })
        
        return updoot ? updoot.value : null;
    };


    @Query(() => PaginatedPosts) // explicit type for Graphql
    async posts(
        @Arg('limit', () => Int) limit: number,
        // first time fetched cursor will not exist
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
        @Ctx() {}: MyContext
    ): Promise <PaginatedPosts> { // explicit type for Typescript Post return - Array of posts
        const trueLimit = Math.min(50, limit);
        const trueLimitPlusOne = Math.min(50, limit) + 1; // cap at 50

        const replacements: any[] = [trueLimitPlusOne];

        // *cursor* gives us the position
        // then we decide how many we want after that position
        // turn cursor into date before passing it to SQL
        // cursor must be parsed into an Int before initializing new date
        if(cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }
 
        // $1 first replacement
        // $2 second replacement
        // Must specify PUBLIC in PostgreSQL
        // creator matches the graphql type

        // conditionally pass userId since it may be null
        const posts = await getConnection().query(`
        select p.*
        from post p
        ${cursor ? `where p."createdAt" < $2` : ''}
        order by p."createdAt" DESC
        limit $1
        `, replacements)


        // Conditional query if "cursor" exists
        // const queryBuilder = getConnection()
        // .getRepository(Post)
        // .createQueryBuilder("p")
        // .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
        // .orderBy('p."createdAt"', 'DESC') // double quatations in order for postgreSQL to keep the 'A' uppercase
        // .take(trueLimitPlusOne) // according to docs - "take" is recommended for more complex queries instead of "limit"

        // if(cursor) {
        //     queryBuilder.where('p."createdAt" < :cursor', // queries the next post
        //     { cursor: new Date(parseInt(cursor)) }) 
        // }; 

        // const posts = await queryBuilder.getMany();
        return { 
            posts: posts.slice(0, trueLimit), 
            // if true than we know there are more items to be fetched
            hasMore: posts.length === trueLimitPlusOne 
        }; // .getMany() is what actually executes the SQL
    }

    
    @Query(() => Post, { nullable: true }) // explicit type for Graphql
    post(
    // explicit type outside args for typescript
    // 'id' controls our identifier in our graphql playground
    @Arg('id', () => Int) id: number): Promise <Post | undefined> { // explicit type for Typescript Post or Null
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
    @UseMiddleware(isAuth) 
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("title") title: string,
        @Arg("text") text: string,
        @Ctx() {req}: MyContext
        ): Promise <Post | null> { 
        const result = await getConnection()
        .createQueryBuilder()
        .update(Post)
        .set({title, text})
        .where('id = :id and "creatorId" = :creatorId', {
            id,
            creatorId: req.session.userId
        })
        .returning('*')
        .execute();
        return result.raw[0];
    }  


    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)  
    async deletePost( @Arg("id", () => Int) id: number, @Ctx() {req}: MyContext ): Promise <boolean> {   
        await Post.delete({id, creatorId: req.session.userId }); // safely only deletes posts that belong to users
        return true; 
    }


    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
        async vote( 
        @Arg('postId', () => Int) postId: number, 
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: MyContext) {
            const isUpdoot = value !== -1;
            const realValue = isUpdoot ? 1 : -1;
            const {userId} = req.session;

            const updoot = await Updoot.findOne({where: {postId, userId} });
            // user has voted before
            // second condition checks if they are changing it from an up vote to down vote
            if(updoot && updoot.value !== realValue) {
                await getConnection().transaction( async tm => {
                    await tm.query(`
                    update updoot
                    set value = $1
                    where "postId" = $2 and "userId" = $3
                    `, [realValue, postId, userId])

                    await tm.query(`
                    update post
                    set points = points + $1
                    where id = $2
                    `, [2 * realValue, postId]) // if user changes to vote than we actually have to increment by 2
                })
            } else if(!updoot) {
                await getConnection().transaction( async tm => {
                await tm.query(`
                insert into updoot ("userId", "postId", value)
                values ($1, $2, $3);            
                `, [userId, postId, realValue])

                await tm.query(`
                update post
                set points = points + $1
                where id = $2;
                `, [realValue, postId])
            })
        }
        
        return true;
    }
   
} 