import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange, Exchange, stringifyVariables } from "urql";
import { LogoutMutation, FindUserQuery, FindUserDocument, LoginMutation, RegisterMutation, VoteMutationVariables, DeletePostMutation, DeletePostMutationVariables } from "../generated/graphql";
import { customUpdateQuery } from "./customUpdateQuery";
import { pipe, tap} from 'wonka';
import Router from "next/router";
import gql from 'graphql-tag'
import { isServer } from "./isServer";


// exampled copied from github by Jackfranklin
// handles errors at a global level
export const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("unauthorized")) {
        // replace() - replaces the current route in history rather than pushing a new entry
        Router.replace("/login")
      }
    })
  )
}


// simple pagination (guided by Ben Awad)
// Essentially the logic of this function is when we press load we got a partial return from the 
// cache then it fetches more data from the server and combines it
const cursorPagination = (): Resolver  => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    
    // we filtered through all the queries in cache by posts
    // fieldInfos will continue to increase as we load more data
    // results will combine a list of all paginations
    // console.log('Field Args: ', fieldArgs)
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    // console.log("key created: ", fieldKey)
    const inCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      "posts"
    ); 
    // if it's not in the cache then we have a partial return
    info.partial = !inCache;
    let hasMore = true;
    const results: string[] = [];
    // console.log("inCache? ", inCache)
    fieldInfos.forEach(fi => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      // using resolve to select nested keys
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore") 
      // look thru all of the paginated cache
      // if any of them have hasMore = false
      // we reset hasMore = _hasMore
      if(!_hasMore) {
        hasMore = _hasMore as boolean
      }     
      results.push(...data)
    })

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results
    };
  };
};



function invalidateAllPosts(cache: Cache) {
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter(info => info.fieldName === "posts");
  fieldInfos.forEach((fi) => {
    // invalidates cache and the specific query for posts
    // must passed the arugments for that specific query
    cache.invalidate("Query", "posts", fi.arguments || {}); 
  })
};




export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = "";
  if(isServer()) {
    // console.log(ctx.req.headers.cookie);
    cookie = ctx?.req?.headers?.cookie;
  }

  return {
    url: 'http://localhost:5000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
      headers: cookie ? { cookie } : undefined
    },
    exchanges: [dedupExchange, cacheExchange({
      keys: {
        PaginatedPosts: () => null
      },
      resolvers: {
        Query: {
          // key name must match posts.graphql
          posts: cursorPagination(),
        }
      },
      updates: {
        Mutation: {
          createPost: (_result, args, cache, info) => {
            invalidateAllPosts(cache); 
          }, 
          deletePost: (_result, args, cache, info) => {
            cache.invalidate({ __typename: 'Post', 
            id: (args as DeletePostMutationVariables).id
          })
        },
          vote:(_result, args, cache, info) => {
            const { postId, value } = args as VoteMutationVariables;
            const data = cache.readFragment(
              gql`
              fragment _ on Post {
                id
                points
                voteStatus
              }
            `,
            { id: postId } as any
            );

            if(data) {
              // if the voteStatus === 1
              // and the user is trying to upvote it with 1
              // we do not do anything
              if(data.voteStatus === value) {
                return;
              }
              // if the user has not voted before the value === 1
              // if the user is switching their vote the value === 2
              const newPoints = (data.points as number) + ((!data.voteStatus ? 1 : 2) * value);
              cache.writeFragment(
                gql`
                  fragment __ on Post {
                    points
                    voteStatus
                  }
                `,
                { id: postId, points: newPoints, voteStatus: value } as any
              );
            }
          },
          logout: (_result, args, cache, info) => {
            customUpdateQuery<LogoutMutation, FindUserQuery>(
              cache, 
              { query: FindUserDocument},
              _result,
              () => ({findUser: null})
            );
          }, 
          // the name must match our mutation
          login: (_result, args, cache, info) => {
             customUpdateQuery<LoginMutation, FindUserQuery>(
              cache, 
              { query: FindUserDocument },
              _result,
              (result, query) => {
                if(result.login.errors) {
                  // returns current query 
                  return query;
                } else {
                  return {
                    findUser: result.login.user
                  };
                }
              }
            );
            invalidateAllPosts(cache)
          },
          
          register: (_result, args, cache, info) => {
            customUpdateQuery<RegisterMutation, FindUserQuery>(
             cache, 
             { query: FindUserDocument },
             _result,
             (result, query) => {
               if(result.register.errors) {
                 return query;
               } else {
                 return {
                   findUser: result.register.user
                 };
               }
             }
           )
         },
        }
      }
    }), 
    errorExchange,
    ssrExchange,
    fetchExchange],
}}; 