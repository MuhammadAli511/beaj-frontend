import { Navbar, Sidebar } from "../../components"
import styles from './BeajOperations.module.css'

const BeajOperations = () => {
    return (
        <div className={styles.main_page}>
            <Navbar />
            <Sidebar />
            <div className={styles.content}>
                <h1>Beaj Operations</h1>
            </div>
        </div>
    )
}

export default BeajOperations;