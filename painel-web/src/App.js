// src/App.js
import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { get } from 'aws-amplify/api';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';

// Imports do Material-UI
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';

// Importando nosso novo componente de Dashboard
import Dashboard from './components/Dashboard';

Amplify.configure(awsExports);

function App({ signOut, user }) {
  const [vendas, setVendas] = useState([]);

  async function fetchVendas() {
    try {
      // Lembre-se de colocar o nome da sua API aqui
      const apiName = 'api85e3a35d'; // Substitua pelo nome da sua API do aws-exports.js
      const path = '/vendas';
      
      const restOperation = get({ apiName, path });
      const response = await restOperation.response;
      const data = await response.body.json(); 
      
      setVendas(data);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
    }
  }

  useEffect(() => {
    fetchVendas();
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Painel de Controle
          </Typography>
          <Typography sx={{ marginRight: 2 }}>
            Olá, {user.username}
          </Typography>
          <Button color="inherit" onClick={signOut}>Sair</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Agora chamamos o componente Dashboard e passamos os dados das vendas para ele */}
        <Dashboard vendas={vendas} />
      </Container>
    </Box>
  );
}

export default withAuthenticator(App);