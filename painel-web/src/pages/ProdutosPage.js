// src/pages/ProdutosPage.js
import React, { useState, useEffect } from 'react';
import { get, post, put, del } from 'aws-amplify/api';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Modal,
  TextField,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ProdutosPage = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // --- ADICIONADO NOVO CAMPO AO ESTADO INICIAL ---
  const [currentProduto, setCurrentProduto] = useState({ id: null, nome: '', sku: '', custo: 0, preco: 0, custoFreteMedio: 0 });

  const apiName = 'api4063fef1'; // O nome correto da sua API principal
  const path = '/produtos';

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const restOperation = get({ apiName, path });
      const response = await restOperation.response;
      const data = await response.body.json();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // --- ADICIONADO NOVO CAMPO AO OBJETO DE DADOS ---
    const produtoData = {
        nome: currentProduto.nome,
        sku: currentProduto.sku,
        custo: parseFloat(currentProduto.custo),
        preco: parseFloat(currentProduto.preco),
        custoFreteMedio: parseFloat(currentProduto.custoFreteMedio), // Novo campo
    };

    try {
      if (isEditing) {
        const restOperation = put({
          apiName,
          path: `${path}/${currentProduto.id}`,
          options: { body: produtoData }
        });
        await restOperation.response;
      } else {
        const restOperation = post({
          apiName,
          path: path,
          options: { body: produtoData }
        });
        await restOperation.response;
      }
      handleClose();
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const restOperation = del({
        apiName,
        path: `${path}/${id}`
      });
      await restOperation.response;
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao apagar produto:', error);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const handleOpen = () => {
    setIsEditing(false);
    // --- ADICIONADO NOVO CAMPO AO RESETAR ---
    setCurrentProduto({ id: null, nome: '', sku: '', custo: 0, preco: 0, custoFreteMedio: 0 });
    setOpen(true);
  };

  const handleEditOpen = (produto) => {
    setIsEditing(true);
    setCurrentProduto(produto);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduto(prevState => ({ ...prevState, [name]: value }));
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Gestão de Produtos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>Adicionar Produto</Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell align="right">Custo (R$)</TableCell>
              <TableCell align="right">Preço (R$)</TableCell>
              {/* --- NOVA COLUNA NA TABELA --- */}
              <TableCell align="right">Frete Médio (R$)</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {produtos.map((produto) => (
              <TableRow key={produto.id}>
                <TableCell>{produto.nome}</TableCell>
                <TableCell>{produto.sku}</TableCell>
                <TableCell align="right">{produto.custo?.toFixed(2)}</TableCell>
                <TableCell align="right">{produto.preco?.toFixed(2)}</TableCell>
                {/* --- NOVO DADO NA TABELA --- */}
                <TableCell align="right">{produto.custoFreteMedio?.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleEditOpen(produto)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(produto.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">{isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}</Typography>
          <TextField margin="normal" fullWidth label="Nome do Produto" name="nome" value={currentProduto.nome} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="SKU" name="sku" value={currentProduto.sku} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Custo (ex: 19.99)" name="custo" type="number" value={currentProduto.custo} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Preço de Venda (ex: 39.99)" name="preco" type="number" value={currentProduto.preco} onChange={handleChange} />
          {/* --- NOVO CAMPO NO FORMULÁRIO --- */}
          <TextField margin="normal" fullWidth label="Custo de Frete Médio (ex: 25.50)" name="custoFreteMedio" type="number" value={currentProduto.custoFreteMedio} onChange={handleChange} />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>Salvar</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ProdutosPage;