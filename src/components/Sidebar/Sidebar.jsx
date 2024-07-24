import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import greater_arrow from '../../assets/images/greater_arrow.svg';

const Sidebar = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate("/");
    };
    const menuItems = [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Content Manager", path: "/content-manager" },
        { name: "User data", path: "/user-data" },
        { name: "Beaj operations", path: "/beaj-operations" },
        { name: "Chatbot Logs", path: "/chatbot-logs" },
        { name: "Chatbot Stats", path: "/chatbot-stats" },
    ];
    const location = useLocation();
    return (
        <div className={styles.sidebar}>
            <ul className={styles.menu}>
                {menuItems.map((item, index) => (
                    <li key={index} className={location.pathname.includes(item.path) ? styles.active : styles.not_active}>
                        <Link to={item.path} className={styles.menu_item}>
                            <p className={location.pathname.includes(item.path) ? styles.active : styles.not_active}>{item.name}</p>
                            <img src={greater_arrow} alt="greater_arrow" className={styles.arrow} />
                        </Link>
                    </li>
                ))}
            </ul>
            <div onClick={() => handleLogout()} className={styles.logout}>Logout</div>
        </div>
    )
}

export default Sidebar;
