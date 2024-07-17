import { Navbar, Sidebar } from "../../components"
import styles from './BeajOperations.module.css'
import { useSidebar } from "../../components/SidebarContext"

const BeajOperations = () => {
    const { isSidebarOpen } = useSidebar();
    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <h1>Beaj Operations</h1>
            </div>
        </div>
    )
}

export default BeajOperations;