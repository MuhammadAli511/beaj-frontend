/**
 * Course Filter Constants
 * Contains course names and patterns to be excluded from various lists
 */

/**
 * Course names to exclude from lesson management
 * These are typically old, archived, or special courses
 */
export const EXCLUDED_COURSE_NAMES = [
    'Free Trial',
    'Level 3 - T1 - January 27, 2025',
    'Level 3 - T2 - January 27, 2025',
    'Level 1 - T1 - January 27, 2025',
    'Level 1 - T2 - January 27, 2025',
    'Level 2 - T1 - February 24, 2025',
    'Level 2 - T2 - February 24, 2025',
    'Level 3 - T1 - April 7, 2025',
    'Level 3 - T2 - April 7, 2025',
];

/**
 * Patterns to exclude courses by year or other criteria
 */
export const EXCLUDED_COURSE_PATTERNS = [
    '2024', // Exclude all 2024 courses
];

/**
 * Checks if a course should be excluded based on name
 * @param {string} courseName - The course name to check
 * @returns {boolean} - True if course should be excluded
 */
export const shouldExcludeCourse = (courseName) => {
    if (!courseName) return false;
    
    // Check exact matches
    if (EXCLUDED_COURSE_NAMES.includes(courseName)) {
        return true;
    }
    
    // Check patterns
    return EXCLUDED_COURSE_PATTERNS.some(pattern => 
        courseName.includes(pattern)
    );
};

/**
 * Filters and sorts courses based on exclusion rules
 * @param {Array} courses - Array of course objects
 * @returns {Array} - Filtered and sorted courses
 */
export const filterAndSortCourses = (courses) => {
    if (!Array.isArray(courses)) return [];
    
    return courses
        .filter(course => !shouldExcludeCourse(course.CourseName))
        .sort((a, b) => a.CourseName.localeCompare(b.CourseName));
};

/**
 * Category names for different user roles
 */
export const CATEGORY_NAMES = {
    KIDS: 'Chatbot Courses - Kids',
    TEACHERS: 'Chatbot Courses - Teachers',
};

/**
 * Filters categories based on user role
 * @param {Array} categories - Array of category objects
 * @param {string} userRole - User role (admin, kid-lesson-creator, teacher-lesson-creator)
 * @returns {Array} - Filtered categories
 */
export const filterCategoriesByRole = (categories, userRole) => {
    if (!Array.isArray(categories)) return [];
    
    if (userRole === 'kid-lesson-creator') {
        return categories.filter(category =>
            category.CourseCategoryName === CATEGORY_NAMES.KIDS
        );
    } else if (userRole === 'teacher-lesson-creator') {
        return categories.filter(category =>
            category.CourseCategoryName === CATEGORY_NAMES.TEACHERS
        );
    } else {
        // For admin and other roles, show categories with "Chatbot" in their name
        return categories.filter(category =>
            category.CourseCategoryName.includes('Chatbot')
        );
    }
};

