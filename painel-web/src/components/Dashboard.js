// src/components/Dashboard.js (VERSÃO COMPLETA COM GRÁFICO CLICÁVEL)
import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Paper, Typography, Box, Grid, Card, CardContent, Skeleton, Button, ButtonGroup } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // NOVO IMPORT PARA NAVEGAÇÃO

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const KpiCard = ({ title, value, growth, growthColor = 'success.main' }) => (
  <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
    <Typography color="text.secondary" gutterBottom>{title}</Typography>
    <Typography variant="h4" component="div">{value}</Typography>
    {growth && (<Typography sx={{ color: growthColor }}>{growth}</Typography>)}
  </Paper>
);

const Dashboard = ({ vendas, loading, periodo, setPeriodo }) => {
  const navigate = useNavigate(); // NOVO HOOK PARA NAVEGAÇÃO

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

  const processMonthlyData = () => {
    const dados = vendasFiltradas;
    if (!dados || dados.length === 0) return { labels: [], datasets: [] };
    const monthlySales = dados.reduce((acc, venda) => {
      const date = new Date(venda.date_created);
      const monthYearKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthYearLabel = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      if (!acc[monthYearKey]) acc[monthYearKey] = { total: 0, label: monthYearLabel };
      acc[monthYearKey].total += venda.total_amount;
      return acc;
    }, {});
    const sortedKeys = Object.keys(monthlySales).sort();
    const labels = sortedKeys.map(key => monthlySales[key].label);
    const data = sortedKeys.map(key => monthlySales[key].total);
    return {
      labels,
      datasets: [{ label: 'Faturamento Mensal (BRL)', data: data, backgroundColor: 'rgba(54, 162, 235, 0.6)', }],
    };
  };

  const processProductData = () => {
    const dados = vendasFiltradas;
    if (!dados || dados.length === 0) return { labels: [], datasets: [] };
    const productSales = dados.flatMap(venda => venda.items).reduce((acc, item) => {
      const sku = item.sku || 'SKU Não Definido';
      if (!acc[sku]) acc[sku] = 0;
      acc[sku] += item.quantity;
      return acc;
    }, {});
    const sortedProducts = Object.entries(productSales).sort(([, a], [, b]) => b - a).slice(0, 5);
    const labels = sortedProducts.map(([sku]) => sku);
    const data = sortedProducts.map(([, quantity]) => quantity);
    return { labels, datasets: [{ label: 'Quantidade Vendida', data: data, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'], }], };
  };

  const monthlyChartData = processMonthlyData();
  const productChartData = processProductData();

  // --- NOVA FUNÇÃO PARA O CLIQUE NO GRÁFICO ---
  const handleChartClick = (event, elements) => {
    if (elements.length > 0) {
      const elementIndex = elements[0].index;
      const clickedLabel = monthlyChartData.labels[elementIndex]; // ex: "setembro de 2025"
      
      // Mapeia o nome do mês para o número do mês
      const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
      const [monthName, year] = clickedLabel.split(' de ');
      const monthIndex = monthNames.indexOf(monthName.toLowerCase()) + 1;
      
      if (monthIndex > 0 && year) {
        // Navega para a página de análise com os parâmetros na URL
        navigate(`/analise?year=${year}&month=${monthIndex}&monthLabel=${clickedLabel}`);
      }
    }
  };
  // ---------------------------------------------

  const barChartOptions = { 
    onClick: handleChartClick, // ADICIONADO O EVENTO DE CLIQUE
    maintainAspectRatio: false, 
    responsive: true, 
    plugins: { 
      legend: { position: 'top' }, 
      title: { display: true, text: 'Faturamento por Mês (Clique na barra para detalhar)' } // TÍTULO ATUALIZADO
    } 
  };
  
  const doughnutChartOptions = { maintainAspectRatio: false, responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Top 5 Produtos Mais Vendidos' } } };

  if (loading) {
    return ( <Box> <Typography variant="h4" component="h1" gutterBottom><Skeleton width="40%" /></Typography> <Grid container spacing={3}> <Grid item xs={12} sm={6} md={3}><Skeleton variant="rectangular" height={118} /></Grid> <Grid item xs={12} sm={6} md={3}><Skeleton variant="rectangular" height={118} /></Grid> <Grid item xs={12} sm={6} md={3}><Skeleton variant="rectangular" height={118} /></Grid> <Grid item xs={12} sm={6} md={3}><Skeleton variant="rectangular" height={118} /></Grid> <Grid item xs={12} md={8}><Skeleton variant="rectangular" height={400} /></Grid> <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={400} /></Grid> </Grid> </Box> );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Dashboard</Typography>
        <ButtonGroup variant="outlined" aria-label="filtro de período">
          <Button variant={periodo === 3 ? 'contained' : 'outlined'} onClick={() => setPeriodo(3)}>3M</Button>
          <Button variant={periodo === 6 ? 'contained' : 'outlined'} onClick={() => setPeriodo(6)}>6M</Button>
          <Button variant={!periodo ? 'contained' : 'outlined'} onClick={() => setPeriodo(null)}>Tudo</Button>
        </ButtonGroup>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><KpiCard title="Faturamento Bruto" value={`R$ ${kpis.faturamentoBruto.toFixed(2)}`} /></Grid>
        <Grid item xs={12} sm={6} md={3}><KpiCard title="Lucro Líquido" value={`R$ ${kpis.lucroLiquido.toFixed(2)}`} growth={`${kpis.margemLucro.toFixed(1)}%`} /></Grid>
        <Grid item xs={12} sm={6} md={3}><KpiCard title="Nº de Vendas" value={kpis.numeroDeVendas} /></Grid>
        <Grid item xs={12} sm={6} md={3}><KpiCard title="Ticket Médio" value={`R$ ${kpis.ticketMedio.toFixed(2)}`} /></Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          {/* ADICIONADO CURSOR POINTER PARA INDICAR QUE É CLICÁVEL */}
          <Paper sx={{ p: 2, height: '50vh', cursor: 'pointer' }}>
            <Bar options={barChartOptions} data={monthlyChartData} />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, height: '50vh' }}>
            <Doughnut options={doughnutChartOptions} data={productChartData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;