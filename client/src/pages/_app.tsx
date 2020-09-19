import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core'
import React from 'react'
import { createClient, Provider } from 'urql';
const client = createClient({ 
  url: 'http://localhost:5000/graphql',
  fetchOptions: {
    credentials: 'include'
  }
});


import theme from '../theme'

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
