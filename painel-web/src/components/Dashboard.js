// src/components/Dashboard.js
import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement, // Novo para o gráfico de rosca
} from 'chart.js';
import { Paper, Typography, Box, Grid, Card, CardContent } from '@mui/material';

// Registrando os componentes do Chart.js que vamos usar
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // Novo
);

const Dashboard = ({ vendas }) => {
  // Usamos useMemo para evitar recalcular esses dados a cada renderização
  const kpis = useMemo(() => {
    if (!vendas || vendas.length === 0) {
      return { faturamentoTotal: 0, numeroDeVendas: 0, ticketMedio: 0 };
    }
    const faturamentoTotal = vendas.reduce((sum, venda) => sum + venda.total_amount, 0);
    const numeroDeVendas = vendas.length;
    const ticketMedio = faturamentoTotal / numeroDeVendas;

    return { faturamentoTotal, numeroDeVendas, ticketMedio };
  }, [vendas]);

  // Função para processar os dados do gráfico de faturamento mensal
  const processMonthlyData = () => {
    if (!vendas || vendas.length === 0) return { labels: [], datasets: [] };
    const monthlySales = vendas.reduce((acc, venda) => {
      const monthYear = new Date(venda.date_created).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      if (!acc[monthYear]) acc[monthYear] = 0;
      acc[monthYear] += venda.total_amount;
      return acc;
    }, {});
    const labels = Object.keys(monthlySales).sort((a, b) => new Date(a) - new Date(b));
    const data = labels.map(label => monthlySales[label]);
    return {
      labels,
      datasets: [{
        label: 'Faturamento Mensal (BRL)',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }],
    };
  };

  // Função para processar os dados do gráfico de produtos mais vendidos
  const processProductData = () => {
    if (!vendas || vendas.length === 0) return { labels: [], datasets: [] };
    const productSales = vendas.flatMap(venda => venda.items).reduce((acc, item) => {
      const title = item.title;
      if (!acc[title]) acc[title] = 0;
      acc[title] += item.quantity;
      return acc;
    }, {});
    const sortedProducts = Object.entries(productSales).sort(([, a], [, b]) => b - a).slice(0, 5); // Pega o Top 5
    const labels = sortedProducts.map(([title]) => title);
    const data = sortedProducts.map(([, quantity]) => quantity);
    return {
      labels,
      datasets: [{
        label: 'Quantidade Vendida',
        data: data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      }],
    };
  };

  const monthlyChartData = processMonthlyData();
  const productChartData = processProductData();

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Faturamento por Mês' },
    },
  };
  
  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Top 5 Produtos Mais Vendidos' },
    },
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard de Vendas
      </Typography>
      <Grid container spacing={3}>
        {/* --- Cartões de KPI --- */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Faturamento Total</Typography>
              <Typography variant="h5" component="div">
                R$ {kpis.faturamentoTotal.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Nº de Vendas</Typography>
              <Typography variant="h5" component="div">
                {kpis.numeroDeVendas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Ticket Médio</Typography>
              <Typography variant="h5" component="div">
                R$ {kpis.ticketMedio.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* --- Gráficos --- */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Bar options={barChartOptions} data={monthlyChartData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Doughnut options={doughnutChartOptions} data={productChartData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;