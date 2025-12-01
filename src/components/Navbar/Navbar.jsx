import React from 'react';
import { useSidebar } from '../SidebarContext';
import styles from './Navbar.module.css';
import navbar_logo from '../../assets/images/beaj_logo.png';

const Navbar = () => {
    const { toggleSidebar } = useSidebar();

    return (
        <div className={styles.navbar}>
            <img className={styles.navbarLogo} src={navbar_logo} alt="logo" onClick={toggleSidebar} />
        </div>
    );
};

export default Navbar;