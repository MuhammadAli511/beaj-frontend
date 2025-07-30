import { useState } from "react"
import { Navbar, Sidebar } from "../../components"
import styles from "./Analytics.module.css"
import { useSidebar } from "../../components/SidebarContext"
import StudentRegistrationAnalytics from "./StudentRegistrationAnalytics"
import StudentCourseAnalytics from "./StudentCourseAnalytics"

const Analytics = () => {
  const { isSidebarOpen } = useSidebar()
  const [activeTab, setActiveTab] = useState("analytics")

  return (
    <div className={styles.main_page}>
      <Navbar />
      {isSidebarOpen && <Sidebar />}
      <div className={styles.content}>
        <h1>Analytics</h1>
        
        <div className={styles.tabs}>
           <button
            className={`${styles.tab_button} ${activeTab === "analytics" ? styles.active_tab : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            Course Analytics
          </button>
          <button
            className={`${styles.tab_button} ${activeTab === "registration" ? styles.active_tab : ""}`}
            onClick={() => setActiveTab("registration")}
          >
            Student Registration Analytics
          </button>
        </div>
        <div className={styles.tab_content}>
          {activeTab === "registration" && <StudentRegistrationAnalytics />}
          {activeTab === "analytics" && <StudentCourseAnalytics />}
        </div>
      </div>
    </div>
  )
}

export default Analytics
