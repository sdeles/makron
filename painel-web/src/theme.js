// src/theme.js
import { createTheme } from '@mui/material/styles';

// Tema para o modo claro (Light Mode)
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Azul padrão
    },
    secondary: {
      main: '#dc004e', // Rosa/Vinho
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
});

// Tema para o modo escuro (Dark Mode)
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Azul claro
    },
    secondary: {
      main: '#f48fb1', // Rosa claro
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});