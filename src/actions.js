import {
  REGISTER,
  START_REQUEST,
  SUCCESS_REQUEST,
  ERROR_REQUEST,
  UPDATE_TEMPERATURE,
  SET_THERMOSTAT_STATE,
  UPDATE_DESIRED_TEMPERATURE
} from './constants'
import {
  getTemperature,
  registerBackend,
  setStateOfThermostat
} from './endpoints'
import { getCurrentTemperature, inAutoMode, getStateToGo } from './utils'

async function updateDesiredTemperature(dispatch, currentState) {
  const { desiredTemperature } = currentState
  dispatch({ type: UPDATE_DESIRED_TEMPERATURE, desiredTemperature })
  const { uuid, thermostatState, indoor, outdoor } = currentState
  checkThenRunAuto(dispatch, {
    uuid,
    outdoor,
    indoor,
    desiredTemperature,
    thermostatState
  })
}

async function updateTemperature(dispatch, currentState) {
  const { uuid, thermostatState, desiredTemperature } = currentState
  dispatch({ type: START_REQUEST })
  try {
    const [outdoorHistory, indoorHistory] = await getTemperature()
    const temperature = {
      outHistory: outdoorHistory.data_points,
      inHistory: indoorHistory.data_points
    }
    dispatch({ type: SUCCESS_REQUEST })
    dispatch({ type: UPDATE_TEMPERATURE, temperature })
    const { outdoor, indoor } = getCurrentTemperature(temperature)
    checkThenRunAuto(dispatch, {
      uuid,
      outdoor,
      indoor,
      desiredTemperature,
      thermostatState
    })
  } catch (error) {
    dispatch({ type: ERROR_REQUEST, error })
  }
}

async function register(dispatch) {
  dispatch({ type: START_REQUEST })
  try {
    const { uid_hash: uuid, state } = await registerBackend()
    dispatch({ type: SUCCESS_REQUEST })
    dispatch({ type: REGISTER, uuid, state })
  } catch (error) {
    dispatch({ type: ERROR_REQUEST, error })
  }
}

async function changeStateOfThermostat(dispatch, data) {
  dispatch({ type: START_REQUEST })
  try {
    const { state } = await setStateOfThermostat(data)
    dispatch({ type: SET_THERMOSTAT_STATE, state })
  } catch (error) {
    dispatch({ type: ERROR_REQUEST, error })
  }
}

function checkThenRunAuto(dispatch, state) {
  const { uuid, thermostatState, desiredTemperature, indoor, outdoor } = state
  const expectedState = getStateToGo(indoor, outdoor, desiredTemperature)
  if (
    uuid !== null &&
    inAutoMode(thermostatState) &&
    expectedState !== thermostatState
  ) {
    changeStateOfThermostat(dispatch, {
      uuid,
      state: expectedState
    })
  }
}

function runInAuto(dispatch, currentState) {
  const {
    uuid,
    outdoor: currentOutdoor,
    indoor: currentRoom,
    desiredTemperature
  } = currentState

  changeStateOfThermostat(dispatch, {
    uuid,
    state: getStateToGo(currentRoom, currentOutdoor, desiredTemperature)
  })
}

export {
  updateTemperature,
  register,
  changeStateOfThermostat,
  updateDesiredTemperature,
  runInAuto
}
