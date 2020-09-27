import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange, Exchange, stringifyVariables } from "urql";
import { LogoutMutation, FindUserQuery, FindUserDocument, LoginMutation, RegisterMutation } from "../generated/graphql";
import { customUpdateQuery } from "./customUpdateQuery";
import { pipe, tap} from 'wonka';
import Router from "next/router";


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
    console.log('ALL FIELDS: ', allFields)
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    
    const results: string[] = [];
    // we filtered through all the queries in cache by posts
    // fieldInfos will continue to increase as we load more data
    // results will combine a list of all paginations
    // console.log('Field Args: ', fieldArgs)
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    // console.log("key created: ", fieldKey)
    const inCache = cache.resolveFieldByKey(entityKey, fieldKey); 
    // if it's not in the cache then we have a partial return
    info.partial = !inCache;
    // console.log("inCache? ", inCache)
    fieldInfos.forEach(fi => {
      const data = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string[];
      results.push(...data)
    })

    return results;


  //   const visited = new Set();
  //   let result: NullArray<string> = [];
  //   let prevOffset: number | null = null;

  //   for (let i = 0; i < size; i++) {
  //     const { fieldKey, arguments: args } = fieldInfos[i];
  //     if (args === null || !compareArgs(fieldArgs, args)) {
  //       continue;
  //     }

  //     const links = cache.resolveFieldByKey(entityKey, fieldKey) as string[];
  //     const currentOffset = args[offsetArgument];

  //     if (
  //       links === null ||
  //       links.length === 0 ||
  //       typeof currentOffset !== 'number'
  //     ) {
  //       continue;
  //     }

  //     if (!prevOffset || currentOffset > prevOffset) {
  //       for (let j = 0; j < links.length; j++) {
  //         const link = links[j];
  //         if (visited.has(link)) continue;
  //         result.push(link);
  //         visited.add(link);
  //       }
  //     } else {
  //       const tempResult: NullArray<string> = [];
  //       for (let j = 0; j < links.length; j++) {
  //         const link = links[j];
  //         if (visited.has(link)) continue;
  //         tempResult.push(link);
  //         visited.add(link);
  //       }
  //       result = [...tempResult, ...result];
  //     }

  //     prevOffset = currentOffset;
  //   }

  //   const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
  //   if (hasCurrentPage) {
  //     return result;
  //   } else if (!(info as any).store.schema) {
  //     return undefined;
  //   } else {
  //     info.partial = true;
  //     return result;
  //   }
  };
};





export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:5000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
    },
    exchanges: [dedupExchange, cacheExchange({
      resolvers: {
        Query: {
          // key name must match posts.graphql
          posts: cursorPagination(),
        }
      },
      updates: {
        Mutation: {
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
            )
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
}); 