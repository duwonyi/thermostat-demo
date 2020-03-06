import { createMuiTheme } from '@material-ui/core/styles'

export const secondaryMainColor = '#7f798a'
export const activeColor = '#337ab7'
const theme = {
  palette: {
    primary: {
      main: '#6e7ca0'
    },
    secondary: {
      main: secondaryMainColor
    },
    text: {
      primary: '#333147',
      hint: '#555063'
    },
    custom: {
      hover: '#6e7ca0',
      active: activeColor
    }
  },
  breakpoints: {
    values: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280
    }
  }
}

export default createMuiTheme(theme)