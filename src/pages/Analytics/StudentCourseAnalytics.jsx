import { useState, useEffect } from "react"
import styles from "./Analytics.module.css" // Assuming this CSS file exists
import { getstudentAnalyticsStats, studentBarAnalyticsStats, getAnalyticsStats, studentCardAnalyticsStats } from "../../helper/index" // Assuming these helper functions exist and handle userType
import { TailSpin } from "react-loader-spinner"
import Select from "react-select"
import { Line, Bar } from "react-chartjs-2"
import ChartDataLabels from "chartjs-plugin-datalabels"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js"
import { use } from "react"

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
)

const LOCALSTORAGE_KEY = "right_sidebar_whatsapp_logs_session"

const StudentCourseAnalytics = () => {
  const [lastUpdatedGraph, setLastUpdatedGraph] = useState(null)

  // Main user type selection (Student/Teacher)
  const [userType, setUserType] = useState({ label: "Student", value: "student" })

  // Stats data state
  const [statsData, setStatsData] = useState({
    totalRegistrations: { count: 0, percentage: 0 },
    usersWithOneMessage: { count: 0, percentage: 0 },
    usersWhoStarted: { count: 0, percentage: 0 },
    startRateOfMessageSenders: { count: 0 },
    activeUser: { count: 0, percentage: 0 },
    totalRevenue: 0,
    avgRevenueB2B: 0,
    avgRevenueB2C: 0,
  })
  const [statsLoading, setStatsLoading] = useState(false)

  // Right sidebar states for clicked bar data
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [rightSidebarData, setRightSidebarData] = useState([])
  const [rightSidebarLoading, setRightSidebarLoading] = useState(false)
  const [rightSidebarTitle, setRightSidebarTitle] = useState("")
  const [clickedBarInfo, setClickedBarInfo] = useState(null)
  const [cohortName, setCohortName] = useState("")
  const [gradeName, setGradeName] = useState("")

  const defaultStudentGrade = { label: "Grade 1", value: "grade 1" }
  const defaultTeacherLevel = { label: "Level 1", value: "level 1" }
  const defaultCohort = { label: "All", value: "All" }
  const defaultAllGrade = { label: "Grade 6", value: "grade 6" }
  const defaultAllCohort = { label: "All", value: "All" }
  const defaultDay = { label: "Daily", value: "0 days" }
  const defaultGraph7Filter1 = { label: "Total Registered", value: "total_registered" }
  const defaultGraph7Filter2 = { label: "School", value: "school_name" }
  const defaultGraph8Filter = [
    { label: "B2B & B2C", value: "b2b_b2c" },
    // { label: "B2C", value: "b2c" },
  ]

  // Analytics specific states
  const [graphLoadingStates, setGraphLoadingStates] = useState({
    graph1: false,
    graph2: false,
    graph3: false,
    graph4: false,
    graph5: false,
    graph6: false,
    graph7: false,
    graph8: false,
  })

  const [analyticsData, setAnalyticsData] = useState({
    graph1: { labels: [], data: [] },
    graph2: { labels: [], data: [] },
    graph3: { labels: [], data: [] },
    graph4: { labels: [], data1: [], data2: [], data3: [] },
    graph5: { labels: [], data: [] },
    graph6: { labels: [], data: [] },
    graph7: { labels: [], data: [] },
    graph8: { labels: [], data: [] },
  })

  // State for total count and not started users for graph1 and graph2
  const [graphStats, setGraphStats] = useState({
    graph1: { totalCount: null, notStartedUsers: null, startedUsers: null, percentage: null, completed: null, completedPercentage: null },
    graph2: { totalCount: null, notStartedUsers: null, startedUsers: null, percentage: null, completed: null, completedPercentage: null },
    graph3: {
      totalCount: null,
      notStartedUsers: null,
      startedUsers: null,
      percentage: null,
      dailyCompletionRate: null,
    },
    graph4: { totalCount: null, notStartedUsers: null, startedUsers: null, percentage: null, completed: null },
    graph5: { totalCount: null, notStartedUsers: null, startedUsers: null, percentage: null, completed: null },
    graph6: { totalCount: null, notStartedUsers: null, startedUsers: null, percentage: null, completed: null },
    graph7: { totalCount: null, notStartedUsers: null, startedUsers: null, percentage: null },
    graph8: { totalCount: null, notStartedUsers: null, startedUsers: null, percentage: null },
  });

  const [cohortRanges, setCohortRanges] = useState({
    graph1: { start: 1, end: 18 },
    graph2: { start: 1, end: 18 },
    graph3: { start: 1, end: 18 },
    graph4: { start: 1, end: 18 },
    graph5: { start: 1, end: 18 },
    graph7: { start: 1, end: 18 },
    graph8: { start: 1, end: 18 },
  });

  const [courseIdMappings] = useState({
    "grade 1": 119,
    "grade 2": 120,
    "grade 3": 121,
    "grade 4": 122,
    "grade 5": 123,
    "grade 6": 124,
    "grade 7": 143,
  });

  const [teacherCourseIdMappings] = useState({
    "level 1": 134,
    "level 2": 135,
    "level 3": 136,
  });

  const [analyticsFilters, setAnalyticsFilters] = useState({
    graph1: { grade: defaultStudentGrade, cohort: defaultCohort },
    graph2: { grade: defaultStudentGrade, cohort: defaultCohort },
    graph3: { grade: defaultStudentGrade, cohort: defaultAllCohort },
    graph4: { grade: defaultAllGrade, cohort: defaultCohort },
    graph5: { grade: defaultStudentGrade, cohort: defaultCohort },
    graph6: { grade: defaultDay },
    graph7: { filter1: defaultGraph7Filter1, filter2: defaultGraph7Filter2 },
    graph8: { filter1: defaultGraph8Filter },
  })

  // User type options
  const userTypeOptions = [
    { value: "student", label: "Student" },
    { value: "teacher", label: "Teacher" },
  ]

  // Student Grade options
  const studentGradeOptions = [
    { value: "grade 1", label: "Grade 1" },
    { value: "grade 2", label: "Grade 2" },
    { value: "grade 3", label: "Grade 3" },
    { value: "grade 4", label: "Grade 4" },
    { value: "grade 5", label: "Grade 5" },
    { value: "grade 6", label: "Grade 6" },
    { value: "grade 7", label: "Grade 7" },
  ]

  // Teacher Level options
  const teacherLevelOptions = [
    { value: "level 1", label: "Level 1" },
    { value: "level 2", label: "Level 2" },
    { value: "level 3", label: "Level 3" },
  ]

  // Graph 7 Filter 1 Options
  const graph7Filter1Options = [
    { value: "total_registered", label: "Total Registered" },
    { value: "total_who_sent_atleast_1_msg", label: "Total Users With One Message" },
    { value: "total_who_started", label: "Total Started Users" },
    { value: "b2b", label: "B2B" },
    { value: "b2c", label: "B2C" },
    { value: "paid", label: "Paid" },
    { value: "unpaid", label: "Unpaid" },
  ]

  // Graph 7 Filter 2 Options (dynamic based on filter1)
  const getGraph7Filter2Options = (filter1Value) => {
    const baseOptions = [
      { value: "district", label: "District" },
      { value: "school_name", label: "School" },
      { value: "source", label: "Customer Source" },
    ]

    // Add conditional options based on filter1
    if (!["b2b", "b2c"].includes(filter1Value)) {
      baseOptions.unshift({ value: "b2b_b2c", label: "B2B & B2C" })
    }

    if (!["paid", "unpaid"].includes(filter1Value)) {
      baseOptions.unshift({ value: "paid_unpaid", label: "Paid & Unpaid" })
    }

    return baseOptions;
  }

  // Graph 8 Filter Options
  const graph8FilterOptions = [
    { value: "b2b_b2c", label: "B2B & B2C" },
    { value: "district", label: "District" },
    { value: "school", label: "School" },
  ]

  // Dynamic filter options based on userType and graphType
  const getPrimaryFilterOptions = (graphType) => {
    if (graphType === "graph6") {
      // Graph 6 uses day filter, not grade/level
      return [
        { label: "Daily", value: "0 days" },
        { label: "Last 3 Days", value: "2 days" },
        { label: "Last 7 Days", value: "6 days" },
        { label: "Last 15 Days", value: "14 days" },
        { label: "Last 30 Days", value: "29 days" },
      ]
    }
    if (userType.value === "student") {
      if (graphType === "graph3") {
        return [{ value: "All", label: "All" }, ...studentGradeOptions]
      }
      // For graph1 and graph2, don't include "All" for teachers, but do for students
      return studentGradeOptions
    } else {
      if (graphType === "graph3") {
        return [{ value: "All", label: "All" }, ...teacherLevelOptions]
      }
      // For graph1 and graph2, don't include "All" for teachers
      return teacherLevelOptions
    }
  }

  // Handle phone number click in sidebar - save to localStorage and navigate
  const handlePhoneNumberClick = (phoneNumber, profileId, botType) => {
    saveToLocalStorage(phoneNumber, profileId, botType)
  }

  // LocalStorage functions
  const saveToLocalStorage = (phoneNumber, profileId, botType) => {
    const sessionData = {
      phoneNumber,
      profileId,
      botType,
      timestamp: Date.now(),
    }
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(sessionData))
  }

  // Dynamic cohort options based on userType and grade/level selection
  const getCohortOptions = (graphType) => {
    const options = []
    if (userType.value === "student") {
      const range = cohortRanges[graphType]
      if (!range || (range.start === 0 && range.end === 0)) {
        // For "All" grade in graph3, or if no specific range is set
        options.push({ value: "All", label: "All" })
      } else {
        options.push({ value: "All", label: "All" })
        for (let i = range.start; i <= range.end; i++) {
          options.push({ value: `Cohort ${i}`, label: `Cohort ${i}` })
        }
      }
    } else {
      // userType.value === "teacher"
      options.push({ value: "All", label: "All" })
      for (let i = 1; i <= 19; i++) {
        // Cohorts 1 to 19 for teachers
        options.push({ value: `Cohort ${i}`, label: `Cohort ${i}` })
      }
    }
    return options
  }

  // Handle user type change
  const handleUserTypeChange = (selectedUserType) => {
    setUserType(selectedUserType)
    // Reset filters to default for the new user type
    const newFilters = { ...analyticsFilters }
    for (const graphKey in newFilters) {
      if (graphKey === "graph6") {
        newFilters[graphKey] = { grade: defaultDay } // 'grade' here refers to the day filter
      }
      else if (graphKey === "graph7") {
        newFilters[graphKey] = { filter1: defaultGraph7Filter1, filter2: defaultGraph7Filter2 }
      } else if (graphKey === "graph8") {
        newFilters[graphKey] = { filter1: defaultGraph8Filter }
      } else {
        newFilters[graphKey] = {
          grade: selectedUserType.value === "student" ? defaultStudentGrade : defaultTeacherLevel,
          cohort: defaultCohort,
        }
      }
    }
    setAnalyticsFilters(newFilters)
    // Fetch stats and refresh all graphs when user type changes
    fetchStatsData(selectedUserType.value)
    fetchAllGraphsData(selectedUserType.value, newFilters)
  }

  // Fetch stats data
  const fetchStatsData = async (userTypeValue = userType.value) => {
    setStatsLoading(true)
    try {
      const response = await getAnalyticsStats(userTypeValue)
      if (response.status === 200 && response.data) {
        const [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12] = response.data.userstats[0]
        setStatsData({
          totalRegistrations: {
            count: r1 || 0,
            percentage: 100 || 0,
          },
          usersWithOneMessage: {
            count: r2 || 0,
            percentage: r3 || 0,
          },
          usersWhoStarted: {
            count: r4 || 0,
            percentage: r5 || 0,
          },
          startRateOfMessageSenders: {
            count: r6 || 0,
          },
          activeUser: {
            count: r11 || 0,
            percentage: r12 || 0,
          },
          totalRevenue: r8 || 0,
          avgRevenueB2B: r9 || 0,
          avgRevenueB2C: r10 || 0,
        })
      }
    } catch (error) {
      console.error("Error fetching stats data:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  // Update cohort range when grade/level is selected
  const updateCohortRange = (graphType, primaryFilterValue) => {
    let newRange = { start: 1, end: 18 } // Default for students
    if (userType.value === "student") {
      switch (primaryFilterValue) {
        case "grade 1":
        case "grade 2":
        case "grade 3":
          newRange = { start: 1, end: 5 }
          break
        case "grade 4":
          newRange = { start: 1, end: 6 }
          break
        case "grade 5":
          newRange = { start: 1, end: 4 }
          break
        case "grade 6":
          newRange = { start: 1, end: 8 }
          break
        case "grade 7":
          newRange = { start: 1, end: 18 }
          break
        default:
          newRange = { start: 0, end: 0 } // For "All" grade
          break
      }
    } else {
      // userType.value === "teacher"
      newRange = { start: 1, end: 19 } // Cohorts 1 to 19 for teachers
    }
    setCohortRanges((prev) => ({
      ...prev,
      [graphType]: newRange,
    }))
  }

  const getCourseId = (primaryFilterValue) => {
    if (userType.value === "student") {
      return courseIdMappings[primaryFilterValue] || null
    } else {
      // userType.value === "teacher"
      return teacherCourseIdMappings[primaryFilterValue] || null
    }
  }

  // Handle grade/level filter change
  const handlePrimaryFilterChange = (graphType, selectedFilter) => {
    setLastUpdatedGraph(graphType)
    let newCohort = null
    // For graph3, if "All" is selected for grade, set cohort to "All" as well
    if (graphType === "graph3" && selectedFilter?.value === "All") {
      newCohort = { label: "All", value: "All" }
    } else if (userType.value === "teacher") {
      // For teachers, default cohort to "All" when level changes
      newCohort = { label: "All", value: "All" }
    }

    setAnalyticsFilters((prev) => ({
      ...prev,
      [graphType]: {
        ...prev[graphType],
        grade: selectedFilter, // 'grade' property now holds grade or level or day filter
        cohort: newCohort || prev[graphType].cohort, // Keep existing cohort if not explicitly changed
      },
    }))

    if (selectedFilter && selectedFilter.value !== "All" && graphType !== "graph6") {
      updateCohortRange(graphType, selectedFilter.value)
    } else if (graphType !== "graph6") {
      // If "All" is selected or filter is cleared for non-graph6
      setCohortRanges((prev) => ({
        ...prev,
        [graphType]: { start: 0, end: 0 },
      }))
    }
  }

  // Handle cohort filter change
  const handleCohortChange = (graphType, selectedCohort) => {
    setLastUpdatedGraph(graphType)
    setAnalyticsFilters((prev) => ({
      ...prev,
      [graphType]: {
        ...prev[graphType],
        cohort: selectedCohort,
      },
    }))
  }

  // Handle Graph 7 filter changes
  const handleGraph7Filter1Change = (selectedFilter) => {
    setLastUpdatedGraph("graph7")
    setAnalyticsFilters((prev) => ({
      ...prev,
      graph7: {
        ...prev.graph7,
        filter1: selectedFilter,
        // Reset filter2 to default when filter1 changes
        filter2: defaultGraph7Filter2,
      },
    }))
  }

  const handleGraph7Filter2Change = (selectedFilter) => {
    setLastUpdatedGraph("graph7")
    setAnalyticsFilters((prev) => ({
      ...prev,
      graph7: {
        ...prev.graph7,
        filter2: selectedFilter,
      },
    }))
  }

  // Handle Graph 7 filter changes
  const handleGraph8Filter1Change = (selectedFilter) => {
    setLastUpdatedGraph("graph8")
    setAnalyticsFilters((prev) => ({
      ...prev,
      graph8: {
        ...prev.graph8,
        filter1: selectedFilter,
      },
    }))
  }

  // Function to handle bar clicks for lesson completed graph (graph1)
  const handleLessonBarClick = async (event, elements) => {
    if (elements.length === 0) return
    const clickedIndex = elements[0].index
    const dayNumberStr = analyticsData.graph1.labels[clickedIndex]
    const dayNumber = Number.parseInt(dayNumberStr.split(" ")[1], 10)
    const filters = analyticsFilters.graph1

    if (!filters.grade || !filters.cohort) {
      alert(`Please select both ${userType.value === "student" ? "grade" : "level"} and cohort filters`)
      return
    }

    setRightSidebarLoading(true)
    setRightSidebarOpen(true)
    setRightSidebarTitle(`Users on Day ${dayNumber}`)
    setClickedBarInfo({
      type: "lesson",
      dayNumber: dayNumber,
      primaryFilter: filters.grade.value, // grade or level
      cohort: filters.cohort.value,
    })

    try {
      const courseId = getCourseId(filters.grade.value)
      const cohortValue = filters.cohort.value === "All" ? null : filters.cohort.value
      // Call API to get users by day
      const response = await studentBarAnalyticsStats(
        courseId,
        filters.grade.value,
        cohortValue,
        "graph1",
        dayNumber,
        userType.value,
      )
      if (response.status === 200 && response.data) {
        setRightSidebarData(response.data.users || [])
      } else {
        setRightSidebarData([])
      }
    } catch (error) {
      console.error("Error fetching users by day:", error)
      setRightSidebarData([])
    } finally {
      setRightSidebarLoading(false)
    }
  }

  const handleActiveBarClick = async (event, elements) => {
    if (elements.length === 0) return
    const clickedIndex = elements[0].index
    const dayNumberStr = analyticsData.graph5.labels[clickedIndex]
    const filters = analyticsFilters.graph5

    if (!filters.grade || !filters.cohort) {
      alert(`Please select both ${userType.value === "student" ? "grade" : "level"} and cohort filters`)
      return
    }

    setRightSidebarLoading(true)
    setRightSidebarOpen(true)
    setRightSidebarTitle(`${dayNumberStr} Users`)
    setClickedBarInfo({
      type: "Active/Inactive",
      dayNumber: dayNumberStr,
      primaryFilter: filters.grade.value, // grade or level
      cohort: filters.cohort.value,
    })

    try {
      const courseId = getCourseId(filters.grade.value)
      const cohortValue = filters.cohort.value === "All" ? null : filters.cohort.value
      // Call API to get users by day
      const response = await studentBarAnalyticsStats(
        courseId,
        filters.grade.value,
        cohortValue,
        "graph5",
        dayNumberStr,
        userType.value,
      )
      if (response.status === 200 && response.data) {
        setRightSidebarData(response.data.users || [])
      } else {
        setRightSidebarData([])
      }
    } catch (error) {
      console.error("Error fetching users by day:", error)
      setRightSidebarData([])
    } finally {
      setRightSidebarLoading(false)
    }
  }

  // Function to handle clicks on the stats cards
  const handleStatCardClick = async (graphType, statType) => {
    setRightSidebarLoading(true)
    setRightSidebarOpen(true)
    setRightSidebarTitle(`${graphType} Users ${statType}`)
    const filters = analyticsFilters[graphType];
    try {
      const courseId = getCourseId(filters.grade.value)
      const cohortValue = filters.cohort.value === "All" ? null : filters.cohort.value

      setClickedBarInfo({
        type: "cards",
        primaryFilter: filters.grade.value, // grade or level
        cohort: filters.cohort.value,
      })

      // Call API to get users by lesson
      const response = await studentCardAnalyticsStats(
        courseId,
        filters.grade.value,
        cohortValue,
        graphType,
        statType,
        userType.value,
      )
      if (response.status === 200 && response.data) {
        setRightSidebarData(response.data.users || [])
      } else {
        setRightSidebarData([])
      }
    } catch (error) {
      console.error("Error fetching users by lesson:", error)
      setRightSidebarData([])
    } finally {
      setRightSidebarLoading(false)
    }
  }

  // Function to handle bar clicks for activity drop-off graph (graph2)
  const handleActivityBarClick = async (event, elements) => {
    if (elements.length === 0) return
    const clickedIndex = elements[0].index
    const lessonIdStr = analyticsData.graph2.labels[clickedIndex]
    const lessonId = Number.parseInt(lessonIdStr, 10)
    const filters = analyticsFilters.graph2

    if (!filters.grade || !filters.cohort) {
      alert(`Please select both ${userType.value === "student" ? "grade" : "level"} and cohort filters`)
      return
    }

    setRightSidebarLoading(true)
    setRightSidebarOpen(true)
    setRightSidebarTitle(`Users on Lesson ${lessonId}`)
    setClickedBarInfo({
      type: "activity",
      lessonId: lessonId,
      primaryFilter: filters.grade.value, // grade or level
      cohort: filters.cohort.value,
    })

    try {
      const courseId = getCourseId(filters.grade.value)
      const cohortValue = filters.cohort.value === "All" ? null : filters.cohort.value
      // Call API to get users by lesson
      const response = await studentBarAnalyticsStats(
        courseId,
        filters.grade.value, // grade or level
        cohortValue,
        "graph2",
        lessonId,
        userType.value,
      )
      if (response.status === 200 && response.data) {
        setRightSidebarData(response.data.users || [])
      } else {
        setRightSidebarData([])
      }
    } catch (error) {
      console.error("Error fetching users by lesson:", error)
      setRightSidebarData([])
    } finally {
      setRightSidebarLoading(false)
    }
  }

  // Function to close right sidebar
  const closeRightSidebar = () => {
    setRightSidebarOpen(false)
    setRightSidebarData([])
    setClickedBarInfo(null)
  }

  // Fetch data for specific graph when filters are selected
  const fetchGraphData = async (graphType, userTypeValue = userType.value, currentFilters = analyticsFilters) => {
    const filters = currentFilters[graphType]

    // Handle Graph 7 and Graph 8 differently
    if (graphType === "graph7") {
      if (!filters || !filters.filter1 || !filters.filter2) {
        return
      }
    } else if (graphType === "graph8") {
      if (!filters || !filters.filter1) {
        return
      }
    } else if (!filters || !filters.grade) {
      // For graph6, grade can be null initially, but we need the day filter
      if (graphType !== "graph6") {
        return
      }
    }

    // For graph3, graph4, and graph6, we only need the primary filter (grade/level or day)
    if (graphType === "graph3" || graphType === "graph4" || graphType === "graph6") {
      // These graphs only need primary filter
    } else if (graphType === "graph7" || graphType === "graph8") {
      // These graphs have their own filter structure
    } else {
      // For other graphs, we need both primary filter and cohort
      if (!filters.cohort) {
        return
      }
    }

    let courseId = null
    let primaryFilterValue = null
    let cohortValue = null
    let filter1Value = null
    let filter2Value = null

    if (graphType === "graph7") {
      filter1Value = filters.filter1?.value
      filter2Value = filters.filter2?.value
    } else if (graphType === "graph8") {
      filter1Value = filters.filter1?.value
    } else {
      primaryFilterValue = filters.grade?.value // This is grade for students, level for teachers, or day for graph6
      cohortValue = filters.cohort?.value

      // Special handling for graph6: courseId, gradeValue, cohortValue should be null
      if (graphType === "graph6") {
        courseId = null
        primaryFilterValue = filters.grade?.value // This is the day filter (e.g., "1 day", "3 day")
        cohortValue = null
      } else {
        if (primaryFilterValue && primaryFilterValue !== "All") {
          courseId = getCourseId(primaryFilterValue)
          if (!courseId && graphType !== "graph6") {
            console.error("No course ID found for primary filter:", primaryFilterValue)
            setGraphLoadingStates((prev) => ({ ...prev, [graphType]: false }))
            return
          }
        }
        if (cohortValue && cohortValue === "All") {
          cohortValue = null
        }
        if (primaryFilterValue === "All") {
          primaryFilterValue = null
        }
      }
    }

    setGraphLoadingStates((prev) => ({
      ...prev,
      [graphType]: true,
    }))

    try {
      setCohortName(cohortValue)
      setGradeName(primaryFilterValue) // This will be grade or level
      let response

      if (graphType === "graph6") {
        // For graph6, pass the day filter value as the last parameter
        response = await getstudentAnalyticsStats(null, primaryFilterValue, null, graphType, userTypeValue)
      } else if (graphType === "graph7") {
        // For graph7, pass both filter values
        response = await getstudentAnalyticsStats(null, filter1Value, filter2Value, graphType, userTypeValue)
      } else if (graphType === "graph8") {
        // For graph8, pass the filter value
        response = await getstudentAnalyticsStats(null, filter1Value, null, graphType, userTypeValue)
      } else {
        response = await getstudentAnalyticsStats(courseId, primaryFilterValue, cohortValue, graphType, userTypeValue)
      }

      if (response.status === 200 && response.data) {
        let labels = []
        let data1 = [],
          data2 = [],
          data3 = [],
          data = []

        switch (graphType) {
          case "graph1":
            if (response.data.lastLesson) {
              labels = response.data.lastLesson.map((item) => item.day)
              data = response.data.lastLesson.map((item) => {
                const val = Number.parseInt(item.count)
                return isNaN(val) ? null : val
              })
            }
            const lastLessonsTotal = response.data.lastLesssonTotal || []
            const [firstArrayGraph1 = []] = lastLessonsTotal

            const [totalCountGraph1 = null, notStartedUsersGraph1 = null, started_users1 = null, completed1 = null] = firstArrayGraph1
            setGraphStats((prev) => ({
              ...prev,
              graph1: {
                totalCount: totalCountGraph1,
                notStartedUsers: notStartedUsersGraph1,
                startedUsers: started_users1,
                completed: completed1,
                percentage:
                  totalCountGraph1 !== null && totalCountGraph1 > 0
                    ? Math.round((started_users1 / totalCountGraph1) * 100)
                    : 0,
                completedPercentage: totalCountGraph1 > 0 ? Math.round((completed1 / totalCountGraph1) * 100) : 0,
              },
            }))
            break

          case "graph2":
            if (response.data.lastLesson) {
              labels = response.data.lastLesson.map((item) => item.LessonId)
              data = response.data.lastLesson.map((item) => {
                const val = Number.parseInt(item.total_students_completed)
                return isNaN(val) ? null : val
              })
            }
            const lastLessonsTotal1 = response.data.lastLesssonTotal || []
            const [firstArrayGraph2 = []] = lastLessonsTotal1
            const [totalCountGraph2 = null, notStartedUsersGraph2 = null, started_users2 = null, completed2 = null] = firstArrayGraph2
            setGraphStats((prev) => ({
              ...prev,
              graph2: {
                totalCount: totalCountGraph2,
                notStartedUsers: notStartedUsersGraph2,
                startedUsers: started_users2,
                completed: completed2,
                percentage:
                  totalCountGraph2 !== null && totalCountGraph2 > 0
                    ? Math.round((started_users2 / totalCountGraph2) * 100)
                    : null,
                completedPercentage: totalCountGraph2 > 0 ? Math.round((completed2 / totalCountGraph2) * 100) : 0,
              },
            }))
            break

          case "graph3":
            if (response.data.lastLesson) {
              labels = response.data.lastLesson.map((item) => item.completion_date)
              data = response.data.lastLesson.map((item) => {
                const val = Number.parseInt(item.lesson_completion_count)
                return isNaN(val) ? null : val
              })
              const firstRow = response.data.lastLesson[0]
              const expectedTotal = Number.parseInt(firstRow.expected_total_lessons) || 0
              const actualTotal = Number.parseInt(firstRow.actual_total_lessons) || 0
              const dailyRate = expectedTotal > 0 ? Math.round((actualTotal / expectedTotal) * 100) + "%" : null
              setGraphStats((prev) => ({
                ...prev,
                graph3: {
                  totalCount: expectedTotal,
                  notStartedUsers: actualTotal,
                  startedUsers: expectedTotal - actualTotal,
                  percentage:
                    expectedTotal > 0 ? Math.round(((expectedTotal - actualTotal) / expectedTotal) * 100) : null,
                  dailyCompletionRate: dailyRate,
                },
              }))
            }
            break

          case "graph4":
            let sum1 = 0,
              sum2 = 0,
              sum3 = 0
            if (response.data.lastLesson) {
              labels = response.data.lastLesson.map((item) => item.cohort)
              data1 = response.data.lastLesson.map((item) => {
                const val = Number.parseInt(item.total_users_in_cohort)
                sum1 += val
                return isNaN(val) ? null : val
              })
              data2 = response.data.lastLesson.map((item) => {
                const val = Number.parseInt(item.started_user_count)
                sum2 += val
                return isNaN(val) ? null : val
              })
              data3 = response.data.lastLesson.map((item) => {
                const val = Number.parseInt(item.not_started_user_count)
                sum3 += val
                return isNaN(val) ? null : val
              })
              setGraphStats((prev) => ({
                ...prev,
                graph4: {
                  totalCount: sum1,
                  notStartedUsers: sum3,
                  startedUsers: sum2,
                  percentage: sum1 > 0 ? Math.round(((sum1 - sum3) / sum1) * 100) : null,
                },
              }))
            }
            break

          case "graph5":
            if (response.data.lastLesson) {
              labels = ["Inactive", "Active"]
              const firstRow = response.data.lastLesson[0]
              const val1 = Number.parseInt(firstRow.active) || null
              const val2 = Number.parseInt(firstRow.inactive) || null
              // const val3 = Number.parseInt(firstRow.up_to_date_count) || null
              data = [val2, val1]
            }
            break

          case "graph6":
            if (response.data.lastLesson) {
              labels = response.data.lastLesson.map((item) => item.date)
              data = response.data.lastLesson.map((item) => {
                const val = Number.parseInt(item.count)
                return isNaN(val) ? null : val
              })
            }
            break

          case "graph7":
            if (response.data.lastLesson) {
              labels = response.data.lastLesson.map((item) => item.label)
              data = response.data.lastLesson.map((item) => {
                const val = Number.parseInt(item.count)
                return isNaN(val) ? null : val
              })
            }
            break

          case "graph8":
            if (response.data.lastLesson) {
              labels = response.data.lastLesson.map((item) => item.label)
              data = response.data.lastLesson.map((item) => {
                const val = Number.parseInt(item.total_revenue)
                return isNaN(val) ? null : val
              })
            }
            break

          default:
            console.warn("Unknown graph type:", graphType)
        }

        if (graphType === "graph4") {
          setAnalyticsData((prev) => ({
            ...prev,
            [graphType]: { labels, data1, data2, data3 },
          }))
        } else {
          setAnalyticsData((prev) => ({
            ...prev,
            [graphType]: { labels, data },
          }))
        }
      }
    } catch (error) {
      console.error(`Error fetching data for ${graphType}:`, error)
    } finally {
      setGraphLoadingStates((prev) => ({
        ...prev,
        [graphType]: false,
      }))
    }
  }

  useEffect(() => {
    if (lastUpdatedGraph) {
      const filters = analyticsFilters[lastUpdatedGraph]
      if (lastUpdatedGraph === "graph3" || lastUpdatedGraph === "graph4" || lastUpdatedGraph === "graph6") {
        // For graph3, graph4, and graph6, only need primary filter
        if (filters?.grade) {
          fetchGraphData(lastUpdatedGraph)
        }
      } else if (lastUpdatedGraph === "graph7") {
        // For graph7, need both filters
        if (filters?.filter1 && filters?.filter2) {
          fetchGraphData(lastUpdatedGraph)
        }
      } else if (lastUpdatedGraph === "graph8") {
        // For graph8, need filter1
        if (filters?.filter1) {
          fetchGraphData(lastUpdatedGraph)
        }
      } else {
        // For other graphs, need both primary filter and cohort
        if (filters?.grade && filters?.cohort) {
          fetchGraphData(lastUpdatedGraph)
        }
      }
    }
  }, [analyticsFilters, lastUpdatedGraph, userType.value]) // Add userType.value to dependencies

  // Fetch all graphs data with default values when analytics component is first loaded
  const fetchAllGraphsData = async (userTypeValue = userType.value, initialFilters = analyticsFilters) => {
    const graphTypes = ["graph7", "graph8", "graph1", "graph3", "graph5", "graph4", "graph6", "graph2"]
    // Set all graphs to loading state first
    setGraphLoadingStates({
      graph1: true,
      graph2: true,
      graph3: true,
      graph4: true,
      graph5: true,
      graph6: true,
      graph7: true,
      graph8: true,
    })

    // Fetch graphs sequentially to optimize loading
    for (const graphType of graphTypes) {
      if (graphType === "graph3") {
        updateCohortRange(graphType, "All")
      } else if (graphType === "graph6" || graphType === "graph7" || graphType === "graph8") {
        // No cohort range update needed for graph6, graph7, graph8
      } else {
        updateCohortRange(graphType, userTypeValue === "student" ? "grade 1" : "level 1")
      }
      await fetchGraphData(graphType, userTypeValue, initialFilters)
    }
  }

  // Effect to handle analytics tab activation and filter changes
  useEffect(() => {
    // When analytics component is first loaded, fetch all graphs with default values
    fetchStatsData()
    fetchAllGraphsData()
  }, [])

  // Effect to handle analytics tab activation and filter changes
  useEffect(() => {
    // When analytics component is first loaded, fetch all graphs with default values
    fetchStatsData()
    fetchAllGraphsData()
  }, [userType])

  return (
    <>
      <div className={styles.analytics_header}>
        {/* Main User Type Selection */}
        <div className={styles.main_filter_container}>
          <div className={styles.main_filter_group}>
            <label className={styles.main_filter_label}>User Type:</label>
            <Select
              className={styles.main_select}
              options={userTypeOptions}
              value={userType}
              onChange={handleUserTypeChange}
              placeholder="Select User Type"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className={styles.analytics_cards_container}>
        {statsLoading ? (
          <>
            <div className={styles.analytics_card_loading}>
              <TailSpin color="#51bbcc" height={30} width={30} />
            </div>
            <div className={styles.analytics_card_loading}>
              <TailSpin color="#51bbcc" height={30} width={30} />
            </div>
            <div className={styles.analytics_card_loading}>
              <TailSpin color="#51bbcc" height={30} width={30} />
            </div>
            <div className={styles.analytics_card_loading}>
              <TailSpin color="#51bbcc" height={30} width={30} />
            </div>
          </>
        ) : (
          <>
            {/* Common Stats for both Student and Teacher */}
            <div className={styles.analytics_stats_card}>
              <div className={styles.analytics_card_header}>
                <div className={styles.analytics_card_icon}>📊</div>
                <h4 className={styles.analytics_card_title}>Total Registrations</h4>
              </div>
              <div className={styles.analytics_card_value}>{statsData.totalRegistrations.count.toLocaleString()}</div>
              <div className={styles.analytics_card_percentage}>{statsData.totalRegistrations.percentage}%</div>
            </div>
            <div className={styles.analytics_stats_card}>
              <div className={styles.analytics_card_header}>
                <div className={styles.analytics_card_icon}>💬</div>
                <h4 className={styles.analytics_card_title}>Users with One Message</h4>
              </div>
              <div className={styles.analytics_card_value}>{statsData.usersWithOneMessage.count.toLocaleString()}</div>
              <div className={styles.analytics_card_percentage}>{statsData.usersWithOneMessage.percentage}%</div>
            </div>
            <div className={styles.analytics_stats_card}>
              <div className={styles.analytics_card_header}>
                <div className={styles.analytics_card_icon}>🚀</div>
                <h4 className={styles.analytics_card_title}>Users Who Started</h4>
              </div>
              <div className={styles.analytics_card_value}>{statsData.usersWhoStarted.count.toLocaleString()}</div>
              <div className={styles.analytics_card_percentage}>{statsData.usersWhoStarted.percentage}%</div>
            </div>
            <div className={styles.analytics_stats_card}>
              <div className={styles.analytics_card_header}>
                <div className={styles.analytics_card_icon}>📈</div>
                <h4 className={styles.analytics_card_title}>Start Rate of Users with One Message</h4>
              </div>
              <div className={styles.analytics_card_value}>
                {statsData.startRateOfMessageSenders.count.toLocaleString()}
              </div>
            </div>
            <div className={styles.analytics_stats_card}>
              <div className={styles.analytics_card_header}>
                <div className={styles.analytics_card_icon}>👥</div>
                <h4 className={styles.analytics_card_title}>Active Users (Last 3 Days)</h4>
              </div>
              <div className={styles.analytics_card_value}>{statsData.activeUser.count.toLocaleString()}</div>
              <div className={styles.analytics_card_percentage}>{statsData.activeUser.percentage}%</div>
            </div>
            {/* Student-only Stats */}
            {userType.value === "student" && (
              <>
                <div className={styles.analytics_stats_card}>
                  <div className={styles.analytics_card_header}>
                    <div className={styles.analytics_card_icon}>💰</div>
                    <h4 className={styles.analytics_card_title}>Total Revenue</h4>
                  </div>
                  <div className={styles.analytics_card_value}>{statsData.totalRevenue.toLocaleString()}</div>
                  <div className={styles.analytics_card_percentage}>Rs</div>
                </div>
                <div className={styles.analytics_stats_card}>
                  <div className={styles.analytics_card_header}>
                    <div className={styles.analytics_card_icon}>🏢</div>
                    <h4 className={styles.analytics_card_title}>Avg Revenue B2B</h4>
                  </div>
                  <div className={styles.analytics_card_value}>{statsData.avgRevenueB2B.toLocaleString()}</div>
                  <div className={styles.analytics_card_percentage}>Rs</div>
                </div>
                <div className={styles.analytics_stats_card}>
                  <div className={styles.analytics_card_header}>
                    <div className={styles.analytics_card_icon}>👨‍👩‍👧‍👦</div>
                    <h4 className={styles.analytics_card_title}>Avg Revenue B2C</h4>
                  </div>
                  <div className={styles.analytics_card_value}>{statsData.avgRevenueB2C.toLocaleString()}</div>
                  <div className={styles.analytics_card_percentage}>Rs</div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Graph 7 - Total Registered Users Graph (Horizontal Bar Chart) */}
      <div className={styles.analytics_grid}>
        <div className={styles.analytics_card}>
          <div className={styles.card_header}>
            <div className={styles.card_title_section}>
              <h3>User Information</h3>
              {/* <p>Analyze user registration data by different criteria</p> */}
            </div>
            <div className={styles.card_filters}>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>Primary Filter</label>
                <Select
                  className={styles.select}
                  options={graph7Filter1Options}
                  value={analyticsFilters.graph7.filter1}
                  onChange={handleGraph7Filter1Change}
                  isClearable
                  placeholder="Select Primary Filter"
                />
              </div>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>Secondary Filter</label>
                <Select
                  className={styles.select}
                  options={getGraph7Filter2Options(analyticsFilters.graph7.filter1?.value)}
                  value={analyticsFilters.graph7.filter2}
                  onChange={handleGraph7Filter2Change}
                  isDisabled={!analyticsFilters.graph7.filter1}
                  isClearable
                  placeholder="Select Secondary Filter"
                />
              </div>
            </div>
          </div>
          <div
            className={styles.chart_wrapper}
            style={{
              height: `${Math.max(300, analyticsData.graph7.labels.length * 50 + 100)}px`,
            }}
          >
            {graphLoadingStates.graph7 ? (
              <div className={styles.graph_loader}>
                <TailSpin color="#51bbcc" height={40} width={40} />
                <p>Loading graph data...</p>
              </div>
            ) : (
              <Bar
                data={{
                  labels: analyticsData.graph7.labels,
                  datasets: [
                    {
                      label: "User Count",
                      data: analyticsData.graph7.data,
                      backgroundColor: "rgba(237, 80, 80, 0.8)",
                      borderColor: "rgba(237, 80, 80, 1)",
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y", // This makes it horizontal
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    datalabels: {
                      anchor: "end",
                      align: "right",
                      color: "#000",
                      font: {
                        weight: "bold",
                        size: 12,
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                      borderColor: "#51bbcc",
                      borderWidth: 1,
                      callbacks: {
                        label: (context) => `Users: ${context.raw}`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                      },
                      ticks: {
                        color: "#666",
                        font: {
                          size: 12,
                        },
                      },
                      title: {
                        display: true,
                        text: "No. of People",
                        color: "#333",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                    y: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: "#666",
                        font: {
                          size: 12,
                        },
                      },
                      title: {
                        display: true,
                        text: analyticsFilters.graph7.filter2?.label,
                        color: "#333",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {(userType.value === "student") && (
        <div className={styles.analytics_grid}>
          <div className={styles.analytics_card}>
            <div className={styles.card_header}>
              <div className={styles.card_title_section}>
                <h3>User Revenue By {analyticsFilters.graph8.filter1?.label}</h3>
                {/* <p>Track revenue by different user segments</p> */}
              </div>
              <div className={styles.card_filters}>
                <div className={styles.filter_group}>
                  <label className={styles.filter_label}>Revenue By</label>
                  <Select
                    className={styles.select}
                    options={graph8FilterOptions}
                    value={analyticsFilters.graph8.filter1}
                    onChange={handleGraph8Filter1Change}
                    isClearable
                    placeholder="Select Revenue Categories"
                  />
                </div>
              </div>
            </div>
            <div
              className={styles.chart_wrapper}
              style={{
                height: `${Math.max(300, analyticsData.graph8.labels.length * 50 + 100)}px`,
              }}
            >
              {graphLoadingStates.graph8 ? (
                <div className={styles.graph_loader}>
                  <TailSpin color="#51bbcc" height={40} width={40} />
                  <p>Loading graph data...</p>
                </div>
              ) : (
                <Bar
                  data={{
                    labels: analyticsData.graph8.labels,
                    datasets: [
                      {
                        label: "Revenue",
                        data: analyticsData.graph8.data,
                        backgroundColor: "rgba(125, 222, 98, 0.8)",
                        borderColor: "rgba(125, 222, 98, 1)",
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                      },
                    ],
                  }}
                  options={{
                    indexAxis: "y", // This makes it horizontal
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      datalabels: {
                        anchor: "inside",
                        align: "right",
                        color: "#000",
                        font: {
                          weight: "bold",
                          size: 12,
                        },
                        formatter: (value) => `${value?.toLocaleString() || 0} Rs`,
                      },
                      tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        titleColor: "#fff",
                        bodyColor: "#fff",
                        borderColor: "#51bbcc",
                        borderWidth: 1,
                        callbacks: {
                          label: (context) => `Revenue: ${context.raw?.toLocaleString() || ''} Rs`,
                        },
                      },
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        grid: {
                          color: "rgba(0, 0, 0, 0.1)",
                        },
                        ticks: {
                          color: "#666",
                          font: {
                            size: 12,
                          },
                          callback: (value) => `${value?.toLocaleString() || ''}`,
                        },
                        title: {
                          display: true,
                          text: "Revenue (Rs)",
                          color: "#333",
                          font: {
                            size: 14,
                            weight: "bold",
                          },
                        },
                      },
                      y: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          color: "#666",
                          font: {
                            size: 12,
                          },
                        },
                        title: {
                          display: true,
                          text: analyticsFilters.graph8.filter1?.label,
                          color: "#333",
                          font: {
                            size: 14,
                            weight: "bold",
                          },
                        },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rest of the existing graphs... */}
      <div className={styles.analytics_grid}>
        {/* Graph 1 - Last Completed Lesson Drop-off Rate */}
        <div className={styles.analytics_card}>
          <div className={styles.card_header}>
            <div className={styles.card_title_section}>
              <h3>Gradewise Information</h3>
              <div className={styles.stats_boxes}>
                <div className={styles.stat_box} onClick={() => handleStatCardClick("graph1", "Total Users")}
                  style={{ cursor: 'pointer' }}>
                  <h4>Total Count</h4>
                  <p className={styles.stat_value}
                  >
                    {graphStats.graph1.totalCount !== null ? graphStats.graph1.totalCount : "-"}
                  </p>

                </div>
                <div className={styles.stat_box} onClick={() => handleStatCardClick("graph1", "Not Started Users")}
                  style={{ cursor: 'pointer' }}>
                  <h4>Not Started Users</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph1.notStartedUsers !== null ? graphStats.graph1.notStartedUsers : "-"}
                  </p>
                </div>
                <div className={styles.stat_box} onClick={() => handleStatCardClick("graph1", "Started Users")}
                  style={{ cursor: 'pointer' }}>
                  <h4>Started Users</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph1.startedUsers !== null ? graphStats.graph1.startedUsers : "-"}
                  </p>
                  <div className={styles.analytics_card_percentage}>{graphStats.graph1.percentage}%</div>
                </div>
                <div className={styles.stat_box} onClick={() => handleStatCardClick("graph1", "Course Completed")}
                  style={{ cursor: 'pointer' }} >
                  <h4>Course Completed</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph1.completed !== null ? graphStats.graph1.completed : "-"}
                  </p>
                  <div className={styles.analytics_card_percentage}>{graphStats.graph1.completedPercentage}%</div>
                </div>
              </div>
            </div>
            <div className={styles.card_filters}>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>{userType.value === "student" ? "Grade" : "Level"}</label>
                <Select
                  className={styles.select}
                  options={getPrimaryFilterOptions("graph1")}
                  value={analyticsFilters.graph1.grade}
                  onChange={(option) => handlePrimaryFilterChange("graph1", option)}
                  isClearable
                  placeholder={`Select ${userType.value === "student" ? "Grade" : "Level"}`}
                />
              </div>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>Cohort</label>
                <Select
                  className={styles.select}
                  options={getCohortOptions("graph1")}
                  value={analyticsFilters.graph1.cohort}
                  onChange={(option) => handleCohortChange("graph1", option)}
                  isDisabled={!analyticsFilters.graph1.grade}
                  isClearable
                  placeholder="Select Cohort"
                />
              </div>
            </div>
          </div>
          <div className={styles.chart_wrapper}>
            {graphLoadingStates.graph1 ? (
              <div className={styles.graph_loader}>
                <TailSpin color="#51bbcc" height={40} width={40} />
                <p>Loading graph data...</p>
              </div>
            ) : (
              <Bar
                data={{
                  labels: analyticsData.graph1.labels,
                  datasets: [
                    {
                      label: `${userType.label} Count`,
                      data: analyticsData.graph1.data,
                      backgroundColor: "rgba(111, 238, 228, 0.8)",
                      borderColor: "rgba(111, 238, 228, 1)",
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  onClick: handleLessonBarClick,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    datalabels: {
                      anchor: "center",
                      align: "center",
                      color: "#000",
                      font: {
                        weight: "bold",
                        size: 12,
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                      borderColor: "#51bbcc",
                      borderWidth: 1,
                      callbacks: {
                        label: (context) => `${userType.label}s: ${context.raw}`,
                        afterLabel: () => "Click to view users",
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                      },
                      ticks: {
                        color: "#666",
                        font: {
                          size: 12,
                        },
                      },
                      title: {
                        display: true,
                        text: "No. of People",
                        color: "#333",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: "#666",
                        font: {
                          size: 12,
                        },
                      },
                      title: {
                        display: true,
                        text: "Last Day",
                        color: "#333",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className={styles.analytics_grid}>
        {/* Graph 3 - Performance Analysis */}
        <div className={styles.analytics_card}>
          <div className={styles.card_header}>
            <div className={styles.card_title_section}>
              <h3>Daily Lesson Completion</h3>
              <div className={styles.stats_boxes}>
                <div className={styles.stat_box}>
                  <h4>Expected Completion</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph3.totalCount !== null ? graphStats.graph3.totalCount : "-"}
                  </p>
                </div>
                <div className={styles.stat_box}>
                  <h4>Actual Completion</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph3.notStartedUsers !== null ? graphStats.graph3.notStartedUsers : "-"}
                  </p>
                </div>
                <div className={styles.stat_box}>
                  <h4>Difference</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph3.startedUsers !== null ? graphStats.graph3.startedUsers : "-"}
                  </p>
                  <div className={styles.analytics_card_percentage}>{graphStats.graph3.percentage}%</div>
                </div>
                <div className={styles.stat_box}>
                  <h4>Average Lesson Completion</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph3.dailyCompletionRate !== null ? graphStats.graph3.dailyCompletionRate : "-"}
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.card_filters}>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>{userType.value === "student" ? "Grade" : "Level"}</label>
                <Select
                  className={styles.select}
                  options={getPrimaryFilterOptions("graph3")}
                  value={analyticsFilters.graph3.grade}
                  onChange={(option) => handlePrimaryFilterChange("graph3", option)}
                  isClearable
                  placeholder={`Select ${userType.value === "student" ? "Grade" : "Level"}`}
                />
              </div>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>Cohort</label>
                <Select
                  className={styles.select}
                  options={getCohortOptions("graph3")}
                  value={analyticsFilters.graph3.cohort}
                  onChange={(option) => handleCohortChange("graph3", option)}
                  isDisabled={!analyticsFilters.graph3.grade}
                  isClearable
                  placeholder="Select Cohort"
                />
              </div>
            </div>
          </div>
          <div className={styles.chart_wrapper}>
            {graphLoadingStates.graph3 ? (
              <div className={styles.graph_loader}>
                <TailSpin color="#51bbcc" height={40} width={40} />
                <p>Loading graph data...</p>
              </div>
            ) : (
              <Line
                data={{
                  labels: analyticsData.graph3.labels,
                  datasets: [
                    {
                      label: "Daily Lesson Completion",
                      data: analyticsData.graph3.data,
                      borderColor: "rgba(153, 102, 255, 0.8)",
                      backgroundColor: "rgba(231, 186, 233, 0.1)",
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: "rgba(153, 102, 255, 1)",
                      pointBorderColor: "#fff",
                      pointBorderWidth: 2,
                      pointRadius: 3,
                      pointHoverRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                      borderColor: "#51bbcc",
                      borderWidth: 1,
                      callbacks: {
                        label: (context) => `Lessons: ${context.raw}`,
                      },
                    },
                    datalabels: {
                      anchor: "end",
                      align: "bottom",
                      color: "#000",
                      font: {
                        weight: "bold",
                        size: 12,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                      },
                      ticks: {
                        color: "#666",
                        font: {
                          size: 12,
                        },
                      },
                      title: {
                        display: true,
                        text: "Lesson Completion",
                        color: "#333",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: "#666",
                        font: {
                          size: 12,
                        },
                      },
                      title: {
                        display: true,
                        text: "Date",
                        color: "#333",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className={styles.analytics_grid}>
        <div className={styles.analytics_card}>
          <div className={styles.card_header}>
            <div className={styles.card_title_section}>
              <h3>Active & Inactive Users (Last 3 Days)</h3>
            </div>
            <div className={styles.card_filters}>
              {(userType.value === "student") && (
                <div className={styles.filter_group}>
                  <label className={styles.filter_label}>{userType.value === "student" ? "Grade" : "Level"}</label>
                  <Select
                    className={styles.select}
                    options={getPrimaryFilterOptions("graph5")}
                    value={analyticsFilters.graph5.grade}
                    onChange={(option) => handlePrimaryFilterChange("graph5", option)}
                    isClearable
                    placeholder={`Select ${userType.value === "student" ? "Grade" : "Level"}`}
                  />
                </div>
              )}
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>Cohort</label>
                <Select
                  className={styles.select}
                  options={getCohortOptions("graph5")}
                  value={analyticsFilters.graph5.cohort}
                  onChange={(option) => handleCohortChange("graph5", option)}
                  isDisabled={!analyticsFilters.graph5.grade}
                  isClearable
                  placeholder="Select Cohort"
                />
              </div>
            </div>
          </div>
          <div className={styles.chart_wrapper}
            style={{
              height: `${Math.max(60, analyticsData.graph5.labels.length * 10 + 20)}px`,
            }}
          >
            {graphLoadingStates.graph5 ? (
              <div className={styles.graph_loader}>
                <TailSpin color="#51bbcc" height={40} width={40} />
                <p>Loading graph data...</p>
              </div>
            ) : (
              <Bar
                data={{
                  labels: analyticsData.graph5.labels,
                  datasets: [
                    {
                      label: "Active Users",
                      data: analyticsData.graph5.data,
                      backgroundColor: [
                        "rgba(232, 180, 89, 0.8)",
                        "rgba(112, 161, 234, 0.8)"
                      ],
                      borderColor: ["rgba(232, 180, 89, 0.8)", "rgba(112, 161, 234, 1)"],
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  onClick: handleActiveBarClick,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    datalabels: {
                      anchor: "inside",
                      align: "right",
                      color: "#000",
                      font: {
                        weight: "bold",
                        size: 12,
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                      borderColor: "#51bbcc",
                      borderWidth: 1,
                      callbacks: {
                        label: (context) => `${userType.label}s: ${context.raw}`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                      },
                      ticks: {
                        color: "#666",
                        font: {
                          size: 12,
                        },
                      },
                      title: {
                        display: true,
                        text: "No. of people",
                        color: "#333",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                    y: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: "#666",
                        font: {
                          size: 12,
                        },
                      },
                      title: {
                        display: true,
                        text: "Active / Inactive",
                        color: "#333",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className={styles.analytics_grid}>
        <div className={styles.analytics_card}>
          <div className={styles.card_header}>
            <div className={styles.card_title_section}>
              <h3>Started vs Not Started By Cohorts</h3>
              <div className={styles.stats_boxes}>
                <div className={styles.stat_box}>
                  <h4>Total Count</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph4.totalCount !== null ? graphStats.graph4.totalCount : "-"}
                  </p>
                </div>
                <div className={styles.stat_box}>
                  <h4>Not Started Users</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph4.notStartedUsers !== null ? graphStats.graph4.notStartedUsers : "-"}
                  </p>
                </div>
                <div className={styles.stat_box}>
                  <h4>Started Users</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph4.startedUsers !== null ? graphStats.graph4.startedUsers : "-"}
                  </p>
                  <div className={styles.analytics_card_percentage}>{graphStats.graph4.percentage}%</div>
                </div>
              </div>
            </div>
            <div className={styles.card_filters}>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>{userType.value === "student" ? "Grade" : "Level"}</label>
                <Select
                  className={styles.select}
                  options={getPrimaryFilterOptions("graph4")}
                  value={analyticsFilters.graph4.grade}
                  onChange={(option) => handlePrimaryFilterChange("graph4", option)}
                  isClearable
                  placeholder={`Select ${userType.value === "student" ? "Grade" : "Level"}`}
                />
              </div>
            </div>
          </div>
          <div className={styles.chart_wrapper}>
            {graphLoadingStates.graph4 ? (
              <div className={styles.graph_loader}>
                <TailSpin color="#51bbcc" height={40} width={40} />
                <p>Loading graph data...</p>
              </div>
            ) : (
              <Bar
                data={{
                  labels: analyticsData.graph4.labels,
                  datasets: [
                    {
                      label: "Total",
                      data: analyticsData.graph4.data1,
                      backgroundColor: "rgba(54, 162, 235, 0.8)",
                      borderColor: "rgba(54, 162, 235, 1)",
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    },
                    {
                      label: "Started",
                      data: analyticsData.graph4.data2,
                      backgroundColor: "rgba(61, 220, 90, 0.8)",
                      borderColor: "rgba(61, 220, 90, 1)",
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    },
                    {
                      label: "Not Started",
                      data: analyticsData.graph4.data3,
                      backgroundColor: "rgba(255, 99, 132, 0.8)",
                      borderColor: "rgba(255, 99, 132, 1)",
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: "top",
                    },
                    datalabels: {
                      anchor: "top",
                      align: "center",
                      color: "#000",
                      font: {
                        weight: "bold",
                        size: 13,
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                      borderColor: "#51bbcc",
                      borderWidth: 1,
                      callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.raw}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                      },
                      ticks: {
                        color: "#666",
                        font: {
                          size: 12,
                        },
                      },
                      title: {
                        display: true,
                        text: `No. of ${userType.label}s`,
                        color: "#333",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: "#666",
                        font: {
                          size: 12,
                        },
                      },
                      title: {
                        display: true,
                        text: "Cohorts",
                        color: "#333",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Graph 6 - Daily Active Users */}
      <div className={styles.analytics_grid}>
        <div className={styles.analytics_card}>
          <div className={styles.card_header}>
            <div className={styles.card_title_section}>
              <h3>Daily Active Users</h3>
            </div>
            <div className={styles.card_filters}>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>Time Period</label>
                <Select
                  className={styles.select}
                  options={getPrimaryFilterOptions("graph6")} // Using getPrimaryFilterOptions for day filter
                  value={analyticsFilters.graph6.grade}
                  onChange={(option) => handlePrimaryFilterChange("graph6", option)}
                  isClearable
                  placeholder="Select Time Period"
                />
              </div>
            </div>
          </div>
          <div className={styles.chart_wrapper}>
            {graphLoadingStates.graph6 ? (
              <div className={styles.graph_loader}>
                <TailSpin color="#51bbcc" height={40} width={40} />
                <p>Loading graph data...</p>
              </div>
            ) : (
              <Line
                data={{
                  labels: analyticsData.graph6.labels,
                  datasets: [
                    {
                      label: `Active ${userType.label}s`,
                      data: analyticsData.graph6.data,
                      borderColor: "rgba(46, 184, 170, 0.8)",
                      backgroundColor: "rgba(46, 184, 170, 0.1)",
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: "rgba(46, 184, 170, 1)",
                      pointBorderColor: "#fff",
                      pointBorderWidth: 2,
                      pointRadius: 3,
                      pointHoverRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                      borderColor: "#51bbcc",
                      borderWidth: 1,
                      callbacks: {
                        label: (context) => `Active ${userType.label}s: ${context.raw}`,
                      },
                    },
                    datalabels: {
                      anchor: "end",
                      align: "bottom",
                      color: "#000",
                      font: {
                        weight: "bold",
                        size: 12,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                      },
                      ticks: {
                        color: "#666",
                        font: {
                          size: 12,
                        },
                      },
                      title: {
                        display: true,
                        text: `Active ${userType.label}s Count`,
                        color: "#333",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: "#666",
                        font: {
                          size: 12,
                        },
                        // maxTicksLimit: 10,
                      },
                      title: {
                        display: true,
                        text: "Date",
                        color: "#333",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className={styles.analytics_grid}>
        {/* Graph 2 - Last Completed Activity Drop-off Rate */}
        <div className={styles.analytics_card}>
          <div className={styles.card_header}>
            <div className={styles.card_title_section}>
              <h3>Last Completed Activity - Drop-off</h3>
              <div className={styles.stats_boxes}>
                <div className={styles.stat_box} onClick={() => handleStatCardClick("graph2", "Total Users")}
                  style={{ cursor: 'pointer' }}>
                  <h4>Total Count</h4>
                  <p className={styles.stat_value}
                  >
                    {graphStats.graph2.totalCount !== null ? graphStats.graph2.totalCount : "-"}
                  </p>

                </div>
                <div className={styles.stat_box} onClick={() => handleStatCardClick("graph2", "Not Started Users")}
                  style={{ cursor: 'pointer' }}>
                  <h4>Not Started Users</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph2.notStartedUsers !== null ? graphStats.graph2.notStartedUsers : "-"}
                  </p>
                </div>
                <div className={styles.stat_box} onClick={() => handleStatCardClick("graph2", "Started Users")}
                  style={{ cursor: 'pointer' }}>
                  <h4>Started Users</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph2.startedUsers !== null ? graphStats.graph2.startedUsers : "-"}
                  </p>
                  <div className={styles.analytics_card_percentage}>{graphStats.graph2.percentage}%</div>
                </div>
                <div className={styles.stat_box} onClick={() => handleStatCardClick("graph2", "Course Completed")}
                  style={{ cursor: 'pointer' }} >
                  <h4>Course Completed</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph2.completed !== null ? graphStats.graph2.completed : "-"}
                  </p>
                  <div className={styles.analytics_card_percentage}>{graphStats.graph2.completedPercentage}%</div>
                </div>
              </div>
            </div>
            <div className={styles.card_filters}>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>{userType.value === "student" ? "Grade" : "Level"}</label>
                <Select
                  className={styles.select}
                  options={getPrimaryFilterOptions("graph2")}
                  value={analyticsFilters.graph2.grade}
                  onChange={(option) => handlePrimaryFilterChange("graph2", option)}
                  isClearable
                  placeholder={`Select ${userType.value === "student" ? "Grade" : "Level"}`}
                />
              </div>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>Cohort</label>
                <Select
                  className={styles.select}
                  options={getCohortOptions("graph2")}
                  value={analyticsFilters.graph2.cohort}
                  onChange={(option) => handleCohortChange("graph2", option)}
                  isDisabled={!analyticsFilters.graph2.grade}
                  isClearable
                  placeholder="Select Cohort"
                />
              </div>
            </div>
          </div>
          <div className={styles.chart_wrapper}>
            {graphLoadingStates.graph2 ? (
              <div className={styles.graph_loader}>
                <TailSpin color="#51bbcc" height={40} width={40} />
                <p>Loading graph data...</p>
              </div>
            ) : (
              <Bar
                data={{
                  labels: analyticsData.graph2.labels,
                  datasets: [
                    {
                      label: `${userType.label}s Completed`,
                      data: analyticsData.graph2.data,
                      backgroundColor: "rgba(213, 218, 62, 0.8)",
                      borderColor: "rgba(213, 218, 62, 1)",
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  onClick: handleActivityBarClick,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    datalabels: {
                      anchor: "center",
                      align: "center",
                      color: "#000",
                      font: {
                        weight: "bold",
                        size: 12,
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                      borderColor: "#51bbcc",
                      borderWidth: 1,
                      callbacks: {
                        label: (context) => `${userType.label}s: ${context.raw}`,
                        afterLabel: () => "Click to view users",
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                      },
                      ticks: {
                        color: "#666",
                        font: {
                          size: 12,
                        },
                      },
                      title: {
                        display: true,
                        text: "No. of People",
                        color: "#333",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: "#666",
                        font: {
                          size: 12,
                        },
                      },
                      title: {
                        display: true,
                        text: "Last Activity",
                        color: "#333",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>


      </div>

      {/* Right Sidebar for clicked bar data */}
      {rightSidebarOpen && (
        <div className={styles.right_sidebar_overlay} onClick={closeRightSidebar}>
          <div className={styles.right_sidebar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.right_sidebar_header}>
              <h3>{rightSidebarTitle}</h3>
              <button className={styles.close_button} onClick={closeRightSidebar}>
                ✕
              </button>
            </div>
            <div className={styles.right_sidebar_content}>
              {rightSidebarLoading ? (
                <div className={styles.sidebar_loader}>
                  <TailSpin color="#51bbcc" height={40} width={40} />
                  <p>Loading users...</p>
                </div>
              ) : rightSidebarData.length > 0 ? (
                <div className={styles.users_table_container}>
                  <div className={styles.users_count_header}>
                    <span className={styles.users_count_badge}>
                      Total {userType.label}s: {rightSidebarData.length} {clickedBarInfo.primaryFilter} {clickedBarInfo.cohort}
                    </span>
                  </div>
                  <div className={styles.table_wrapper}>
                    <table className={styles.users_table}>
                      <thead className={styles.table_header}>
                        <tr>
                          <th className={styles.table_th}>#</th>
                          <th className={styles.table_th}>Phone</th>
                          <th className={styles.table_th}>Name</th>
                          <th className={styles.table_th}>School</th>
                          <th className={styles.table_th}>Status</th>
                          <th className={styles.table_th}>City</th>
                          <th className={styles.table_th}>Cohort</th>
                          <th className={styles.table_th}>Customer Source</th>
                          <th className={styles.table_th}>Customer Channel</th>
                          <th className={styles.table_th}>Amount Paid</th>
                          <th className={styles.table_th}>Class</th>
                          <th className={styles.table_th}>Profile</th>
                          <th className={styles.table_th}>Rollout</th>
                        </tr>
                      </thead>
                      <tbody className={styles.table_body}>
                        {rightSidebarData.map((user, index) => (
                          <tr key={index} className={styles.table_row}>
                            <td className={styles.table_td}>
                              <span className={styles.row_number}>{index + 1}</span>
                            </td>
                            <td className={styles.table_td}>
                              <div
                                className={styles.phone_cell}
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  handlePhoneNumberClick(
                                    user.phoneNumber,
                                    user.profile_id,
                                    userType.value === "student" ? "608292759037444" : "410117285518514",
                                  )
                                }
                              >
                                <a
                                  href={`${window.location.origin}/#/whatsapp-logs`}
                                  className={styles.clickable_phone_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <span>{user.phoneNumber || "N/A"}</span>
                                </a>
                              </div>
                            </td>
                            <td className={styles.table_td}>
                              <div className={styles.name_cell}>
                                <span>{user.name || "N/A"}</span>
                              </div>
                            </td>
                            <td className={styles.table_td}>
                              <div className={styles.school_cell}>
                                <span>{user.schoolName || "N/A"}</span>
                              </div>
                            </td>
                            <td className={styles.table_td}>
                              <div className={styles.phone_cell}>
                                <span
                                  className={user.status === "Active" ? styles.status_active : styles.status_inactive}
                                >
                                  {user.status || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className={styles.table_td}>
                              <div className={styles.school_cell}>
                                <span>{user.city || "N/A"}</span>
                              </div>
                            </td>
                            <td className={styles.table_td}>
                              <div className={styles.school_cell}>
                                <span>{user.cohort || "N/A"}</span>
                              </div>
                            </td>
                            <td className={styles.table_td}>
                              <div className={styles.school_cell}>
                                <span>{user.customerSource || "N/A"}</span>
                              </div>
                            </td>
                            <td className={styles.table_td}>
                              <div className={styles.school_cell}>
                                <span>{user.customerChannel || "N/A"}</span>
                              </div>
                            </td>
                            <td className={styles.table_td}>
                              <div className={styles.school_cell}>
                                <span>{user.amountPaid || "N/A"}</span>
                              </div>
                            </td>
                            <td className={styles.table_td}>
                              <div className={styles.school_cell}>
                                <span>{user.classLevel || "N/A"}</span>
                              </div>
                            </td>
                            <td className={styles.table_td}>
                              <div className={styles.phone_cell}>
                                <span>{user.profile_id || "N/A"}</span>
                              </div>
                            </td>
                            <td className={styles.table_td}>
                              <div className={styles.phone_cell}>
                                <span>{user.rollout || "N/A"}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className={styles.no_users}>
                  <div className={styles.no_users_icon}>📊</div>
                  <p>No {userType.label.toLowerCase()}s found for this selection.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StudentCourseAnalytics
