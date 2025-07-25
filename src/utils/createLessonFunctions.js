import { createLesson, uploadDocumentFile, createSpeakActivityQuestion, createMultipleChoiceQuestion, createMultipleChoiceQuestionAnswer } from "../helper";
export const createAudioLesson = async (course, sequenceNumber, alias, activityType, image, audio, lessonText, day, week, status, textInstruction = null, audioInstruction = null) => {
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

    const response = await createLesson(lessonType, day, activityType, alias, week, lessonText, course, sequenceNumber, status, textInstruction, audioInstruction);
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


export const createVideoLesson = async (course, sequenceNumber, alias, activityType, video, lessonText, day, week, status, textInstruction = null, audioInstruction = null) => {
    if (!video) {
        alert('Please upload a audio');
        return;
    }
    if (!sequenceNumber) {
        alert('Please enter a sequence number');
        return;
    }
    const lessonType = "week";

    const response = await createLesson(lessonType, day, activityType, alias, week, lessonText, course, sequenceNumber, status, textInstruction, audioInstruction);
    const lessonId = response.data.lesson.LessonId;

    const videoResponse = await uploadDocumentFile(video, lessonId, "English", "video");

    if (videoResponse.status === 200 && response.status === 200) {
        alert('Lesson created successfully');
    } else {
        alert('Error creating lesson');
    }
};


export const createReadLesson = async (course, sequenceNumber, alias, activityType, video, lessonText, day, week, status, textInstruction = null, audioInstruction = null) => {
    if (!video) {
        alert('Please upload a video');
        return;
    }
    if (!sequenceNumber) {
        alert('Please enter a sequence number');
        return;
    }
    const lessonType = "week";

    const response = await createLesson(lessonType, day, activityType, alias, week, lessonText, course, sequenceNumber, status, textInstruction, audioInstruction);
    const lessonId = response.data.lesson.LessonId;

    const videoResponse = await uploadDocumentFile(video, lessonId, "English", "video");

    if (videoResponse.status === 200 && response.status === 200) {
        alert('Lesson created successfully');
    } else {
        alert('Error creating lesson');
    }
};


export const createListenAndSpeakLesson = async (course, sequenceNumber, alias, activityType, questions, lessonText, day, week, status, textInstruction = null, audioInstruction = null) => {
    if (!questions) {
        alert('Please upload questions');
        return;
    }
    if (!sequenceNumber) {
        alert('Please enter a sequence number');
        return;
    }
    const lessonType = "week";

    const response = await createLesson(lessonType, day, activityType, alias, week, lessonText, course, sequenceNumber, status, textInstruction, audioInstruction);
    const lessonId = response.data.lesson.LessonId;

    const questionResponses = await Promise.all(
        questions.map((question, index) => {
            // Construct answersArray specific to the current question
            const answersArray = question.answers
                .map(answer => `"${answer.answerText.replace(/"/g, '\\"')}"`)
                .join(",");

            return createSpeakActivityQuestion(
                question.questionText,
                question.media,
                null,
                answersArray,
                lessonId,
                question.questionNumber ? question.questionNumber.toString() : (index + 1).toString(),
                activityType,
                question.customFeedbackText || null,
                question.customFeedbackImage || null,
                question.customFeedbackAudio || null,
                question.difficultyLevel || null
            );
        })
    );

    if (questionResponses.every(response => response.status === 200) && response.status === 200) {
        alert('Lesson created successfully');
    } else {
        alert('Error creating lesson');
    }
};


export const createWatchAndSpeakLesson = async (course, sequenceNumber, alias, activityType, questions, lessonText, day, week, status, textInstruction = null, audioInstruction = null) => {
    if (!questions) {
        alert('Please upload questions');
        return;
    }
    if (!sequenceNumber) {
        alert('Please enter a sequence number');
        return;
    }
    const lessonType = "week";

    const response = await createLesson(lessonType, day, activityType, alias, week, lessonText, course, sequenceNumber, status, textInstruction, audioInstruction);
    const lessonId = response.data.lesson.LessonId;

    const questionResponses = await Promise.all(
        questions.map((question, index) => {
            // Construct answersArray specific to the current question
            let answersArray = null;
            if (activityType == 'watchAndSpeak' || activityType == 'assessmentWatchAndSpeak') {
                answersArray = question.answers
                    .map(answer => `"${answer.answerText.replace(/"/g, '\\"')}"`)
                    .join(",");
            }

            return createSpeakActivityQuestion(
                question.questionText,
                question.media,
                question.mediaSecond,
                answersArray,
                lessonId,
                question.questionNumber ? question.questionNumber.toString() : (index + 1).toString(),
                activityType,
                question.customFeedbackText || null,
                question.customFeedbackImage || null,
                question.customFeedbackAudio || null,
                question.difficultyLevel || null
            );
        })
    );

    if (questionResponses.every(response => response.status === 200) && response.status === 200) {
        alert('Lesson created successfully');
    } else {
        alert('Error creating lesson');
    }
};


export const createConversationalBotLesson = async (course, sequenceNumber, alias, activityType, questions, lessonText, day, week, status, textInstruction = null, audioInstruction = null) => {
    if (!questions) {
        alert('Please upload questions');
        return;
    }
    if (!sequenceNumber) {
        alert('Please enter a sequence number');
        return;
    }
    const lessonType = "week";

    const response = await createLesson(lessonType, day, activityType, alias, week, lessonText, course, sequenceNumber, status, textInstruction, audioInstruction);
    const lessonId = response.data.lesson.LessonId;

    if (activityType == "conversationalQuestionsBot") {
        const questionResponses = await Promise.all(
            questions.map((question, index) =>
                createSpeakActivityQuestion(
                    question.questionText,
                    null,
                    null,
                    null,
                    lessonId,
                    (index + 1).toString(),
                    activityType
                )
            )
        );

        if (questionResponses.every(response => response.status === 200) && response.status === 200) {
            alert('Lesson created successfully');
        } else {
            alert('Error creating lesson');
        }
    } else if (activityType == "conversationalMonologueBot") {
        const questionResponses = await Promise.all(
            questions.map((question, index) =>
                createSpeakActivityQuestion(
                    question.questionText,
                    question.video,
                    null,
                    null,
                    lessonId,
                    (index + 1).toString(),
                    activityType
                )
            )
        );

        if (questionResponses.every(response => response.status === 200) && response.status === 200) {
            alert('Lesson created successfully');
        } else {
            alert('Error creating lesson');
        }
    } else if (activityType == "conversationalAgencyBot") {
        const questionResponses = await Promise.all(
            questions.map((question, index) =>
                createSpeakActivityQuestion(
                    question.questionText,
                    null,
                    null,
                    null,
                    lessonId,
                    (index + 1).toString(),
                    activityType
                )
            )
        );

        if (questionResponses.every(response => response.status === 200) && response.status === 200) {
            alert('Lesson created successfully');
        } else {
            alert('Error creating lesson');
        }
    }

};


export const createSpeakingPracticeLesson = async (course, sequenceNumber, alias, activityType, questions, lessonText, day, week, status, textInstruction = null, audioInstruction = null) => {
    if (!questions) {
        alert('Please upload questions');
        return;
    }
    if (!sequenceNumber) {
        alert('Please enter a sequence number');
        return;
    }
    const lessonType = "week";

    const response = await createLesson(lessonType, day, activityType, alias, week, lessonText, course, sequenceNumber, status, textInstruction, audioInstruction);
    const lessonId = response.data.lesson.LessonId;

    const questionResponses = await Promise.all(
        questions.map((question, index) => {
            return createSpeakActivityQuestion(
                question.questionText,
                question.audio,
                null,
                null,
                lessonId,
                question.questionNumber ? question.questionNumber.toString() : (index + 1).toString(),
                activityType
            )
        })
    );

    if (questionResponses.every(response => response.status === 200) && response.status === 200) {
        alert('Lesson created successfully');
    } else {
        alert('Error creating lesson');
    }
};


export const createMCQLesson = async (course, sequenceNumber, alias, activityType, mcqs, lessonText, day, week, status, textInstruction = null, audioInstruction = null) => {
    if (!mcqs) {
        alert('Please upload questions');
        return;
    }
    if (!sequenceNumber) {
        alert('Please enter a sequence number');
        return;
    }
    const lessonType = "week";

    const response = await createLesson(lessonType, day, activityType, alias, week, lessonText, course, sequenceNumber, status, textInstruction, audioInstruction);
    const lessonId = response.data.lesson.LessonId;
    let answerResponses = [];

    for (let i = 0; i < mcqs.length; i++) {
        const answerTextArray = mcqs[i].answers.map(answer => answer.answerText);
        const answerTypeArray = mcqs[i].answers.map(answer => answer.answerType);
        const answerAudioArray = mcqs[i].answers.map(answer => answer.audio);
        const answerImageArray = mcqs[i].answers.map(answer => answer.image);
        const isCorrectArray = mcqs[i].answers.map(answer => answer.isCorrect);
        const customFeedbackTextArray = mcqs[i].answers.map(answer => answer.customFeedbackText);
        const customFeedbackImageArray = mcqs[i].answers.map(answer => answer.customFeedbackImage);
        const customFeedbackAudioArray = mcqs[i].answers.map(answer => answer.customFeedbackAudio);
        const questionAudio = mcqs[i].questionAudio;
        const questionImage = mcqs[i].questionImage;
        const questionVideo = mcqs[i].questionVideo;
        const questionType = mcqs[i].questionType;
        const questionNumber = (i + 1).toString();

        let questionText = mcqs[i].questionText;
        if (questionText === "") {
            questionText = null;
        }

        const questionResponse = await createMultipleChoiceQuestion(
            questionAudio,
            questionImage,
            questionVideo,
            questionType,
            questionText,
            questionNumber,
            lessonId,
            answerTypeArray[i]
        );

        const questionId = await questionResponse.data.mcq.Id;

        const currentAnswerResponses = await Promise.all(
            answerTextArray.map((answer, index) =>
                createMultipleChoiceQuestionAnswer(
                    answerTextArray[index],
                    answerAudioArray[index],
                    answerImageArray[index],
                    isCorrectArray[index],
                    questionId,
                    (index + 1).toString(),
                    customFeedbackTextArray[index],
                    customFeedbackImageArray[index],
                    customFeedbackAudioArray[index]
                )
            )
        );

        answerResponses.push(currentAnswerResponses);
    }

    if (answerResponses.every(response => response.every(answer => answer.status === 200)) && response.status === 200) {
        alert('Lesson created successfully');
    } else {
        alert('Error creating lesson');
    }
};