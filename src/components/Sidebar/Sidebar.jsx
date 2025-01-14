import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import greater_arrow from '../../assets/images/greater_arrow.svg';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const role = localStorage.getItem('role');
    const [collapsedSections, setCollapsedSections] = useState({});

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        navigate("/");
    };

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Define menu sections with their items
    const menuSections = {
        Stats: [
            { name: "Dashboard", path: "/dashboard", roles: ["facilitator", "admin"] },
        ],
        Users: [
            { name: "Add Users", path: "/add-users", roles: ["admin"] },
            { name: "Users Data", path: "/users-data", roles: ["admin"] },
            { name: "Last Active Users", path: "/last-active-users", roles: ["admin"] },
            { name: "Whatsapp Logs", path: "/whatsapp-logs", roles: ["facilitator", "admin"] },
            { name: "Purchase Course", path: "/purchase-course", roles: ["facilitator", "admin"] },
        ],
        Content: [
            { name: "Content Manager", path: "/content-manager", roles: ["admin"] },
            { name: "Prompt Playground", path: "/prompt-playground", roles: ["admin"] },
        ],
    };

    // Filter menu items based on the user's role for each section
    const filteredMenuSections = Object.entries(menuSections).reduce((acc, [section, items]) => {
        const filteredItems = items.filter(item => item.roles.includes(role));
        if (filteredItems.length > 0) {
            acc[section] = filteredItems;
        }
        return acc;
    }, {});

    return (
        <div className={styles.sidebar}>
            <ul className={styles.menu}>
                {Object.entries(filteredMenuSections).map(([section, items]) => (
                    <React.Fragment key={section}>
                        <li 
                            className={styles.section_header} 
                            onClick={() => toggleSection(section)}
                        >
                            <div className={styles.section_header_content}>
                                <span>{section}</span>
                                <img 
                                    src={greater_arrow} 
                                    alt="toggle" 
                                    className={`${styles.toggle_arrow} ${collapsedSections[section] ? styles.collapsed : ''}`}
                                />
                            </div>
                        </li>
                        {!collapsedSections[section] && items.map((item, index) => (
                            <li key={index} className={location.pathname.includes(item.path) ? styles.active : styles.not_active}>
                                <Link to={item.path} className={styles.menu_item}>
                                    <p className={location.pathname.includes(item.path) ? styles.active : styles.not_active}>{item.name}</p>
                                    <img src={greater_arrow} alt="greater_arrow" className={styles.arrow} />
                                </Link>
                            </li>
                        ))}
                    </React.Fragment>
                ))}
            </ul>
            <div onClick={handleLogout} className={styles.logout}>Logout</div>
        </div>
    );
};

export default Sidebar;
