import { createLesson, uploadDocumentFile, createSpeakActivityQuestion, createMultipleChoiceQuestion, createMultipleChoiceQuestionAnswer } from "../helper";
export const createAudioLesson = async (course, sequenceNumber, alias, activityType, image, audio, lessonText, day, week) => {
    if (!image) {
        alert('Please upload an image');
        return;
    }
    if (!audio) {
        alert('Please upload an audio');
        return;
    }
    if (!sequenceNumber) {
        alert('Please enter a sequence number');
        return;
    }
    const lessonType = "week";

    const response = await createLesson(lessonType, day, activityType, alias, week, lessonText, course, sequenceNumber);
    const lessonId = response.data.lesson.LessonId;

    const [imageResponse, audioResponse] = await Promise.all([
        uploadDocumentFile(image, lessonId, "image", "image"),
        uploadDocumentFile(audio, lessonId, "English", "audio")
    ]);

    if (imageResponse.status === 200 && audioResponse.status === 200 && response.status === 200) {
        alert('Lesson created successfully');
    } else {
        alert('Error creating lesson');
    }
};

export const createVideoLesson = async (course, sequenceNumber, alias, activityType, video, lessonText, day, week) => {
    if (!video) {
        alert('Please upload an audio');
        return;
    }
    if (!sequenceNumber) {
        alert('Please enter a sequence number');
        return;
    }
    const lessonType = "week";

    const response = await createLesson(lessonType, day, activityType, alias, week, lessonText, course, sequenceNumber);
    const lessonId = response.data.lesson.LessonId;

    const videoResponse = await uploadDocumentFile(video, lessonId, "English", "video");

    if (videoResponse.status === 200 && response.status === 200) {
        alert('Lesson created successfully');
    } else {
        alert('Error creating lesson');
    }
};

export const createReadLesson = async (course, sequenceNumber, alias, activityType, image, audio, urduAudio, lessonText, day, week) => {
    if (!image) {
        alert('Please upload an image');
        return;
    }
    if (!audio) {
        alert('Please upload an audio');
        return;
    }
    if (!urduAudio) {
        alert('Please upload an Urdu audio');
        return;
    }
    if (!sequenceNumber) {
        alert('Please enter a sequence number');
        return;
    }
    const lessonType = "week";

    const response = await createLesson(lessonType, day, activityType, alias, week, lessonText, course, sequenceNumber);
    const lessonId = response.data.lesson.LessonId;

    const [imageResponse, audioResponse, urduAudioResponse] = await Promise.all([
        uploadDocumentFile(image, lessonId, "image", "image"),
        uploadDocumentFile(audio, lessonId, "English", "audio"),
        uploadDocumentFile(urduAudio, lessonId, "Urdu", "audio")
    ]);

    if (imageResponse.status === 200 && audioResponse.status === 200 && urduAudioResponse.status === 200 && response.status === 200) {
        alert('Lesson created successfully');
    } else {
        alert('Error creating lesson');
    }
};

export const createListenAndSpeakLesson = async (course, sequenceNumber, alias, activityType, questions, lessonText, day, week) => {
    if (!questions) {
        alert('Please upload questions');
        return;
    }
    if (!sequenceNumber) {
        alert('Please enter a sequence number');
        return;
    }
    const lessonType = "week";

    const response = await createLesson(lessonType, day, activityType, alias, week, lessonText, course, sequenceNumber);
    const answersArray = questions.map(question => question.answers.map(answer => answer.answerText));
    const lessonId = response.data.lesson.LessonId;
    const questionResponses = await Promise.all(
        questions.map((question, index) =>
            createSpeakActivityQuestion(
                question.questionText,
                question.audio,
                answersArray[index],
                lessonId,
                (index + 1).toString()
            )
        )
    );

    if (questionResponses.every(response => response.status === 200) && response.status === 200) {
        alert('Lesson created successfully');
    } else {
        alert('Error creating lesson');
    }
}

export const createMCQLesson = async (course, sequenceNumber, alias, activityType, mcqs, lessonText, day, week) => {
    if (!mcqs) {
        alert('Please upload questions');
        return;
    }
    if (!sequenceNumber) {
        alert('Please enter a sequence number');
        return;
    }
    const lessonType = "week";

    const response = await createLesson(lessonType, day, activityType, alias, week, lessonText, course, sequenceNumber);
    const lessonId = response.data.lesson.LessonId;

    for (let i = 0; i < mcqs.length; i++) {
        const answerTextArray = mcqs[i].answers.map(answer => answer.answerText);
        const answerTypeArray = mcqs[i].answers.map(answer => answer.answerType);
        const answerAudioArray = mcqs[i].answers.map(answer => answer.audio);
        const answerImageArray = mcqs[i].answers.map(answer => answer.image);
        const isCorrectArray = mcqs[i].answers.map(answer => answer.isCorrect);
        const questionAudio = mcqs[i].questionAudio;
        const questionImage = mcqs[i].questionImage;
        const questionType = mcqs[i].questionType;
        const questionNumber = (i + 1).toString();

        let questionText = mcqs[i].questionText;
        if (questionText === "") {
            questionText = null;
        }

        const questionResponse = await createMultipleChoiceQuestion(
            questionAudio,
            questionImage,
            questionType,
            questionText,
            questionNumber,
            lessonId,
            answerTypeArray[i]
        );

        const questionId = await questionResponse.data.mcq.Id;

        const answerResponses = await Promise.all(
            answerTextArray.map((answer, index) =>
                createMultipleChoiceQuestionAnswer(
                    answerTextArray[index],
                    answerAudioArray[index],
                    answerImageArray[index],
                    isCorrectArray[index],
                    questionId,
                    (index + 1).toString()
                )
            )
        );

        if (answerResponses.every(response => response.status === 200) && questionResponse.status === 200) {
            alert('Lesson created successfully');
        } else {
            alert('Error creating lesson');
        }

    }
}