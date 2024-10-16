// ResponsiveMenu.tsx
import React, { useState } from 'react';
import { IconButton, Drawer, Box, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { grey } from '@mui/material/colors';
import CalendarModal from '../calendar/CalendarPage';

interface ResponsiveMenuProps {
  handleFilterOpen: () => void;
  handleClickOpen: () => void;
}

const ResponsiveMenu: React.FC<ResponsiveMenuProps> = ({ handleFilterOpen, handleClickOpen }) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = (): void => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = (): void => {
    setDrawerOpen(false);
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Hamburger icon for small screens */}
      <IconButton
        aria-label="menu"
        onClick={handleDrawerOpen}
        sx={{
          display: { xs: 'block', sm: 'none' },
          position: 'fixed',
          top: 10,
          right: 10,
          zIndex: 9999,
        }}
      >
        <MenuIcon sx={{ color: grey[50], fontSize: 40 }} />
      </IconButton>

      {/* Small screen drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        sx={{ display: { xs: 'block', sm: 'none' } }}
      >
        <Box
          sx={{ width: 250, backgroundColor: grey[800], height: '100%', color: '#fff' }}
          role="presentation"
          onClick={handleDrawerClose}
          onKeyDown={handleDrawerClose}
        >
          <List>
            <ListItem onClick={handleFilterOpen}>
              <FilterAltIcon sx={{ color: grey[50], fontSize: 40 }} />
              <ListItemText primary="Filter By" sx={{ marginLeft: 2 }} />
            </ListItem>
            <ListItem onClick={handleClickOpen}>
              <AddCircleOutlineIcon sx={{ color: grey[50], fontSize: 40 }} />
              <ListItemText primary="Add New" sx={{ marginLeft: 2 }} />
            </ListItem>
            <ListItem onClick={showDrawer}>
              <CalendarMonthIcon sx={{ color: grey[50], fontSize: 40 }} />
              <ListItemText primary="See Agenda" sx={{ marginLeft: 2 }} />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Normal buttons for large screens */}
      <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
        <IconButton aria-label="filter" onClick={handleFilterOpen}>
          <FilterAltIcon sx={{ color: grey[50], fontSize: 40 }} />
          <p className='p-3 text-white'>Filter By</p>
        </IconButton>
        <IconButton aria-label="add" onClick={handleClickOpen}>
          <AddCircleOutlineIcon sx={{ color: grey[50], fontSize: 40 }} />
          <p className='p-3 text-white'>Add New</p>
        </IconButton>
        <IconButton aria-label="calendar" onClick={showDrawer}>
          <CalendarMonthIcon sx={{ color: grey[50], fontSize: 40 }} />
          <p className='p-3 text-white'>See Agenda</p>
        </IconButton>
      </Box>

      <CalendarModal showDrawer={showDrawer} onClose={onClose} open={open} />
    </>
  );
};

export default ResponsiveMenu;