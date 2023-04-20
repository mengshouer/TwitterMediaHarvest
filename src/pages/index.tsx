import { ChakraProvider } from '@chakra-ui/react'
import React from 'react'
import * as ReactDOMClient from 'react-dom/client'
import Options from './app/Options'
import Popup from './app/Popup'
import theme from './themes'

// Create a root.
const root = ReactDOMClient.createRoot(document.getElementById('root'))

// Initial render: Render an element to the root.
const params = new URLSearchParams(window.location.search)
const body = document.getElementsByTagName('body')[0]

switch (params.get('tab')) {
  case 'popup':
    root.render(
      <ChakraProvider theme={theme}>
        <Popup />
      </ChakraProvider>
    )
    break
  default:
    body.removeAttribute('style')
    root.render(
      <ChakraProvider theme={theme}>
        <Options />
      </ChakraProvider>
    )
    break
}

// During an update, there's no need to pass the container again.
// root.render(<App tab="profile" />)