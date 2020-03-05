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
      return { ...state, loading: false, error: null }
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
  const [state, dispatch] = useReducer(appReducer, localState || initialState)

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

export { AppProvider, useAppState, useAppDispatch }
