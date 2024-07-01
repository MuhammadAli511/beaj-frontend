import { Navbar, Sidebar } from "../../components"
import styles from './Dashboard.module.css'

const Dashboard = () => {
    return (
        <div className={styles.main_page}>
            <Navbar />
            <Sidebar />
            <div className={styles.content}>
                <h1>Dashboard</h1>
            </div>
        </div>
    )
}

export default Dashboard;