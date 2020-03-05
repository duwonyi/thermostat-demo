import { THERMOSTAT_STATE } from './constants'

function getCurrentTemperature({ outHistory, inHistory }) {
  const outdoor = avg(outHistory)
  const indoor = avg(inHistory)

  return { outdoor, indoor }
}

function avg(history) {
  if (!history) return 0.0
  const sum = history.reduce((a, c) => a + parseFloat(c.value), 0)
  return (sum / history.length).toFixed(2)
}

function inAutoMode(currentState) {
  return /^auto_/.test(currentState)
}

function getStateToGo(currentRoom, currentOutdoor, desiredTemperature) {
  if (currentRoom < desiredTemperature) {
    return THERMOSTAT_STATE.AUTO_HEAT
  } else if (currentRoom > desiredTemperature && currentOutdoor < 0) {
    return THERMOSTAT_STATE.AUTO_STANDBY
  } else if (currentRoom > desiredTemperature) {
    return THERMOSTAT_STATE.AUTO_COOL
  }
}

export { getCurrentTemperature, inAutoMode, getStateToGo }
