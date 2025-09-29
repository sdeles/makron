// src/pages/DashboardPage.js (Versão Simplificada)
import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import Dashboard from '../components/Dashboard';

const DashboardPage = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState(6); 

  useEffect(() => {
    const fetchVendas = async () => {
      setLoading(true);
      try {
        // O nome da sua API de vendas. Verifique se está correto.
        const apiName = 'api4063fef1'; 
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
    };

    fetchVendas();
  }, []);

  // Agora passa apenas as props necessárias para o Dashboard
  return <Dashboard vendas={vendas} loading={loading} periodo={periodo} setPeriodo={setPeriodo} />;
};

export default DashboardPage;