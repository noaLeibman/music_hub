import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

type Props = {
  items: string[];
};

const SimpleMenu: React.FC<Props> = ({items}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = items.map((item: string) => {
    <MenuItem onClick={handleClose}>{item}</MenuItem>
  });


  return (
    <div>
      <IconButton
        aria-controls="simple-menu" 
        aria-haspopup="true" 
        edge="start" 
        className="menu-button" 
        color="inherit" 
        aria-label="menu" 
        onClick={handleClick}
        >
        <MenuIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {menuItems}
      </Menu>
    </div>
  );
};

export default SimpleMenu;
