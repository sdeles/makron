// src/App.js
import React, { useState, useMemo } from 'react';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { Routes, Route } from 'react-router-dom';

// --- NOVAS IMPORTAÇÕES PARA O TEMA ---
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme';
// ------------------------------------

// Importando nossos componentes de layout e páginas
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ProdutosPage from './pages/ProdutosPage';

Amplify.configure(awsExports);

function App({ signOut, user }) {
  // 1. Estado para controlar o modo (light/dark)
  const [mode, setMode] = useState('light');

  // 2. Função para alternar o modo
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  // 3. Seleciona o objeto de tema correto com base no estado
  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    // 4. Prover o tema para toda a aplicação
    <ThemeProvider theme={theme}>
      {/* CssBaseline normaliza o CSS e aplica a cor de fundo do tema */}
      <CssBaseline />
      <Routes>
        {/* 5. Passar a função de toggle para o Layout */}
        <Route path="/" element={<MainLayout signOut={signOut} user={user} toggleColorMode={colorMode.toggleColorMode} />}>
          <Route index element={<DashboardPage />} />
          <Route path="produtos" element={<ProdutosPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default withAuthenticator(App);