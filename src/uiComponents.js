import React from 'react'

import Box from '@material-ui/core/Box'

const ThermostatWrapper = props => {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      {...props}
    />
  )
}

const ThermostatContainer = props => {
  return (
    <Box
      padding={5}
      width={['40vmax', '30vmax']}
      bgcolor="lightblue"
      borderRadius={5}
      {...props}
    />
  )
}

const ThermostatDisplay = props => {
  return (
    <Box padding={1} mb={1} bgcolor="#f5f5dc" borderRadius={5} {...props} />
  )
}

const ThermostatButtonContainer = props => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      padding={1}
      bgcolor="lightgray"
      borderRadius={5}
      {...props}
    />
  )
}

export {
  ThermostatWrapper,
  ThermostatContainer,
  ThermostatDisplay,
  ThermostatButtonContainer
}
