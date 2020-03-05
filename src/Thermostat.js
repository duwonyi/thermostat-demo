import React, { useEffect, useState } from 'react'

import {
  useAppState,
  useAppDispatch,
  updateTemperature,
  register,
  changeStateOfThermostat,
  updateDesiredTemperature,
  runInAuto
} from './context'
import { getCurrentTemperature, inAutoMode } from './utils'
import { useInterval } from './hooks'
import { INTERVAL, THERMOSTAT_STATE } from './constants'

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

  // let [count, setCount] = useState(300)
  // useEffect(() => {
  //   if (count === 0) {
  //     setCount(300)
  //   }
  // }, [count])

  // useInterval(() => {
  //   setCount(count - 1)
  // }, 1000)

  const dispatch = useAppDispatch()

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
    <div>
      <h1>Parity Thermostat</h1>
      {/* <div>Countdown: {count}</div> */}
      <div>Current Outdoor Temperature: {outdoor}</div>
      <div>Current Indoor Temperature: {indoor}</div>
      <div>UUID: {uuid}</div>
      <div>State: {thermostatState}</div>
      <div>Auto: {inAutoMode(thermostatState) ? `ON` : 'OFF'}</div>
      <div>
        Desired: {desiredTemperature}
        <button onClick={setHandleDesired('up')}>&#9650;</button>
        <button onClick={setHandleDesired('dowon')}>&#9660;</button>
      </div>
      <button onClick={handleRegister} disabled={!!uuid}>
        Register
      </button>
      <button
        onClick={handleTurnOff}
        disabled={uuid === null || thermostatState === THERMOSTAT_STATE.OFF}
      >
        Off
      </button>
      <button
        onClick={handleTurnOnHeating}
        disabled={uuid === null || thermostatState === THERMOSTAT_STATE.HEAT}
      >
        Heating
      </button>
      <button
        onClick={handleTurnOnCooling}
        disabled={
          uuid === null ||
          thermostatState === THERMOSTAT_STATE.COOL ||
          outdoor < 0
        }
      >
        Cooling
      </button>
      <button
        onClick={handleTurnOnAuto}
        disabled={uuid === null || inAutoMode(thermostatState)}
      >
        Auto
      </button>
    </div>
  )
}

export default Thermostat
