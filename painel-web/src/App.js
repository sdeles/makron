// src/App.js
import React, { useState, useMemo } from 'react';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { Routes, Route } from 'react-router-dom';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme';

// --- NOVAS IMPORTAÇÕES PARA O SELETOR DE DATAS ---
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale'; // Para traduzir o calendário para português
// --------------------------------------------------

// Importando nossos componentes
import MainLayout from './layouts/MainLayout';
import ResumoPage from './pages/ResumoPage';
import ProdutosPage from './pages/ProdutosPage';
import VendasPage from './pages/VendasPage';
import AnalisePage from './pages/AnalisePage';

Amplify.configure(awsExports);

function App({ signOut, user }) {
  const [mode, setMode] = useState('light');
  const colorMode = useMemo(() => ({ toggleColorMode: () => { setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light')); }, }), []);
  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    // Envolvemos o ThemeProvider com o LocalizationProvider
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<MainLayout signOut={signOut} user={user} toggleColorMode={colorMode.toggleColorMode} />}>
            <Route index element={<ResumoPage />} /> 
            <Route path="produtos" element={<ProdutosPage />} />
            <Route path="vendas" element={<VendasPage />} />
            <Route path="analise" element={<AnalisePage />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default withAuthenticator(App);