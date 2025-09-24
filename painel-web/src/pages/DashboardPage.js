// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import Dashboard from '../components/Dashboard';

const DashboardPage = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  // --- NOVO ESTADO PARA O PERÍODO ---
  const [periodo, setPeriodo] = useState(6); // Padrão: últimos 6 meses

  async function fetchVendas() {
    setLoading(true);
    try {
      const apiName = 'api4063fef1'; // Certifique-se que este nome está correto
      const path = '/vendas';

      const restOperation = get({ apiName, path });
      const response = await restOperation.response;
      const data = await response.body.json(); 

      setVendas(data);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVendas();
  }, []);

  // --- PASSANDO OS NOVOS PROPS PARA O DASHBOARD ---
  return <Dashboard vendas={vendas} loading={loading} periodo={periodo} setPeriodo={setPeriodo} />;
};

export default DashboardPage;