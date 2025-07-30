import { useState, useEffect } from "react"
import { TailSpin } from "react-loader-spinner"
import Select from "react-select"
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2"
import ChartDataLabels from 'chartjs-plugin-datalabels';
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
  RadialLinearScale
} from "chart.js"
import { getstudentAnalyticsStats, studentBarAnalyticsStats } from "../../helper/index"
import styles from "./Analytics.module.css"

// Register ChartJS components
ChartJS.register(RadialLinearScale, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, ChartDataLabels)

const StudentCourseAnalytics = () => {
  const [lastUpdatedGraph, setLastUpdatedGraph] = useState(null);

  // Right sidebar states for clicked bar data
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [rightSidebarData, setRightSidebarData] = useState([])
  const [rightSidebarLoading, setRightSidebarLoading] = useState(false)
  const [rightSidebarTitle, setRightSidebarTitle] = useState("")
  const [clickedBarInfo, setClickedBarInfo] = useState(null)

  const [cohortName, setsetCohortName] = useState("")
  const [gradeName, setGradeName] = useState("")

  const defaultGrade = { label: "Grade 1", value: "grade 1" }
  const defaultCohort = { label: "Cohort 1", value: "Cohort 1" }
  const defaultAllGrade = { label: "All", value: "All" }
  const defaultAllCohort = { label: "All", value: "All" }

  // Analytics specific states
  const [graphLoadingStates, setGraphLoadingStates] = useState({
    graph1: false,
    graph2: false,
    graph3: false,
    graph4: false,
    graph5: false,
  })

  const [analyticsData, setAnalyticsData] = useState({
    graph1: { labels: [], data: [] },
    graph2: { labels: [], data: [] },
    graph3: { labels: [], data: [] },
    graph4: { labels: [], data1: [], data2: [], data3: [] },
    graph5: { labels: [], data: [] },
  })

  // State for total count and not started users for graph1 and graph2
  const [graphStats, setGraphStats] = useState({
    graph1: { totalCount: null, notStartedUsers: null },
    graph2: { totalCount: null, notStartedUsers: null },
    graph3: { totalCount: null, notStartedUsers: null },
    graph5: { totalCount: null, notStartedUsers: null },
  })

  const [cohortRanges, setCohortRanges] = useState({
    graph1: { start: 1, end: 18 },
    graph2: { start: 1, end: 18 },
    graph3: { start: 1, end: 18 },
    graph4: { start: 1, end: 18 },
    graph5: { start: 1, end: 18 },
  })

  const [courseIdMappings] = useState({
    "grade 1": 119,
    "grade 2": 120,
    "grade 3": 121,
    "grade 4": 122,
    "grade 5": 123,
    "grade 6": 124,
    "grade 7": 143,
  })

  const [analyticsFilters, setAnalyticsFilters] = useState({
    graph1: { grade: defaultGrade, cohort: defaultCohort },
    graph2: { grade: defaultGrade, cohort: defaultCohort },
    graph3: { grade: defaultAllGrade, cohort: defaultAllCohort },
    graph4: { grade: defaultGrade, cohort: defaultCohort },
    graph5: { grade: defaultGrade, cohort: defaultCohort },
  })

  // Analytics filter options
  const gradeOptions = [
    { value: "grade 1", label: "Grade 1" },
    { value: "grade 2", label: "Grade 2" },
    { value: "grade 3", label: "Grade 3" },
    { value: "grade 4", label: "Grade 4" },
    { value: "grade 5", label: "Grade 5" },
    { value: "grade 6", label: "Grade 6" },
    { value: "grade 7", label: "Grade 7" },
  ]

  // Grade options with "All" for graph3
  const getGradeOptions = (graphType) => {
    const baseOptions = [
      { value: "grade 1", label: "Grade 1" },
      { value: "grade 2", label: "Grade 2" },
      { value: "grade 3", label: "Grade 3" },
      { value: "grade 4", label: "Grade 4" },
      { value: "grade 5", label: "Grade 5" },
      { value: "grade 6", label: "Grade 6" },
      { value: "grade 7", label: "Grade 7" },
    ]

    if (graphType === "graph3") {
      return [{ value: "All", label: "All" }, ...baseOptions]
    }

    return baseOptions
  }

  // Dynamic cohort options based on grade selection
  const getCohortOptions = (graphType) => {
    const range = cohortRanges[graphType]
    if (!range || !range.start || !range.end) return []

    const options = []

    // For graph3, if grade is "All", only show "All" option for cohort
    if (graphType === "graph3" && analyticsFilters.graph3.grade?.value === "All") {
      options.push({
        value: "All",
        label: "All",
      })
      return options
    }

    // For other cases, show "All" plus numbered cohorts
    if (range.start === 0 && range.end === 0) {
      options.push({
        value: "All",
        label: "All",
      })
    } else {
      options.push({
        value: "All",
        label: "All",
      })
      for (let i = range.start; i <= range.end; i++) {
        options.push({
          value: `Cohort ${i}`,
          label: `Cohort ${i}`,
        })
      }
    }

    return options
  }

  // Update cohort range when grade is selected
  const updateCohortRange = (graphType, gradeValue) => {
    let newRange = { start: 1, end: 18 }

    switch (gradeValue) {
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
    }

    setCohortRanges((prev) => ({
      ...prev,
      [graphType]: newRange,
    }))
  }

  const getCourseId = (gradeValue) => {
    return courseIdMappings[gradeValue] || null;
  };

  // Handle grade filter change
  const handleGradeChange = (graphType, selectedGrade) => {
    setLastUpdatedGraph(graphType)

    // For graph3, if "All" is selected for grade, set cohort to "All" as well
    let newCohort = null
    if (graphType === "graph3" && selectedGrade?.value === "All") {
      newCohort = { label: "All", value: "All" }
    }

    setAnalyticsFilters((prev) => ({
      ...prev,
      [graphType]: {
        ...prev[graphType],
        grade: selectedGrade,
        cohort: newCohort,
      },
    }))

    if (selectedGrade && selectedGrade.value !== "All") {
      updateCohortRange(graphType, selectedGrade.value)
    } else {
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
  };

  // Function to handle bar clicks for lesson completed graph (graph1)
  const handleLessonBarClick = async (event, elements) => {
    if (elements.length === 0) return

    const clickedIndex = elements[0].index
    const dayNumberStr = analyticsData.graph1.labels[clickedIndex];
    const dayNumber = parseInt(dayNumberStr.split(' ')[1], 10);

    const filters = analyticsFilters.graph1

    if (!filters.grade || !filters.cohort) {
      alert("Please select both grade and cohort filters")
      return
    }

    setRightSidebarLoading(true)
    setRightSidebarOpen(true)
    setRightSidebarTitle(`Users on Day ${dayNumber}`)
    setClickedBarInfo({
      type: "lesson",
      dayNumber: dayNumber,
      grade: filters.grade.value,
      cohort: filters.cohort.value,
    })

    try {
      const courseId = getCourseId(filters.grade.value)
      const cohortValue = filters.cohort.value === "All" ? null : filters.cohort.value

      // Call API to get users by day
      const response = await studentBarAnalyticsStats(courseId, filters.grade.value, cohortValue, 'graph1', dayNumber)

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

  // Function to handle bar clicks for activity drop-off graph (graph2)
  const handleActivityBarClick = async (event, elements) => {
    if (elements.length === 0) return

    const clickedIndex = elements[0].index
    const lessonIdStr = analyticsData.graph2.labels[clickedIndex]
    const lessonId = parseInt(lessonIdStr, 10);
    const filters = analyticsFilters.graph2

    if (!filters.grade || !filters.cohort) {
      alert("Please select both grade and cohort filters")
      return
    }

    setRightSidebarLoading(true)
    setRightSidebarOpen(true)
    setRightSidebarTitle(`Users on Lesson ${lessonId}`)
    setClickedBarInfo({
      type: "activity",
      lessonId: lessonId,
      grade: filters.grade.value,
      cohort: filters.cohort.value,
    })

    try {
      const courseId = getCourseId(filters.grade.value)
      const cohortValue = filters.cohort.value === "All" ? null : filters.cohort.value

      // Call API to get users by lesson
      const response = await studentBarAnalyticsStats(courseId, filters.grade.value, cohortValue, 'graph2', lessonId)

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

  // Fetch data for specific graph when both grade and cohort are selected
  const fetchGraphData = async (graphType) => {
    const filters = analyticsFilters[graphType]
    if (!filters || !filters.grade) {
      return
    }
    // For graph3 and graph4, we only need grade filter
    if (graphType === "graph3" || graphType === "graph4") {
      // Graph3 and Graph4 only need grade filter
    } else {
      // For other graphs, we need both grade and cohort
      if (!filters.cohort) {
        return
      }
    }
    let courseId = null
    if (filters.grade.value !== "All") {
      courseId = getCourseId(filters.grade.value)
      if (!courseId) {
        console.error("No course ID found for grade:", filters.grade.value)
        return
      }
    }
    setGraphLoadingStates((prev) => ({
      ...prev,
      [graphType]: true,
    }))
    let cohortValue = filters.cohort?.value
    if (cohortValue && cohortValue === "All") {
      cohortValue = null
    }
    let gradeValue = filters.grade.value
    if (gradeValue === "All") {
      gradeValue = null
    }
    try {
      setsetCohortName(cohortValue);
      setGradeName(gradeValue);
      const response = await getstudentAnalyticsStats(courseId, gradeValue, cohortValue, graphType)
      if (response.status === 200 && response.data) {
        let labels = []
        let data1 = [],
          data2 = [], data3 = [],
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
            const [value1 = null, value2 = null] = lastLessonsTotal
            setGraphStats((prev) => ({
              ...prev,
              graph1: {
                totalCount: value1[0],
                notStartedUsers: value1[1],
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
            const [value4 = null, value3 = null] = lastLessonsTotal1
            setGraphStats((prev) => ({
              ...prev,
              graph2: {
                totalCount: value4[0],
                notStartedUsers: value4[1],
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
              setGraphStats((prev) => ({
                ...prev,
                graph3: {
                  totalCount: expectedTotal,
                  notStartedUsers: actualTotal,
                },
              }))
            }
            break
          case "graph4":
            if (response.data.lastLesson) {
              labels = response.data.lastLesson.map((item) => item.cohort)
              data1 = response.data.lastLesson.map((item) => {
                const val = Number.parseInt(item.total_users_in_cohort)
                return isNaN(val) ? null : val
              })
              data2 = response.data.lastLesson.map((item) => {
                const val = Number.parseInt(item.started_user_count)
                return isNaN(val) ? null : val
              })
              data3 = response.data.lastLesson.map((item) => {
                const val = Number.parseInt(item.not_started_user_count)
                return isNaN(val) ? null : val
              })
            }
            break
          case "graph5":
            if (response.data.lastLesson) {
              labels = ["Not Started", "Lagging Behind", "Up-to-date"]
              const firstRow = response.data.lastLesson[0]
              const val1 = Number.parseInt(firstRow.not_started_count) || null
              const val2 = Number.parseInt(firstRow.lagging_behind_count) || null
              const val3 = Number.parseInt(firstRow.up_to_date_count) || null
              // const val4 = Number.parseInt(firstRow.ahead_of_schedule_percent) || null
              data = [val1, val2, val3]
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
      if (lastUpdatedGraph === "graph3" || lastUpdatedGraph === "graph4") {
        // For graph3 and graph4, only need grade filter
        if (filters?.grade) {
          fetchGraphData(lastUpdatedGraph)
        }
      } else {
        // For other graphs, need both grade and cohort
        if (filters?.grade && filters?.cohort) {
          fetchGraphData(lastUpdatedGraph)
        }
      }
    }
  }, [analyticsFilters, lastUpdatedGraph])

  // Fetch all graphs data with default values when component mounts
  const fetchAllGraphsData = async () => {
    const graphTypes = ["graph1", "graph2", "graph3", "graph4", "graph5"]

    // Set all graphs to loading state first
    setGraphLoadingStates({
      graph1: true,
      graph2: true,
      graph3: true,
      graph4: true,
      graph5: false,
    })

    // Fetch graphs sequentially to optimize loading
    for (const graphType of graphTypes) {
      if (graphType === "graph3") {
        updateCohortRange(graphType, "All")
      } else {
        updateCohortRange(graphType, "grade 1")
      }
      await fetchGraphData(graphType)
    }
  }

  // Effect to handle analytics tab activation and filter changes
  useEffect(() => {
    // When component mounts, fetch all graphs with default values
    fetchAllGraphsData()
  }, [])

  return (
    <>
      <div className={styles.analytics_header}>
        {/* <h2>Analytics Dashboard</h2> */}
        {/* <p>Comprehensive insights into student performance and engagement metrics</p> */}
      </div>
      <div className={styles.analytics_grid}>
        {/* Graph 1 - Last Completed Lesson Drop-off Rate */}
        <div className={styles.analytics_card}>
          <div className={styles.card_header}>
            <div className={styles.card_title_section}>
              <h3>Last Completed Lesson - Drop-off Rate</h3>
              {/* <p>Shows drop-off rates by last completed lesson day</p> */}
              <div className={styles.stats_boxes}>
                <div className={styles.stat_box}>
                  <h4>Total Count</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph1.totalCount !== null ? graphStats.graph1.totalCount : "-"}
                  </p>
                </div>
                <div className={styles.stat_box}>
                  <h4>Not Started Users</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph1.notStartedUsers !== null ? graphStats.graph1.notStartedUsers : "-"}
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.card_filters}>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>Grade</label>
                <Select
                  className={styles.select}
                  options={gradeOptions}
                  value={analyticsFilters.graph1.grade}
                  onChange={(option) => handleGradeChange("graph1", option)}
                  isClearable
                  placeholder="Select Grade"
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
                      label: "Students Count",
                      data: analyticsData.graph1.data,
                      backgroundColor: "rgba(255, 205, 86, 0.8)",
                      borderColor: "rgba(255, 205, 86, 1)",
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
                        label: (context) => `Users: ${context.raw}`,
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

      {/* Graph 2 - Last Completed Activity Drop-off Rate (Full Row) */}
      <div className={styles.analytics_grid}>
        <div className={styles.analytics_card}>
          <div className={styles.card_header}>
            <div className={styles.card_title_section}>
              <h3>Last Completed Activity - Drop-off Rate</h3>
              <div className={styles.stats_boxes}>
                <div className={styles.stat_box}>
                  <h4>Total Count</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph2.totalCount !== null ? graphStats.graph2.totalCount : "-"}
                  </p>
                </div>
                <div className={styles.stat_box}>
                  <h4>Not Started Users</h4>
                  <p className={styles.stat_value}>
                    {graphStats.graph2.notStartedUsers !== null ? graphStats.graph2.notStartedUsers : "-"}
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.card_filters}>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>Grade</label>
                <Select
                  className={styles.select}
                  options={gradeOptions}
                  value={analyticsFilters.graph2.grade}
                  onChange={(option) => handleGradeChange("graph2", option)}
                  isClearable
                  placeholder="Select Grade"
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
                      label: "Students Completed",
                      data: analyticsData.graph2.data,
                      backgroundColor: "rgba(75, 192, 192, 0.8)",
                      borderColor: "rgba(75, 192, 192, 1)",
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
                        label: (context) => `Users: ${context.raw}`,
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

      {/* Graph 4 + Graph 5 - Two Graphs in One Row */}
      <div className={styles.analytics_grid}>
        {/* Graph 4 - Started vs Not Started By Cohorts */}
        <div className={styles.analytics_card}>
          <div className={styles.card_header}>
            <div className={styles.card_title_section}>
              <h3>Started vs Not Started By Cohorts</h3>
            </div>
            <div className={styles.card_filters}>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>Grade</label>
                <Select
                  className={styles.select}
                  options={gradeOptions}
                  value={analyticsFilters.graph4.grade}
                  onChange={(option) => handleGradeChange("graph4", option)}
                  isClearable
                  placeholder="Select Grade"
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
                        text: "No. of Students",
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

        {/* Graph 5 - Daily Completion Status */}
        <div className={styles.analytics_card}>
          <div className={styles.card_header}>
            <div className={styles.card_title_section}>
              <h3>Daily Completion Status</h3>
            </div>
            <div className={styles.card_filters}>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>Grade</label>
                <Select
                  className={styles.select}
                  options={gradeOptions}
                  value={analyticsFilters.graph5.grade}
                  onChange={(option) => handleGradeChange("graph5", option)}
                  isClearable
                  placeholder="Select Grade"
                />
              </div>
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
          <div className={styles.chart_wrapper}>
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
                      label: "Daily Completion Count",
                      data: analyticsData.graph5.data,
                      backgroundColor: [
                        "rgba(79, 234, 234, 0.8)",
                        "rgba(225, 225, 106, 0.8)",
                        "rgba(251, 176, 100, 0.8)",
                      ],
                      borderColor: [
                        "rgba(79, 234, 234, 0.8)",
                        "rgba(225, 225, 106, 1)",
                        "rgba(251, 176, 100, 0.8)",
                      ],
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
                  plugins: {
                    legend: {
                      display: false,
                    },
                    datalabels: {
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
                        text: "Completion Status",
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

      {/* Graph 3 - Daily Lesson Completion (Full Row) */}
      <div className={styles.analytics_grid}>
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
              </div>
            </div>
            <div className={styles.card_filters}>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>Grade</label>
                <Select
                  className={styles.select}
                  options={getGradeOptions("graph3")}
                  value={analyticsFilters.graph3.grade}
                  onChange={(option) => handleGradeChange("graph3", option)}
                  isClearable
                  placeholder="Select Grade"
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

      {/* Right Sidebar for clicked bar data */}
      {rightSidebarOpen && (
        <div className={styles.right_sidebar_overlay}>
          <div className={styles.right_sidebar}>
            <div className={styles.right_sidebar_header}>
              <h3>{rightSidebarTitle}</h3>
              <button
                className={styles.close_sidebar_button}
                onClick={closeRightSidebar}
              >
                ×
              </button>
            </div>
            <div className={styles.right_sidebar_content}>
              {rightSidebarLoading ? (
                <div className={styles.sidebar_loader}>
                  <TailSpin color="#51bbcc" height={30} width={30} />
                  <p>Loading users...</p>
                </div>
              ) : rightSidebarData.length > 0 ? (
                <div className={styles.sidebar_table_container}>
                  <table className={styles.sidebar_table}>
                    <thead className={styles.table_header}>
                      <tr>
                        <th className={styles.table_th}>#</th>
                        <th className={styles.table_th}>Phone</th>
                        <th className={styles.table_th}>Name</th>
                        <th className={styles.table_th}>School</th>
                        <th className={styles.table_th}>City</th>
                        <th className={styles.table_th}>Status</th>
                        <th className={styles.table_th}>Cohort</th>
                        <th className={styles.table_th}>Customer Source</th>
                        <th className={styles.table_th}>Customer Channel</th>
                        <th className={styles.table_th}>Profile</th>
                        <th className={styles.table_th}>Class</th>
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
                            <div className={styles.phone_cell}>
                              <span>
                                {user.phoneNumber || "N/A"}
                              </span>
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
                            <div className={styles.school_cell}>
                              <span>{user.city || "N/A"}</span>
                            </div>
                          </td>
                          <td className={styles.table_td}>
                            <div className={styles.phone_cell}>
                              <span
                                className={
                                  user.status === "Active"
                                    ? styles.status_active
                                    : styles.status_inactive
                                }
                              >
                                {user.status || "N/A"}
                              </span>
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
                            <div className={styles.phone_cell}>
                              <span>
                                {user.profile_id || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className={styles.table_td}>
                            <div className={styles.school_cell}>
                              <span>{user.classLevel || "N/A"}</span>
                            </div>
                          </td>
                          <td className={styles.table_td}>
                            <div className={styles.phone_cell}>
                              <span>
                                {user.rollout || "N/A"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.no_users}>
                  <div className={styles.no_users_icon}>📊</div>
                  <p>No users found for this selection.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentCourseAnalytics;