import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 10,
    },
    section: {
        marginBottom: 10,
    },
    table: {
        display: "table",
        width: "auto",
        margin: "10px 0",
        borderBottomWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'solid',
    },
    tableRow: {
        flexDirection: "row",
    },
    tableColHeader: {
        width: "8.75%",
        backgroundColor: "#e4e4e4",
        padding: 5,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'solid',
    },
    tableCol: {
        width: "8.75%",
        padding: 5,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'solid',
    },
    tableColHeaderLarge: {
        width: "15%",
        backgroundColor: "#e4e4e4",
        padding: 5,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'solid',
    },
    tableColLarge: {
        width: "15%",
        padding: 5,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'solid',
    },
    tableCellHeader: {
        margin: "auto",
        fontSize: 10,
        fontWeight: "bold",
    },
    tableCell: {
        margin: "auto",
        fontSize: 9,
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
    },
    summaryText: {
        fontSize: 12,
        marginBottom: 5,
    },
});

const ChatbotStatsPDF = ({ stats, totals }) => (
    <Document>
        <Page size="A3" style={styles.page}>
            <Text style={styles.title}>Course Chatbot Stats</Text>
            <View style={styles.section}>
                <Text style={styles.summaryText}>Total Users: {stats.length}</Text>
                <Text style={styles.summaryText}>Questions Attempted: {totals.totalQuestionsAttempted}</Text>
                <Text style={styles.summaryText}>Correct Answers: {totals.totalCorrectAnswers}</Text>
                <Text style={styles.summaryText}>Wrong Answers: {totals.totalWrongAnswers}</Text>
                <Text style={styles.summaryText}>Lessons Completed: {totals.totalLessonsCompleted}</Text>
            </View>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={styles.tableColHeaderLarge}>
                        <Text style={styles.tableCellHeader}>Phone Number</Text>
                    </View>
                    <View style={styles.tableColHeader}>
                        <Text style={styles.tableCellHeader}>Week</Text>
                    </View>
                    <View style={styles.tableColHeader}>
                        <Text style={styles.tableCellHeader}>Day</Text>
                    </View>
                    <View style={styles.tableColHeader}>
                        <Text style={styles.tableCellHeader}>Question No.</Text>
                    </View>
                    <View style={styles.tableColHeader}>
                        <Text style={styles.tableCellHeader}>Total Correct</Text>
                    </View>
                    <View style={styles.tableColHeader}>
                        <Text style={styles.tableCellHeader}>Total Wrong</Text>
                    </View>
                    <View style={styles.tableColHeader}>
                        <Text style={styles.tableCellHeader}>Total Questions</Text>
                    </View>
                    <View style={styles.tableColHeader}>
                        <Text style={styles.tableCellHeader}>Average</Text>
                    </View>
                    <View style={styles.tableColHeader}>
                        <Text style={styles.tableCellHeader}>Lessons Completed</Text>
                    </View>
                    <View style={styles.tableColHeaderLarge}>
                        <Text style={styles.tableCellHeader}>Last Updated</Text>
                    </View>
                </View>
                {stats.map((user, index) => (
                    <View key={index} style={styles.tableRow}>
                        <View style={styles.tableColLarge}>
                            <Text style={styles.tableCell}>{user.phone_number}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>{user.week}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>{user.day}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>{user.question_number}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>{user.totalCorrect}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>{user.totalWrong}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>{user.totalQuestions}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>{user.average}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>{user.lessonsCompleted}</Text>
                        </View>
                        <View style={styles.tableColLarge}>
                            <Text style={styles.tableCell}>{new Date(user.last_updated).toLocaleString()}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);

export default ChatbotStatsPDF;
