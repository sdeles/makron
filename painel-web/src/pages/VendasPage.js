// src/pages/VendasPage.js
import React, { useState, useEffect } from 'react';
import { get, put } from 'aws-amplify/api';
import { 
  Box, Typography, Paper, CircularProgress, IconButton, Modal, TextField, Button 
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const style = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

const formatarData = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const formatarMoeda = (valor) => {
  if (typeof valor !== 'number') return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

const VendasPage = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [freteInput, setFreteInput] = useState('');

  const apiName = 'api4063fef1'; // Certifique-se que o nome da API está correto

  const fetchVendas = async () => {
    setLoading(true);
    try {
      const path = '/vendas';
      const restOperation = get({ apiName, path });
      const response = await restOperation.response;
      const data = await response.body.json();
      const vendasComId = data.map(venda => ({ ...venda, id: venda.mercadoLivreId }));
      setVendas(vendasComId);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendas(); }, []);

  const handleOpenModal = (venda) => {
    setVendaSelecionada(venda);
    setFreteInput(venda.fretePersonalizado || '');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setVendaSelecionada(null);
    setFreteInput('');
  };

  const handleSaveFrete = async () => {
    if (!vendaSelecionada || (freteInput !== '' && isNaN(parseFloat(freteInput)))) {
      alert("Por favor, insira um valor de frete válido.");
      return;
    }
    
    try {
      const path = `/vendas/modificacoes/${vendaSelecionada.mercadoLivreId}`;
      
      const restOperation = put({
        apiName,
        path,
        options: { 
          body: { 
            fretePersonalizado: parseFloat(freteInput) 
          } 
        }
      });

      await restOperation.response;
      handleCloseModal();
      fetchVendas();
    } catch (error) {
      console.error("Erro ao atualizar o frete:", error);
      alert("Falha ao atualizar o frete.");
    }
  };

  // --- NOVA FUNÇÃO PARA REMOVER O FRETE ---
  const handleRemoveFrete = async () => {
    if (!vendaSelecionada) return;
    
    try {
      const path = `/vendas/modificacoes/${vendaSelecionada.mercadoLivreId}`;
      const restOperation = put({
        apiName,
        path,
        options: { 
          body: { 
            fretePersonalizado: null // Enviamos 'null' para a Lambda saber que deve remover
          } 
        }
      });

      await restOperation.response;
      handleCloseModal();
      fetchVendas();
    } catch (error) {
      console.error("Erro ao remover o frete:", error);
      alert("Falha ao remover o frete.");
    }
  };
  // ------------------------------------------

  const columns = [
    { field: 'date_created', headerName: 'Data', width: 110, type: 'date', valueGetter: (value) => new Date(value), valueFormatter: (value) => formatarData(value), },
    { field: 'mercadoLivreId', headerName: 'ID da venda', width: 160 },
    { field: 'sku', headerName: 'SKU', width: 150, valueGetter: (value, row) => row.items[0]?.sku || 'N/A' },
    { field: 'items', headerName: 'Produto', width: 300, valueGetter: (value) => value[0]?.title || 'N/A' },
    { field: 'total_amount', headerName: 'Valor de venda', width: 140, type: 'number', valueFormatter: (value) => formatarMoeda(value)},
    { field: 'custoDosProdutos', headerName: 'Custo (Produto)', width: 140, type: 'number', valueFormatter: (value) => formatarMoeda(value)},
    { field: 'custosOperacionais', headerName: 'Custo ML (Taxas+Frete)', width: 180, type: 'number', valueFormatter: (value) => formatarMoeda(value)},
    { field: 'lucroLiquido', headerName: 'Lucro liquido', width: 140, type: 'number', valueGetter: (value, row) => { const faturamento = row.total_amount || 0; const custoProduto = row.custoDosProdutos || 0; const custoML = row.custosOperacionais || 0; return faturamento - custoProduto - custoML; }, valueFormatter: (value) => formatarMoeda(value) },
    { field: 'margemLucro', headerName: 'Margem de lucro', width: 140, type: 'number', valueGetter: (value, row) => { const faturamento = row.total_amount || 0; if (faturamento === 0) return 0; const custoProduto = row.custoDosProdutos || 0; const custoML = row.custosOperacionais || 0; const lucro = faturamento - custoProduto - custoML; return (lucro / faturamento) * 100; }, valueFormatter: (value) => `${value.toFixed(1)}%`, },
    {
      field: 'actions',
      headerName: 'Frete Manual',
      sortable: false,
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        return (
          <IconButton onClick={() => handleOpenModal(params.row)} title="Adicionar/Editar frete personalizado">
            <LocalShippingIcon color={typeof params.row.fretePersonalizado === 'number' ? "primary" : "inherit"} />
          </IconButton>
        );
      }
    }
  ];

  if (loading) { return <CircularProgress />; }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Relatório de Vendas
      </Typography>
      <Paper sx={{ height: '75vh', width: '100%' }}>
        <DataGrid
          rows={vendas}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 50 } },
            sorting: { sortModel: [{ field: 'date_created', sort: 'desc' }] },
          }}
          pageSizeOptions={[25, 50, 100]}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, }, }}
        />
      </Paper>

      {vendaSelecionada && (
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box sx={style}>
            <Typography variant="h6" component="h2">
              Adicionar/Editar Frete Personalizado
            </Typography>
            <Typography sx={{ mt: 2 }}>
              Venda: {vendaSelecionada.mercadoLivreId}
            </Typography>
            <TextField
              margin="normal"
              fullWidth
              label="Valor do Frete (ex: 35.50)"
              name="fretePersonalizado"
              type="number"
              value={freteInput}
              onChange={(e) => setFreteInput(e.target.value)}
              placeholder="Digite o custo real do frete"
            />
            {/* --- BOTÕES DO MODAL ATUALIZADOS --- */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleRemoveFrete} color="error" disabled={vendaSelecionada.fretePersonalizado === undefined}>
                Remover Frete
              </Button>
              <Box>
                <Button onClick={handleCloseModal}>Cancelar</Button>
                <Button onClick={handleSaveFrete} variant="contained" sx={{ ml: 1 }}>Salvar Frete</Button>
              </Box>
            </Box>
            {/* ------------------------------------ */}
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default VendasPage;