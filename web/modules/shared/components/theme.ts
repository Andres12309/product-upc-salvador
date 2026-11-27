import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  defaultColorScheme: 'light',
  colorSchemes: {
    light: true,
    dark: false,
  },
  palette: {
    mode: 'light',
    background: {
      default: '#f4f6f8',
    },
  },
});
