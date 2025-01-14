const API_URL = process.env.REACT_APP_API_URL;
const PROD_API_URL = "https://beaj-backend-prod.azurewebsites.net/api";

// Function to get the stored JWT token
const getToken = () => {
    return localStorage.getItem('token');
};

// Function to create headers with the JWT token
const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
};

// AUTH
// API call to login a user
export const loginBeajEmployee = async ({ email, password }) => {
    const response = await fetch(`${API_URL}/beajEmployees/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// CATEGORY
// API call to create a category
export const createCategory = async (courseCategoryName, file, categorySequenceNum) => {
    const formData = new FormData();
    formData.append('courseCategoryName', courseCategoryName);
    formData.append('file', file);
    formData.append('categorySequenceNum', categorySequenceNum);

    const response = await fetch(`${API_URL}/courseCategory/create`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get all categories
export const getAllCategories = async () => {
    const response = await fetch(`${API_URL}/courseCategory/getAll`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get a category by ID
export const getCategoryById = async (categoryId) => {
    const response = await fetch(`${API_URL}/courseCategory/getById/${categoryId}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to update a category
export const updateCategory = async (categoryId, courseCategoryName, file, categorySequenceNum) => {
    const formData = new FormData();
    formData.append('courseCategoryName', courseCategoryName);
    formData.append('file', file);
    formData.append('categorySequenceNum', categorySequenceNum);

    const response = await fetch(`${API_URL}/courseCategory/update/${categoryId}`, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to delete a category
export const deleteCategory = async (categoryId) => {
    const response = await fetch(`${API_URL}/courseCategory/delete/${categoryId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// COURSE
// API call to create a course
export const createCourse = async (courseName, coursePrice, courseWeeks, courseCategoryId, status, sequenceNumber, courseDescription, courseStartDate) => {
    const response = await fetch(`${API_URL}/course/create`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ courseName, coursePrice, courseWeeks, courseCategoryId, status, sequenceNumber, courseDescription, courseStartDate }),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get all courses
export const getAllCourses = async () => {
    const response = await fetch(`${API_URL}/course/getAll`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get all courses from production
export const getAllCoursesfromProduction = async () => {
    const response = await fetch(`${PROD_API_URL}/course/getAll`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get a course by ID
export const getCourseById = async (courseId) => {
    const response = await fetch(`${API_URL}/course/getById/${courseId}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to update a course
export const updateCourse = async (courseId, courseName, coursePrice, courseWeeks, courseCategoryId, courseStatus, sequenceNumber, courseDescription, courseStartDate) => {
    const response = await fetch(`${API_URL}/course/update/${courseId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ courseName, coursePrice, courseWeeks, courseCategoryId, courseStatus, sequenceNumber, courseDescription, courseStartDate }),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to delete a course
export const deleteCourse = async (courseId) => {
    const response = await fetch(`${API_URL}/course/delete/${courseId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// API call to get all courses by category ID
export const getCoursesByCategoryId = async (categoryId) => {
    const response = await fetch(`${API_URL}/course/getByCourseCategoryId/${categoryId}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to duplicate a course
export const duplicateCourse = async (courseId) => {
    const response = await fetch(`${API_URL}/course/duplicateCourse`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ courseId }),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// COURSE WEEK
// API call to create a course week
export const createCourseWeek = async (weekNumber, image, description, courseId) => {
    const formData = new FormData();
    formData.append('weekNumber', weekNumber);
    formData.append('file', image);
    formData.append('description', description);
    formData.append('courseId', courseId);

    const response = await fetch(`${API_URL}/courseWeek/create`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get all course weeks
export const getAllCourseWeeks = async () => {
    const response = await fetch(`${API_URL}/courseWeek/getAll`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get a course week by ID
export const getCourseWeekById = async (courseWeekId) => {
    const response = await fetch(`${API_URL}/courseWeek/getById/${courseWeekId}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to update a course week
export const updateCourseWeek = async (courseWeekId, weekNumber, image, description, courseId) => {
    const formData = new FormData();
    formData.append('weekNumber', weekNumber);
    formData.append('file', image);
    formData.append('description', description);
    formData.append('courseId', courseId);

    const response = await fetch(`${API_URL}/courseWeek/update/${courseWeekId}`, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to delete a course week
export const deleteCourseWeek = async (courseWeekId) => {
    const response = await fetch(`${API_URL}/courseWeek/delete/${courseWeekId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// ACTIVITY ALIAS
// API call to create an activity alias
export const createActivityAlias = async (alias) => {
    const response = await fetch(`${API_URL}/alias/create`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ alias }),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get all activity aliases
export const getAllActivityAliases = async () => {
    const response = await fetch(`${API_URL}/alias/getAll`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get an activity alias by ID
export const getActivityAliasById = async (aliasId) => {
    const response = await fetch(`${API_URL}/alias/getById/${aliasId}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to update an activity alias
export const updateActivityAlias = async (aliasId, alias) => {
    const response = await fetch(`${API_URL}/alias/update/${aliasId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ alias }),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to delete an activity alias
export const deleteActivityAlias = async (aliasId) => {
    const response = await fetch(`${API_URL}/alias/delete/${aliasId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// CONSTANT
// API call to create a constant
export const createConstant = async (key, constantValue, category) => {
    const formData = new FormData();
    formData.append('key', key);
    formData.append('category', category);
    if (typeof constantValue === 'object') {
        formData.append('file', constantValue);
    } else {
        formData.append('constantValue', constantValue);
    }

    const response = await fetch(`${API_URL}/waConstants/create`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get all constants
export const getAllConstants = async () => {
    const response = await fetch(`${API_URL}/waConstants/getAll`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get a constant by ID
export const getConstantById = async (key) => {
    const response = await fetch(`${API_URL}/waConstants/getByKey/${key}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to update a constant
export const updateConstant = async (key, constantValue, category) => {
    const formData = new FormData();

    formData.append('key', key);
    formData.append('category', category);
    if (typeof constantValue === 'object') {
        formData.append('file', constantValue);
    } else {
        formData.append('constantValue', constantValue);
    }

    const response = await fetch(`${API_URL}/waConstants/update/${key}`, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to delete a constant
export const deleteConstant = async (key) => {
    const response = await fetch(`${API_URL}/waConstants/delete/${key}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// LESSON
// API call to create a lesson
export const createLesson = async (lessonType, dayNumber, activity, activityAlias, weekNumber, text, courseId, sequenceNumber, status) => {
    const response = await fetch(`${API_URL}/lesson/create`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ lessonType, dayNumber, activity, activityAlias, weekNumber, text, courseId, sequenceNumber, status }),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get all lessons
export const getAllLessons = async () => {
    const response = await fetch(`${API_URL}/lesson/getAll`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get a lesson by ID
export const getLessonById = async (lessonId) => {
    const response = await fetch(`${API_URL}/lesson/getById/${lessonId}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to update a lesson
export const updateLesson = async (lessonId, lessonType, dayNumber, activity, activityAlias, weekNumber, text, courseId, sequenceNumber, status) => {
    const response = await fetch(`${API_URL}/lesson/update/${lessonId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ lessonType, dayNumber, activity, activityAlias, weekNumber, text, courseId, sequenceNumber, status }),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to delete a lesson
export const deleteLesson = async (lessonId) => {
    const response = await fetch(`${API_URL}/lesson/delete/${lessonId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get lessons by activity
export const getLessonsByActivity = async (course, activity) => {
    const response = await fetch(`${API_URL}/lesson/getLessonsByActivity`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ course, activity }),
    });
    const data = await response.json();
    return { status: response.status, data };
};

// API call to migrate lesson
export const migrateLesson = async (lessonId, courseId) => {
    const response = await fetch(`${API_URL}/lesson/migrateLesson`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ lessonId, courseId }),
    });
    const data = await response.json();
    return { status: response.status, data };
};

// API call to get all lessons by course
export const getLessonsByCourse = async (courseId) => {
    const response = await fetch(`${API_URL}/lesson/getByCourseId/${courseId}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// DOCUMENT FILES
// API call to upload a document file
export const uploadDocumentFile = async (file, lessonId, language, mediaType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lessonId', lessonId);
    formData.append('language', language);
    formData.append('mediaType', mediaType);

    const response = await fetch(`${API_URL}/documentFiles/create`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get all document files
export const getAllDocumentFiles = async () => {
    const response = await fetch(`${API_URL}/documentFiles/getAll`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get a document file by ID
export const getDocumentFileById = async (documentFileId) => {
    const response = await fetch(`${API_URL}/documentFiles/getById/${documentFileId}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to update a document file
export const updateDocumentFile = async (documentFileId, file, lessonId, language, mediaType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lessonId', lessonId);
    formData.append('language', language);
    formData.append('mediaType', mediaType);

    const response = await fetch(`${API_URL}/documentFiles/update/${documentFileId}`, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};


// SPEAK ACTIVITY QUESTIONS
// API call to create a speak activity question
export const createSpeakActivityQuestion = async (question, file, answer, lessonId, questionNumber, activityType) => {
    const formData = new FormData();
    formData.append('question', question);
    formData.append('file', file);
    formData.append('answer', answer);
    formData.append('lessonId', lessonId);
    formData.append('questionNumber', questionNumber);
    formData.append('activityType', activityType);

    const response = await fetch(`${API_URL}/speakActivityQuestion/create`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get all speak activity questions
export const getAllSpeakActivityQuestions = async () => {
    const response = await fetch(`${API_URL}/speakActivityQuestion/getAll`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get a speak activity question by ID
export const getSpeakActivityQuestionById = async (speakActivityQuestionId) => {
    const response = await fetch(`${API_URL}/speakActivityQuestion/getById/${speakActivityQuestionId}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to update a speak activity question
export const updateSpeakActivityQuestion = async (speakActivityQuestionId, question, file, answer, lessonId, questionNumber) => {
    const formData = new FormData();
    formData.append('question', question);
    formData.append('file', file);
    formData.append('answer', answer);
    formData.append('lessonId', lessonId);
    formData.append('questionNumber', questionNumber);

    const response = await fetch(`${API_URL}/speakActivityQuestion/update/${speakActivityQuestionId}`, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to delete a speak activity question
export const deleteSpeakActivityQuestion = async (speakActivityQuestionId) => {
    const response = await fetch(`${API_URL}/speakActivityQuestion/delete/${speakActivityQuestionId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// Multiple Choice Question
// API call to create a Multiple Choice Question
export const createMultipleChoiceQuestion = async (file, image, questionType, questionText, questionNumber, lessonId, optionsType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image', image);
    formData.append('questionType', questionType);
    formData.append('questionText', questionText);
    formData.append('questionNumber', questionNumber);
    formData.append('lessonId', lessonId);
    formData.append('optionsType', optionsType);

    const response = await fetch(`${API_URL}/multipleChoiceQuestion/create`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get all Multiple Choice Questions
export const getAllMultipleChoiceQuestions = async () => {
    const response = await fetch(`${API_URL}/multipleChoiceQuestion/getAll`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get a Multiple Choice Question by ID
export const getMultipleChoiceQuestionById = async (multipleChoiceQuestionId) => {
    const response = await fetch(`${API_URL}/multipleChoiceQuestion/getById/${multipleChoiceQuestionId}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to update a Multiple Choice Question
export const updateMultipleChoiceQuestion = async (multipleChoiceQuestionId, file, image, questionType, questionText, questionNumber, lessonId, optionsType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image', image);
    formData.append('questionType', questionType);
    formData.append('questionText', questionText);
    formData.append('questionNumber', questionNumber);
    formData.append('lessonId', lessonId);
    formData.append('optionsType', optionsType);

    const response = await fetch(`${API_URL}/multipleChoiceQuestion/update/${multipleChoiceQuestionId}`, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to delete a Multiple Choice Question
export const deleteMultipleChoiceQuestion = async (multipleChoiceQuestionId) => {
    const response = await fetch(`${API_URL}/multipleChoiceQuestion/delete/${multipleChoiceQuestionId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// Multiple Choice Question Answers
// API call to create a Multiple Choice Question Answer
export const createMultipleChoiceQuestionAnswer = async (answerText, file, image, isCorrect, multipleChoiceQuestionId, sequenceNumber) => {
    const formData = new FormData();
    formData.append('answerText', answerText);
    formData.append('file', file);
    formData.append('image', image);
    formData.append('isCorrect', isCorrect);
    formData.append('multipleChoiceQuestionId', multipleChoiceQuestionId);
    formData.append('sequenceNumber', sequenceNumber);
    const response = await fetch(`${API_URL}/multipleChoiceQuestionAnswer/create`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get all Multiple Choice Question Answers
export const getAllMultipleChoiceQuestionAnswers = async () => {
    const response = await fetch(`${API_URL}/multipleChoiceQuestionAnswer/getAll`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to get a Multiple Choice Question Answer by ID
export const getMultipleChoiceQuestionAnswerById = async (multipleChoiceQuestionAnswerId) => {
    const response = await fetch(`${API_URL}/multipleChoiceQuestionAnswer/getById/${multipleChoiceQuestionAnswerId}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to update a Multiple Choice Question Answer
export const updateMultipleChoiceQuestionAnswer = async (multipleChoiceQuestionAnswerId, answerText, file, image, isCorrect, multipleChoiceQuestionId, sequenceNumber) => {
    const formData = new FormData();
    formData.append('answerText', answerText);
    formData.append('file', file);
    formData.append('image', image);
    formData.append('isCorrect', isCorrect);
    formData.append('multipleChoiceQuestionId', multipleChoiceQuestionId);
    formData.append('sequenceNumber', sequenceNumber);

    const response = await fetch(`${API_URL}/multipleChoiceQuestionAnswer/update/${multipleChoiceQuestionAnswerId}`, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to delete a Multiple Choice Question Answer
export const deleteMultipleChoiceQuestionAnswer = async (multipleChoiceQuestionAnswerId) => {
    const response = await fetch(`${API_URL}/multipleChoiceQuestionAnswer/delete/${multipleChoiceQuestionAnswerId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// Audio Chat
// API call to get all audio chats
export const getAllAudioChatLogs = async () => {
    const response = await fetch(`${API_URL}/audioChat/getallfeedback`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// API call to create a chatbot log
export const createAudioChatLog = async (userAudio, prompt) => {
    const formData = new FormData();
    formData.append('file', userAudio);
    formData.append('prompt', prompt);

    const response = await fetch(`${API_URL}/audioChat/feedback`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
    });

    const data = await response.json();
    return { status: response.status, data };
};



// METADATA
// GET  api/waUserMetaData/getAll
export const getAllMetadata = async () => {
    const response = await fetch(`${API_URL}/waUserMetaData/getAll`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// GET api/waUserMetaData/getByPhoneNumber/:phoneNumber
export const getMetadataByPhoneNumber = async (phoneNumber) => {
    const response = await fetch(`${API_URL}/waUserMetaData/getByPhoneNumber/${phoneNumber}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

export const assignTargetGroup = async (phoneNumber, targetGroup) => {
    const response = await fetch(`${API_URL}/waUserMetaData/assignTargetGroup`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ phoneNumber, targetGroup }),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// ACTIVITY LOGS
// GET  api/waUserActivityLogs/getAll
export const getAllActivityLogs = async () => {
    const response = await fetch(`${API_URL}/waUserActivityLogs/getAll`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// GET api/waUserActivityLogs/getByPhoneNumber/:phoneNumber
export const getActivityLogsByPhoneNumber = async (phoneNumber, page = 1, pageSize = 15) => {
    const response = await fetch(`${API_URL}/waUserActivityLogs/getByPhoneNumber/${phoneNumber}?page=${page}&pageSize=${pageSize}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// PURCHASED COURSES
// GET api/waPurchasedCourses/getAllCoursesByPhoneNumber
export const getAllCoursesByPhoneNumber = async (phoneNumber) => {
    const response = await fetch(`${API_URL}/waPurchasedCourses/getAllCoursesByPhoneNumber/${phoneNumber}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// GET api/waPurchasedCourses/getPurchasedCoursesByPhoneNumber
export const getPurchasedCoursesByPhoneNumber = async (phoneNumber) => {
    const response = await fetch(`${API_URL}/waPurchasedCourses/getPurchasedCoursesByPhoneNumber/${phoneNumber}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// GET api/waPurchasedCourses/getUnpurchasedCoursesByPhoneNumber
export const getUnpurchasedCoursesByPhoneNumber = async (phoneNumber) => {
    const response = await fetch(`${API_URL}/waPurchasedCourses/getUnpurchasedCoursesByPhoneNumber/${phoneNumber}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
}

// POST api/waPurchasedCourses/purchaseCourse
export const purchaseCourse = async (phoneNumber, courseId) => {
    const response = await fetch(`${API_URL}/waPurchasedCourses/purchaseCourse`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ phoneNumber, courseId }),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// COMPLETED COURSES
// GET api/waPurchasedCourses/getCompletedCourses
export const getCompletedCourses = async (phoneNumber) => {
    const response = await fetch(`${API_URL}/waPurchasedCourses/getCompletedCourses/${phoneNumber}`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// STATS
// GET api/stats/dashboardCardsFunnel
export const getDashboardCardsFunnel = async () => {
    const response = await fetch(`${API_URL}/stats/dashboardCardsFunnel`, {
        headers: getHeaders(),
    });

    const data = await response.json();
    return { status: response.status, data };
};

// POST api/stats/lastActiveUsers
export const getLastActiveUsers = async (days, cohorts) => {
    const response = await fetch(`${API_URL}/stats/lastActiveUsers`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ days, cohorts }),
    });

    const data = await response.json();
    return { status: response.status, data };
};


// ADD USERS
// POST api/chatbot/upload-user-data
export const uploadUserData = async (users) => {
    const response = await fetch(`${API_URL}/chatbot/upload-user-data`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ users }),
    });

    const data = await response.json();
    return { status: response.status, data };
};
