import React from 'react';
import styles from './Navbar.module.css';
import navbar_logo from '../../assets/images/beaj_logo.png';
import search from '../../assets/images/search.svg';
import notification from '../../assets/images/notification.svg';
import GetUserImage from '../GetUserImage/GetUserImage';

const Navbar = () => {
    return (
        <div className={styles.navbar}>
            <img className={styles.navbarLogo} src={navbar_logo} alt="logo" />
            <div className={styles.menu_options}>
                <img className={styles.search} src={search} alt="search" />
                <img className={styles.notification} src={notification} alt="notification" />
                <GetUserImage />
            </div>
        </div>
    )
}

export default Navbar;
