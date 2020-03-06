import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'

import { useAppState, useAppDispatch } from './context'
import {
  updateTemperature,
  register,
  changeStateOfThermostat,
  updateDesiredTemperature,
  runInAuto
} from './actions'
import { getCurrentTemperature, inAutoMode, getStatus } from './utils'
import { useInterval } from './hooks'
import { INTERVAL, THERMOSTAT_STATE } from './constants'

import {
  ThermostatWrapper,
  ThermostatContainer,
  ThermostatDisplay,
  ThermostatButtonContainer
} from './uiComponents'

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      marginBottom: theme.spacing(0.5)
    }
  },
  heatBtn: {
    backgroundColor: 'lightcoral'
  },
  coolBtn: {
    backgroundColor: 'lightcyan'
  },
  autoBtn: {
    backgroundColor: 'lightgreen'
  },
  updownBtn: {
    borderColor: 'black',
    backgroundColor: 'lightsalmon'
  }
}))

function Thermostat() {
  const {
    outHistory,
    inHistory,
    uuid,
    thermostatState,
    desired
  } = useAppState()
  const { outdoor, indoor } = getCurrentTemperature({ outHistory, inHistory })
  const [desiredTemperature, setDesiredTemperature] = useState(desired)

  const dispatch = useAppDispatch()

  const classes = useStyles()

  function setHandleDesired(updown) {
    return function() {
      updown === 'up'
        ? setDesiredTemperature(desiredTemperature + 1)
        : setDesiredTemperature(desiredTemperature - 1)
    }
  }

  function updateTemperatureCallback() {
    updateTemperature(dispatch, {
      uuid,
      thermostatState,
      desiredTemperature
    })
  }

  useEffect(() => {
    updateTemperatureCallback()
  }, []) // eslint-disable-line

  useEffect(() => {
    updateDesiredTemperature(dispatch, {
      uuid,
      indoor,
      outdoor,
      thermostatState,
      desiredTemperature
    })
  }, [desiredTemperature]) // eslint-disable-line

  useInterval(() => {
    updateTemperatureCallback()
  }, INTERVAL)

  function handleRegister() {
    register(dispatch)
  }

  function handleTurnOff() {
    changeStateOfThermostat(dispatch, { uuid, state: THERMOSTAT_STATE.OFF })
  }

  function handleTurnOnHeating() {
    changeStateOfThermostat(dispatch, { uuid, state: THERMOSTAT_STATE.HEAT })
  }

  function handleTurnOnCooling() {
    changeStateOfThermostat(dispatch, { uuid, state: THERMOSTAT_STATE.COOL })
  }

  function handleTurnOnAuto() {
    runInAuto(dispatch, {
      uuid,
      outdoor,
      indoor,
      desiredTemperature
    })
  }

  return (
    <ThermostatWrapper>
      <ThermostatContainer>
        <ThermostatDisplay>
          <div>
            <strong>ROOM:</strong> {indoor} &#8451;
          </div>
          <div>
            <strong>OUTDOOR:</strong> {outdoor} &#8451;
          </div>
          <div>
            <strong>STATUS:</strong> {getStatus(thermostatState)}
          </div>
          <div>
            <strong>SET TO:</strong> {desiredTemperature}{' '}
            <button
              className={classes.updownBtn}
              onClick={setHandleDesired('up')}
            >
              &#9650;
            </button>
            <button
              className={classes.updownBtn}
              onClick={setHandleDesired('dowon')}
            >
              &#9660;
            </button>
          </div>
        </ThermostatDisplay>
        <ThermostatButtonContainer className={classes.root}>
          <Button variant="outlined" onClick={handleRegister} disabled={!!uuid}>
            Register
          </Button>
          <Button
            onClick={handleTurnOff}
            disabled={uuid === null || thermostatState === THERMOSTAT_STATE.OFF}
          >
            Off
          </Button>
          <Button
            className={classes.heatBtn}
            variant="outlined"
            onClick={handleTurnOnHeating}
            disabled={
              uuid === null || thermostatState === THERMOSTAT_STATE.HEAT
            }
          >
            Heating
          </Button>
          <Button
            className={classes.coolBtn}
            variant="outlined"
            onClick={handleTurnOnCooling}
            disabled={
              uuid === null ||
              thermostatState === THERMOSTAT_STATE.COOL ||
              outdoor < 0
            }
          >
            Cooling
          </Button>
          <Button
            className={classes.autoBtn}
            variant="outlined"
            onClick={handleTurnOnAuto}
            disabled={uuid === null || inAutoMode(thermostatState)}
          >
            Auto
          </Button>
        </ThermostatButtonContainer>
      </ThermostatContainer>
    </ThermostatWrapper>
  )
}

export default Thermostat
