// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import Dashboard from '../components/Dashboard'; // Importando o componente que criamos

const DashboardPage = () => {
  const [vendas, setVendas] = useState([]);

  async function fetchVendas() {
    try {
      // Lembre-se de colocar o nome da sua API aqui
      const apiName = 'api4063fef1'; // Substitua pelo nome da sua API do aws-exports.js
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

  return <Dashboard vendas={vendas} />;
};

export default DashboardPage;