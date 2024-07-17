import { Navbar, Sidebar } from "../../components"
import styles from './Dashboard.module.css'
import { useSidebar } from "../../components/SidebarContext"

const Dashboard = () => {
    const { isSidebarOpen } = useSidebar();
    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <h1>Dashboard</h1>
            </div>
        </div>
    )
}

export default Dashboard;