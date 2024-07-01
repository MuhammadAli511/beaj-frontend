import { Navbar, Sidebar } from "../../components"
import styles from './UserData.module.css'

const UserData = () => {
    return (
        <div className={styles.main_page}>
            <Navbar />
            <Sidebar />
            <div className={styles.content}>
                <h1>User Data</h1>
            </div>
        </div>
    )
}

export default UserData;