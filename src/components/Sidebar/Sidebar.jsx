import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import greater_arrow from '../../assets/images/greater_arrow.svg';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const role = localStorage.getItem('role'); // Get the role from localStorage

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        navigate("/");
    };

    // Define menu items with role-based visibility
    const menuItems = [
        { name: "Dashboard", path: "/dashboard", roles: ["facilitator", "admin"] },
        { name: "Content Manager", path: "/content-manager", roles: ["admin"] },
        { name: "Add Users", path: "/add-users", roles: ["admin"] },
        { name: "Prompt Playground", path: "/prompt-playground", roles: ["admin"] },
        { name: "Users Data", path: "/users-data", roles: ["admin"] },
        { name: "Purchase Course", path: "/purchase-course", roles: ["facilitator", "admin"] },
        { name: "Whatsapp Logs", path: "/whatsapp-logs", roles: ["facilitator", "admin"] },
    ];

    // Filter menu items based on the user's role
    const filteredMenuItems = menuItems.filter(item => item.roles.includes(role));

    return (
        <div className={styles.sidebar}>
            <ul className={styles.menu}>
                {filteredMenuItems.map((item, index) => (
                    <li key={index} className={location.pathname.includes(item.path) ? styles.active : styles.not_active}>
                        <Link to={item.path} className={styles.menu_item}>
                            <p className={location.pathname.includes(item.path) ? styles.active : styles.not_active}>{item.name}</p>
                            <img src={greater_arrow} alt="greater_arrow" className={styles.arrow} />
                        </Link>
                    </li>
                ))}
            </ul>
            <div onClick={handleLogout} className={styles.logout}>Logout</div>
        </div>
    );
};

export default Sidebar;
