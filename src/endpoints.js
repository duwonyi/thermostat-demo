import axios from 'axios'

import { QUERY_GAP } from './constants'

const API_ROOT = 'http://api-staging.paritygo.com/sensors/api'
const SENSORS = `${API_ROOT}/sensors`
const THERMOSTAT = `${API_ROOT}/thermostat`

function getTemperature() {
  const end = new Date()
  const begin = new Date(end.getTime() - QUERY_GAP)
  return Promise.all([
    axios
      .get(
        `${SENSORS}/outdoor-1/?begin=${begin.toISOString()}&end=${end.toISOString()}`
      )
      .then(response => response.data),
    axios
      .get(
        `${SENSORS}/indoor-1/?begin=${begin.toISOString()}&end=${end.toISOString()}`
      )
      .then(response => response.data)
  ])
}

function registerBackend() {
  return axios.post(`${THERMOSTAT}/register/`).then(response => response.data)
}

function setStateOfThermostat({ uuid, state }) {
  return axios
    .patch(`${THERMOSTAT}/${uuid}/`, { state })
    .then(response => response.data)
}

export { getTemperature, registerBackend, setStateOfThermostat }
