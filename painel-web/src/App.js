// src/App.js
import './App.css';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { Routes, Route } from 'react-router-dom';

// Importando nossos componentes de layout e páginas
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ProdutosPage from './pages/ProdutosPage';

Amplify.configure(awsExports);

function App({ signOut, user }) {
  return (
    <Routes>
      <Route path="/" element={<MainLayout signOut={signOut} user={user} />}>
        {/* A página inicial será o Dashboard */}
        <Route index element={<DashboardPage />} /> 
        {/* A rota para a página de produtos */}
        <Route path="produtos" element={<ProdutosPage />} />
      </Route>
    </Routes>
  );
}

export default withAuthenticator(App);