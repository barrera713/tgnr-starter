import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core'
import React from 'react'
import { createClient, Provider, fetchExchange, dedupExchange } from 'urql';
import { cacheExchange, QueryInput, Cache } from '@urql/exchange-graphcache';
import theme from '../theme'
import { FindUserDocument, FindUserQuery, LoginMutation, RegisterMutation } from '../generated/graphql';

// helper function that will cast the types
function customUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}
   


const client = createClient({  
  url: 'http://localhost:5000/graphql',
  fetchOptions: {
    credentials: 'include'
  },
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
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
  }), fetchExchange],  
});



function MyApp({ Component, pageProps }: any) {
  return (
    <Provider value={client}>
    <ThemeProvider theme={theme}>
      <ColorModeProvider>
        <CSSReset />
        <Component {...pageProps} />
      </ColorModeProvider>
    </ThemeProvider>
  </Provider>
  )
}

export default MyApp
