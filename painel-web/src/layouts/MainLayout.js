// src/layouts/MainLayout.js
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  CssBaseline,
  Divider
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BarChartIcon from '@mui/icons-material/BarChart'; // Ícone para Análise
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const MainLayout = ({ signOut, user, toggleColorMode }) => {
  const theme = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleToggleDrawer = () => {
    setOpen(!open);
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleToggleDrawer}
            edge="start"
            sx={{
              marginRight: 2,
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Painel de Controle
          </Typography>
          <Typography sx={{ marginRight: 2, display: { xs: 'none', sm: 'block' } }}>
            Olá, {user.username}
          </Typography>
          <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Button color="inherit" onClick={signOut}>Sair</Button>
        </Toolbar>
      </AppBar>
      
      <Drawer variant="permanent" open={open}>
        <DrawerHeader />
        <Divider />
        <List>
          {/* --- ALTERAÇÃO AQUI --- */}
          <ListItem disablePadding sx={{ display: 'block' }} component={Link} to="/">
            <ListItemButton selected={location.pathname === '/'} sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, }}>
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', }}><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Resumo" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
          {/* --- NOVO ITEM DE MENU ADICIONADO --- */}
          <ListItem disablePadding sx={{ display: 'block' }} component={Link} to="/analise">
            <ListItemButton selected={location.pathname.startsWith('/analise')} sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, }}>
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', }}><BarChartIcon /></ListItemIcon>
              <ListItemText primary="Análise" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
          {/* ------------------------------------- */}
          <ListItem disablePadding sx={{ display: 'block' }} component={Link} to="/vendas">
            <ListItemButton selected={location.pathname === '/vendas'} sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, }}>
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', }}><ReceiptLongIcon /></ListItemIcon>
              <ListItemText primary="Vendas" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ display: 'block' }} component={Link} to="/produtos">
            <ListItemButton selected={location.pathname === '/produtos'} sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, }}>
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', }}><InventoryIcon /></ListItemIcon>
              <ListItemText primary="Produtos" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default MainLayout;