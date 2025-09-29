// src/pages/AnalisePage.js
import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import { Paper, Typography, Box, CircularProgress, Grid, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend
);

const AnalisePage = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para controlar os filtros
  const [dateRange, setDateRange] = useState([startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))]);
  const [chartType, setChartType] = useState('bar');
  const [metrics, setMetrics] = useState(['valor']);

  const handleGenerateReport = async () => {
    const [startDate, endDate] = dateRange;
    if (!startDate || !endDate) {
      alert("Por favor, selecione uma data de início e fim.");
      return;
    }
    
    setLoading(true);
    try {
      const apiName = 'api4063fef1';
      // Formata as datas para o formato AAAA-MM-DD
      const startDateString = format(startDate, 'yyyy-MM-dd');
      const endDateString = format(endDate, 'yyyy-MM-dd');
      
      const path = `/analise?startDate=${startDateString}&endDate=${endDateString}`;
      
      const restOperation = get({ apiName, path });
      const response = await restOperation.response;
      const data = await response.body.json();
      
      setChartData(data);
    } catch (error) {
      console.error('Erro ao buscar dados de análise:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gera o objeto de dados para o Chart.js dinamicamente
  const generateChartDataObject = () => {
    if (!chartData) return { labels: [], datasets: [] };

    const datasets = [];
    if (metrics.includes('valor')) {
      datasets.push({
        label: 'Valor das Vendas (R$)',
        data: chartData.datasets.valor,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        yAxisID: 'yValor',
      });
    }
    if (metrics.includes('quantidade')) {
      datasets.push({
        label: 'Quantidade de Vendas',
        data: chartData.datasets.quantidade,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'yQuantidade',
      });
    }

    return { labels: chartData.labels, datasets };
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    scales: {
        yValor: { type: 'linear', display: true, position: 'left' },
        yQuantidade: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Análise de Vendas
      </Typography>

      {/* --- PAINEL DE FILTROS --- */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <DatePicker label="Data de Início" value={dateRange[0]} onChange={(newValue) => setDateRange([newValue, dateRange[1]])} />
          </Grid>
          <Grid item>
            <DatePicker label="Data de Fim" value={dateRange[1]} onChange={(newValue) => setDateRange([dateRange[0], newValue])} />
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={handleGenerateReport}>Gerar Relatório</Button>
          </Grid>
          <Grid item sx={{ flexGrow: 1 }} />
          <Grid item>
            <ToggleButtonGroup value={metrics} onChange={(e, newMetrics) => setMetrics(newMetrics)} aria-label="métricas a exibir">
              <ToggleButton value="valor" aria-label="valor">Valor</ToggleButton>
              <ToggleButton value="quantidade" aria-label="quantidade">Quantidade</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item>
            <ToggleButtonGroup value={chartType} exclusive onChange={(e, newType) => setChartType(newType)} aria-label="tipo de gráfico">
              <ToggleButton value="bar" aria-label="gráfico de barras">Barras</ToggleButton>
              <ToggleButton value="line" aria-label="gráfico de linha">Linha</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* --- ÁREA DO GRÁFICO --- */}
      {loading ? (
        <CircularProgress />
      ) : chartData ? (
        <Paper sx={{ p: 2, height: '70vh' }}>
          {chartType === 'bar' ? (
            <Bar options={chartOptions} data={generateChartDataObject()} />
          ) : (
            <Line options={chartOptions} data={generateChartDataObject()} />
          )}
        </Paper>
      ) : (
        <Typography>Selecione um período e clique em "Gerar Relatório" para começar.</Typography>
      )}
    </Box>
  );
};

export default AnalisePage;