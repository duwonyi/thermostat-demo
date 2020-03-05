import React, { createContext, useReducer, useContext, useEffect } from 'react'

import {
  REGISTER,
  START_REQUEST,
  SUCCESS_REQUEST,
  ERROR_REQUEST,
  UPDATE_TEMPERATURE,
  KEY_LOCAL_STORAGE,
  SET_THERMOSTAT_STATE,
  UPDATE_DESIRED_TEMPERATURE
} from './constants'
import {
  getTemperature,
  registerBackend,
  setStateOfThermostat
} from './endpoints'
import { getCurrentTemperature, inAutoMode, getStateToGo } from './utils'

const AppStateContext = createContext()
const AppDispatchContext = createContext()

const localState = JSON.parse(localStorage.getItem(KEY_LOCAL_STORAGE))

const initialState = {
  uuid: null,
  outHistory: null,
  inHistory: null,
  thermostatState: null,
  desired: 20,
  loading: false,
  error: null
}

function appReducer(state, action) {
  switch (action.type) {
    case REGISTER: {
      return { ...state, uuid: action.uuid, thermostatState: action.state }
    }
    case UPDATE_TEMPERATURE: {
      return {
        ...state,
        outHistory: action.temperature.outHistory,
        inHistory: action.temperature.inHistory
      }
    }
    case SET_THERMOSTAT_STATE: {
      return {
        ...state,
        thermostatState: action.state
      }
    }
    case UPDATE_DESIRED_TEMPERATURE: {
      return { ...state, desired: action.desiredTemperature }
    }
    case START_REQUEST: {
      return { ...state, loading: true }
    }
    case SUCCESS_REQUEST: {
      return { ...state, loading: false }
    }
    case ERROR_REQUEST: {
      return { ...state, loading: false, error: action.error }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(
    appReducer,
    (localState && localState.error !== null) || initialState
  )

  useEffect(() => {
    localStorage.setItem(KEY_LOCAL_STORAGE, JSON.stringify(state))
  }, [state])

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}

function useAppState() {
  const context = useContext(AppStateContext)
  if (context === undefined) {
    throw new Error('useAppState must be used within a AppProvicer')
  }
  return context
}

function useAppDispatch() {
  const context = useContext(AppDispatchContext)
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within a AppProvicer')
  }
  return context
}

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
  AppProvider,
  useAppState,
  useAppDispatch,
  updateTemperature,
  register,
  changeStateOfThermostat,
  updateDesiredTemperature,
  runInAuto
}
