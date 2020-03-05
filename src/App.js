import React  from 'react'

import { AppProvider } from './context'
import Thermostat from './Thermostat'

function App() {
  return (
    <AppProvider>
      <Thermostat />
    </AppProvider>
  )
}

export default App
