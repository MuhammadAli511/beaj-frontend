import { Navbar, Sidebar } from "../../components"
import styles from './UserData.module.css'
import { useSidebar } from "../../components/SidebarContext"

const UserData = () => {
    const { isSidebarOpen } = useSidebar();
    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <h1>User Data</h1>
            </div>
        </div>
    )
}

export default UserData;