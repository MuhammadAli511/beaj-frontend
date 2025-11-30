import { useState } from "react"
import { Navbar, Sidebar } from "../../components"
import styles from './ContentManager.module.css'
import CreateCategory from "./Category/CreateCategory/CreateCategory"
import ManageCategory from "./Category/ManageCategory/ManageCategory"
import CreateCourse from "./Course/CreateCourse/CreateCourse"
import ManageCourse from "./Course/ManageCourse/ManageCourse"
import CreateCourseWeek from "./CourseWeek/CreateCourseWeek/CreateCourseWeek"
import ManageCourseWeek from "./CourseWeek/ManageCourseWeek/ManageCourseWeek"
import CreateLesson from "./Lesson/CreateLesson/CreateLesson"
import ManageLesson from "./Lesson/ManageLesson/ManageLesson"
import CreateAlias from "./Alias/CreateAlias/CreateAlias"
import ManageAlias from "./Alias/ManageAlias/ManageAlias"
import CreateConstant from "./Constant/CreateConstant/CreateConstant"
import ManageConstant from "./Constant/ManageConstant/ManageConstant"
import { useSidebar } from "../../components/SidebarContext"
import { secureStorage } from "../../utils/xssProtection"

const ContentManager = () => {
    const { isSidebarOpen } = useSidebar();
    const [mainTab, setMainTab] = useState('Manage');
    const [subTab, setSubTab] = useState('Lesson'); // Default to Lesson for all users
    
    // Get user role from secure storage
    const userRole = secureStorage.getItem('role');
    
    // Check if user is a lesson creator
    const isLessonCreator = userRole === 'kid-lesson-creator' || userRole === 'teacher-lesson-creator';
    
    // Define available sub-tabs based on role
    const getAvailableSubTabs = () => {
        if (isLessonCreator) {
            return ['Lesson']; // Only lesson functionality for lesson creators
        }
        return ['Category', 'Course', 'Weeks', 'Lesson', 'Alias', 'Constant']; // All functionality for admin
    };
    
    const renderContent = () => {
        if (mainTab === 'Manage') {
            if (subTab === 'Category' && !isLessonCreator) return <ManageCategory />;
            if (subTab === 'Course' && !isLessonCreator) return <ManageCourse />;
            if (subTab === 'Weeks' && !isLessonCreator) return <ManageCourseWeek />;
            if (subTab === 'Lesson') return <ManageLesson />;
            if (subTab === 'Alias' && !isLessonCreator) return <ManageAlias />;
            if (subTab === 'Constant' && !isLessonCreator) return <ManageConstant />;
        }
        if (mainTab === 'Create') {
            if (subTab === 'Category' && !isLessonCreator) return <CreateCategory />;
            if (subTab === 'Course' && !isLessonCreator) return <CreateCourse />;
            if (subTab === 'Weeks' && !isLessonCreator) return <CreateCourseWeek />;
            if (subTab === 'Lesson') return <CreateLesson />;
            if (subTab === 'Alias' && !isLessonCreator) return <CreateAlias />;
            if (subTab === 'Constant' && !isLessonCreator) return <CreateConstant />;
        }
    };

    const isActive = (tab) => mainTab === tab;
    const isSubActive = (sub) => subTab === sub;

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <div className={styles.tabs}>
                    <button className={isActive('Manage') ? styles.active : ''} onClick={() => setMainTab('Manage')}>Manage</button>
                    <button className={isActive('Create') ? styles.active : ''} onClick={() => setMainTab('Create')}>Create</button>
                </div>
                {['Manage', 'Create'].includes(mainTab) && (
                    <div className={styles.sub_tabs}>
                        {getAvailableSubTabs().map((tabName) => {
                            const displayName = tabName === 'Constant' ? 'Constants' : tabName;
                            return (
                                <button 
                                    key={tabName}
                                    className={isSubActive(tabName) ? styles.active : ''} 
                                    onClick={() => setSubTab(tabName)}
                                >
                                    {displayName}
                                </button>
                            );
                        })}
                    </div>
                )}
                {renderContent()}
            </div>
        </div>
    );
}

export default ContentManager;