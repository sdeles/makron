// src/components/Dashboard.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Paper, Typography, Box } from '@mui/material';

// É necessário registrar os componentes do Chart.js que vamos usar
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ vendas }) => {
  // Função para processar os dados das vendas e agrupar por mês
  const processChartData = () => {
    if (!vendas || vendas.length === 0) {
      return { labels: [], datasets: [] };
    }

    const monthlySales = vendas.reduce((acc, venda) => {
      // Cria uma chave para o mês/ano (ex: "Setembro de 2025")
      const monthYear = new Date(venda.date_created).toLocaleString('pt-BR', {
        month: 'long',
        year: 'numeric',
      });

      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += venda.total_amount;
      return acc;
    }, {});

    const labels = Object.keys(monthlySales);
    const data = Object.values(monthlySales);

    return {
      labels,
      datasets: [
        {
          label: 'Faturamento Mensal (BRL)',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
  };

  const chartData = processChartData();

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Faturamento por Mês' },
    },
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Dashboard de Vendas
      </Typography>
      <Box sx={{ height: '400px' }}>
         <Bar options={options} data={chartData} />
      </Box>
    </Paper>
  );
};

export default Dashboard;