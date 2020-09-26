import { cacheExchange } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange, Exchange } from "urql";
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



export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:5000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
    },
    exchanges: [dedupExchange, cacheExchange({
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