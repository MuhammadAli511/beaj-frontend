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

const ContentManager = () => {
    const { isSidebarOpen } = useSidebar();
    const [mainTab, setMainTab] = useState('Manage');
    const [subTab, setSubTab] = useState('Category');
    const renderContent = () => {
        if (mainTab === 'Manage') {
            if (subTab === 'Category') return <ManageCategory />;
            if (subTab === 'Course') return <ManageCourse />;
            if (subTab === 'Weeks') return <ManageCourseWeek />;
            if (subTab === 'Lesson') return <ManageLesson />;
            if (subTab === 'Alias') return <ManageAlias />;
            if (subTab === 'Constant') return <ManageConstant />;
        }
        if (mainTab === 'Create') {
            if (subTab === 'Category') return <CreateCategory />;
            if (subTab === 'Course') return <CreateCourse />;
            if (subTab === 'Weeks') return <CreateCourseWeek />;
            if (subTab === 'Lesson') return <CreateLesson />;
            if (subTab === 'Alias') return <CreateAlias />;
            if (subTab === 'Constant') return <CreateConstant />;
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
                        <button className={isSubActive('Category') ? styles.active : ''} onClick={() => setSubTab('Category')}>Category</button>
                        <button className={isSubActive('Course') ? styles.active : ''} onClick={() => setSubTab('Course')}>Course</button>
                        <button className={isSubActive('Weeks') ? styles.active : ''} onClick={() => setSubTab('Weeks')}>Weeks</button>
                        <button className={isSubActive('Lesson') ? styles.active : ''} onClick={() => setSubTab('Lesson')}>Lesson</button>
                        <button className={isSubActive('Alias') ? styles.active : ''} onClick={() => setSubTab('Alias')}>Alias</button>
                        <button className={isSubActive('Constant') ? styles.active : ''} onClick={() => setSubTab('Constant')}>Constants</button>
                    </div>
                )}
                {renderContent()}
            </div>
        </div>
    );
}

export default ContentManager;