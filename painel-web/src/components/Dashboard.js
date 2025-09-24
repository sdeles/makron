// src/components/Dashboard.js (VERSÃO COM GRÁFICO APRIMORADO)
import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Paper, Typography, Box, Grid, Card, CardContent, Skeleton, Button, ButtonGroup } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = ({ vendas, loading, periodo, setPeriodo }) => {

  const vendasFiltradas = useMemo(() => {
    if (loading || !vendas) return [];
    if (!periodo) return vendas;

    const dataLimite = new Date();
    dataLimite.setMonth(dataLimite.getMonth() - periodo);
    
    return vendas.filter(venda => new Date(venda.date_created) >= dataLimite);
  }, [vendas, periodo, loading]);

  const kpis = useMemo(() => {
    const dados = vendasFiltradas;
    if (!dados || dados.length === 0) {
      return { faturamentoBruto: 0, lucroLiquido: 0, margemLucro: 0, numeroDeVendas: 0, ticketMedio: 0 };
    }
    const faturamentoBruto = dados.reduce((sum, venda) => sum + venda.total_amount, 0);
    const custoTotalCompleto = dados.reduce((sum, venda) => {
      const custoDaVenda = (venda.custoDosProdutos || 0) + (venda.custosOperacionais || 0);
      return sum + custoDaVenda;
    }, 0);
    const numeroDeVendas = dados.length;
    const ticketMedio = faturamentoBruto > 0 ? faturamentoBruto / numeroDeVendas : 0;
    const lucroLiquido = faturamentoBruto - custoTotalCompleto;
    const margemLucro = faturamentoBruto > 0 ? (lucroLiquido / faturamentoBruto) * 100 : 0;
    return { faturamentoBruto, numeroDeVendas, ticketMedio, lucroLiquido, margemLucro };
  }, [vendasFiltradas]);

  // --- LÓGICA DE ORDENAÇÃO CORRIGIDA AQUI ---
  const processMonthlyData = () => {
    const dados = vendasFiltradas;
    if (!dados || dados.length === 0) return { labels: [], datasets: [] };
    
    const monthlySales = dados.reduce((acc, venda) => {
      const date = new Date(venda.date_created);
      // Cria uma chave "AAAA-MM" que pode ser ordenada corretamente
      const monthYearKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthYearLabel = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

      if (!acc[monthYearKey]) {
        acc[monthYearKey] = { total: 0, label: monthYearLabel };
      }
      acc[monthYearKey].total += venda.total_amount;
      return acc;
    }, {});
    
    // Ordena as chaves (ex: "2025-08", "2025-09") antes de criar os dados do gráfico
    const sortedKeys = Object.keys(monthlySales).sort();
    
    const labels = sortedKeys.map(key => monthlySales[key].label);
    const data = sortedKeys.map(key => monthlySales[key].total);

    return {
      labels,
      datasets: [{ label: 'Faturamento Mensal (BRL)', data: data, backgroundColor: 'rgba(54, 162, 255, 0.6)', }],
    };
  };

  const processProductData = () => {
    const dados = vendasFiltradas;
    if (!dados || dados.length === 0) return { labels: [], datasets: [] };
    const productSales = dados.flatMap(venda => venda.items).reduce((acc, item) => {
      const title = item.title;
      if (!acc[title]) acc[title] = 0;
      acc[title] += item.quantity;
      return acc;
    }, {});
    const sortedProducts = Object.entries(productSales).sort(([, a], [, b]) => b - a).slice(0, 5);
    const labels = sortedProducts.map(([title]) => title);
    const data = sortedProducts.map(([, quantity]) => quantity);
    return { labels, datasets: [{ label: 'Quantidade Vendida', data: data, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'], }], };
  };

  const monthlyChartData = processMonthlyData();
  const productChartData = processProductData();

  // --- OPÇÕES DE ESTILO ADICIONADAS AQUI ---
  const barChartOptions = { 
    responsive: true, 
    plugins: { 
      legend: { position: 'top' }, 
      title: { display: true, text: 'Faturamento por Mês' } 
    },
    // Novas opções para afinar as barras e limpar o visual
    scales: { 
      x: { grid: { display: false } },
      y: { grid: { display: true } }
    },
    barPercentage: 0.5,
    categoryPercentage: 0.8,
  };
  const doughnutChartOptions = { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Top 5 Produtos Mais Vendidos' } } };

  if (loading) {
    return ( <Box> <Typography variant="h4" component="h1" gutterBottom><Skeleton width="40%" /></Typography> <Grid container spacing={3}> <Grid item xs={12} sm={6} md={3}><Skeleton variant="rectangular" height={118} /></Grid> <Grid item xs={12} sm={6} md={3}><Skeleton variant="rectangular" height={118} /></Grid> <Grid item xs={12} sm={6} md={3}><Skeleton variant="rectangular" height={118} /></Grid> <Grid item xs={12} sm={6} md={3}><Skeleton variant="rectangular" height={118} /></Grid> <Grid item xs={12} md={8}><Skeleton variant="rectangular" height={400} /></Grid> <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={400} /></Grid> </Grid> </Box> );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Dashboard de Vendas</Typography>
        <ButtonGroup variant="outlined" aria-label="filtro de período">
          <Button variant={periodo === 3 ? 'contained' : 'outlined'} onClick={() => setPeriodo(3)}>3M</Button>
          <Button variant={periodo === 6 ? 'contained' : 'outlined'} onClick={() => setPeriodo(6)}>6M</Button>
          <Button variant={!periodo ? 'contained' : 'outlined'} onClick={() => setPeriodo(null)}>Tudo</Button>
        </ButtonGroup>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography color="text.secondary" gutterBottom>Faturamento Bruto</Typography><Typography variant="h5">R$ {kpis.faturamentoBruto.toFixed(2)}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography color="text.secondary" gutterBottom>Lucro Líquido</Typography><Typography variant="h5" color="green">R$ {kpis.lucroLiquido.toFixed(2)}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography color="text.secondary" gutterBottom>Nº de Vendas</Typography><Typography variant="h5">{kpis.numeroDeVendas}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography color="text.secondary" gutterBottom>Margem de Lucro</Typography><Typography variant="h5" color="green">{kpis.margemLucro.toFixed(1)}%</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={8}><Paper sx={{ p: 2, height: '400px' }}><Bar options={barChartOptions} data={monthlyChartData} /></Paper></Grid>
        <Grid item xs={12} md={4}><Paper sx={{ p: 2, height: '400px' }}><Doughnut options={doughnutChartOptions} data={productChartData} /></Paper></Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;