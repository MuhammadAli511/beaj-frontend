import { useState, useEffect, useMemo } from "react"
import { Navbar, Sidebar } from "../../components"
import styles from "./UsersData.module.css"
import { useSidebar } from "../../components/SidebarContext"
import CSVDownloader from "react-csv-downloader"
import { getAllMetadata, getStudentUserJourneyStats, getStudentTrialUserJourneyStats, getstudentAnalyticsStats, studentBarAnalyticsStats } from "../../helper/index"
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

// Register ChartJS components
ChartJS.register(RadialLinearScale, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, ChartDataLabels)

const UsersData = () => {
    const { isSidebarOpen } = useSidebar();
    const [userData, setUserData] = useState([]);
    const [studentUserData, setStudentUserData] = useState([]);
    const [studentStats, setStudentStats] = useState({});
    const [messageStats, setMessageStats] = useState({});
    const [activityTypeStats, setActivityTypeStats] = useState({});
    const [personaStats, setPersonaStats] = useState({});
    const [activeTab, setActiveTab] = useState('student');
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumberSearch, setPhoneNumberSearch] = useState('');
    const [graphData, setGraphData] = useState([]);
    const [sourceStats, setSourceStats] = useState({});

    const [userGroupPie, setUserGroupPie] = useState({ labels: [], data: [] });

    const [trialLevel1Data, setTrialLevel1Data] = useState({ labels: [], data: [] });
    const [trialLevel3Data, setTrialLevel3Data] = useState({ labels: [], data: [] });
    const [registrationType, setRegistrationType] = useState({ labels: [], data: [] });
    const [trialOpt, setTrialOpt] = useState({ labels: [], data: [] });
    const [cumuReg, setCumuReg] = useState({ labels: [], data: [] });
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


    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20; // Number of rows to display per page

    // Sorting state
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });

    // Date filter state
    const [dateFilter, setDateFilter] = useState({
        from: '',
        to: '',
        column: null
    });


    // Activity Type, Acceptable Messages, and Persona filters
    const [activityTypeFilter, setActivityTypeFilter] = useState(null);
    const [messageFilter, setMessageFilter] = useState(null);
    const [personaFilter, setPersonaFilter] = useState(null);
    const [sourceFilter, setSourceFilter] = useState(null);

    const dateColumnOptions = [
        { value: 'userClickedLink', label: 'Clicked Link' },
        { value: 'freeDemoStarted', label: 'Demo Started' },
        { value: 'freeDemoEnded', label: 'Demo Ended' },
        { value: 'userRegistrationComplete', label: 'Registration' }
    ];

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
    console.log(courseId, filters.grade.value, filters.cohort?.value, graphType)
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
      console.log(`Response for ${graphType}:`, response)
      if (response.status === 200 && response.data) {
        let labels = []
        let data1 = [],
          data2 = [],data3 = [],
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
            console.log(`Data for ${graphType}:`, lastLessonsTotal)
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
            console.log(`Data for ${graphType}:`, lastLessonsTotal1)
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
              console.log(`Graph3 Expected: ${expectedTotal}, Actual: ${actualTotal}`)
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
    if (activeTab === "analytics" && lastUpdatedGraph) {
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

  // Fetch all graphs data with default values when analytics tab is clicked
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
    if (activeTab === "analytics") {
      // When analytics tab is first clicked, fetch all graphs with default values
      fetchAllGraphsData()
    }
  }, [activeTab])

//   // Clear analytics filters for specific graph
//   const clearAnalyticsFilters = (graphType) => {
//     setAnalyticsFilters((prev) => ({
//       ...prev,
//       [graphType]: {
//         grade: null,
//         cohort: null,
//       },
//     }))

//     setCohortRanges((prev) => ({
//       ...prev,
//       [graphType]: { start: 1, end: 18 },
//     }))

//     setAnalyticsData((prev) => ({
//       ...prev,
//       [graphType]: { labels: [], data: [] },
//     }))
//   }


    // Utility function to format array data nicely
    const formatArrayForDisplay = (arr) => {
        if (!arr || !Array.isArray(arr) || arr.length === 0) return '';
        return arr.join(', ');
    };

    // Helper function to escape commas
    const escapeCommas = (field) => {
        if (!field) return field;
        // Convert to string to handle non-string types
        const str = String(field);
        // If the field contains a comma or a quote, wrap it in quotes and escape any existing quotes
        if (str.includes(",") || str.includes("\"")) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    // Generate options for persona filter
    const personaOptions = useMemo(() => {
        return Object.keys(personaStats).filter(persona => persona).map(persona => ({
            value: persona,
            label: persona
        }));
    }, [personaStats]);

    // Generate options for source filter
    const sourceOptions = useMemo(() => {
        return Object.keys(sourceStats).filter(source => source).map(source => ({
            value: source,
            label: source || 'Unknown'
        }));
    }, [sourceStats]);

    // Generate options for activity type filter
    const activityTypeOptions = useMemo(() => {
        return Object.keys(activityTypeStats).map(type => ({
            value: type,
            label: type || 'Unknown'
        }));
    }, [activityTypeStats]);

    // Generate options for acceptable messages filter
    const messageOptions = useMemo(() => {
        return Object.values(messageStats).map(stat => ({
            value: JSON.stringify(stat.messages),
            label: formatArrayForDisplay(stat.messages)
        }));
    }, [messageStats]);

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Sort data
    const sortedData = (data) => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === bValue) return 0;
            if (aValue === undefined || aValue === null || aValue === "") return 1;
            if (bValue === undefined || bValue === null || bValue === "") return -1;

            // For numeric fields (trial starts), use numeric comparison
            if (sortConfig.key === 'level1_trial_starts' || sortConfig.key === 'level3_trial_starts') {
                return sortConfig.direction === 'asc'
                    ? Number(aValue) - Number(bValue)
                    : Number(bValue) - Number(aValue);
            }

            // For date/string fields, use string comparison
            const comparison = aValue.toString().localeCompare(bValue.toString());
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    };

    // Filter data by all filters
    const filterData = (data) => {
        let filteredData = data;

        // Apply phone number search filter
        if (phoneNumberSearch.trim() !== '') {
            filteredData = filteredData.filter(item =>
                item.phoneNumber && item.phoneNumber.includes(phoneNumberSearch.trim())
            );
        }

        // Apply date filter
        if (dateFilter.column && dateFilter.from && dateFilter.to) {
            filteredData = filteredData.filter(item => {
                const date = new Date(item[dateFilter.column]);
                const fromDate = new Date(dateFilter.from);
                const toDate = new Date(dateFilter.to);
                toDate.setHours(23, 59, 59, 999); // Set to end of day (11:59:59.999 PM)

                return date >= fromDate && date <= toDate;
            });
        }

        // Apply activity type filter
        if (activityTypeFilter) {
            filteredData = filteredData.filter(item =>
                item.activityType === activityTypeFilter.value
            );
        }

        // Apply persona filter
        if (personaFilter) {
            filteredData = filteredData.filter(item =>
                item.persona === personaFilter.value
            );
        }

        // Apply source filter
        if (sourceFilter) {
            filteredData = filteredData.filter(item =>
                item.source === sourceFilter.value
            );
        }

        // Apply acceptable messages filter
        if (messageFilter) {
            const selectedMessages = JSON.parse(messageFilter.value);
            filteredData = filteredData.filter(item => {
                // Get the original message data rather than comparing the formatted strings
                // This ensures filtering works correctly with escaped CSV values
                const selectedMessagesStr = formatArrayForDisplay(selectedMessages);
                const itemMessagesStr = item.acceptableMessages;

                // Remove any CSV escaping before comparison
                const cleanSelectedStr = selectedMessagesStr.replace(/^"(.*)"$/, '$1').replace(/""/g, '"');
                const cleanItemStr = itemMessagesStr.replace(/^"(.*)"$/, '$1').replace(/""/g, '"');

                return cleanItemStr === cleanSelectedStr;
            });
        }

        return filteredData;
    };

    // Get processed data
    const getProcessedData = (data) => {
        const filteredData = filterData(data);
        return sortedData(filteredData);
    };

    // Get total record count
    const getTotalRecords = (data) => {
        return data.length;
    };

    // Get filtered record count
    const getFilteredRecords = (data) => {
        return filterData(data).length;
    };

    // Clear all filters
    const clearFilters = () => {
        setDateFilter({
            from: '',
            to: '',
            column: null
        });
        setActivityTypeFilter(null);
        setMessageFilter(null);
        setPersonaFilter(null);
        setSourceFilter(null);
        setPhoneNumberSearch('');
    };

    // Effect to reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [phoneNumberSearch, dateFilter, activityTypeFilter, messageFilter, personaFilter, sourceFilter, activeTab]);

    useEffect(() => {
        if (activeTab === 'teacher') {
            fetchTeacherData();
        } else if (activeTab === 'student') {
            fetchStudentData();
        } 
    }, [activeTab]);



    const fetchTeacherData = async () => {
        try {
            setIsLoading(true);
            const data = await getAllMetadata();
            const formattedData = data.data.map(user => ({
                ...user,
                userId: user.userId ? `${user.userId}` : "",
                phoneNumber: user.phoneNumber ? `${user.phoneNumber}` : "",
                name: escapeCommas(user.name),
                city: escapeCommas(user.city),
                targetGroup: escapeCommas(user.targetGroup ? `${user.targetGroup}` : ""),
                cohort: escapeCommas(user.cohort ? `${user.cohort}` : ""),
                isTeacher: user.isTeacher ? `${user.isTeacher}` : "",
                schoolName: escapeCommas(user.schoolName ? `${user.schoolName}` : ""),
                freeDemoStarted: user.freeDemoStarted ? escapeCommas(new Date(user.freeDemoStarted).toLocaleString().replace(",", "")) : "",
                freeDemoEnded: user.freeDemoEnded ? escapeCommas(new Date(user.freeDemoEnded).toLocaleString().replace(",", "")) : "",
                userClickedLink: user.userClickedLink ? escapeCommas(new Date(user.userClickedLink).toLocaleString().replace(",", "")) : "",
                userRegistrationComplete: user.userRegistrationComplete ? escapeCommas(new Date(user.userRegistrationComplete).toLocaleString().replace(",", "")) : ""
            }));
            setUserData(formattedData);
        } catch (error) {
            console.error("Error fetching teacher data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStudentData = async () => {
        try {
            setIsLoading(true);
            // Default date filter set to a future date to include all data
            const [response, response1] = await Promise.all([
                getStudentUserJourneyStats('2025-04-26 12:00:00'),
                getStudentTrialUserJourneyStats('2025-04-26 12:00:00')
            ]);

            if (response1.status === 200 && response1.data) {
                const userGroup = response1.data.userGroup;

                // Safely map known sources to custom labels
                const labelMap = {
                    'Unknown': "Can't Tell",
                    'Social Media ads': 'Social Media',
                    'Community': 'Community'
                };

                let labels = [];
                let data = [];

                userGroup.forEach(item => {
                    const label = labelMap[item.source] || item.source;
                    labels.push(label);
                    data.push(parseInt(item.user_count || '0'));
                });

                setUserGroupPie({ labels, data });

                const trialLevel1 = response1.data.lastActivityLevel1;
                const trialLevel3 = response1.data.lastActivityLevel3;

                labels = trialLevel1.map(item => item.lesson);
                data = trialLevel1.map(item => parseInt(item.count));

                setTrialLevel1Data({ labels, data });

                labels = trialLevel3.map(item => item.lesson);
                data = trialLevel3.map(item => parseInt(item.count));

                setTrialLevel3Data({ labels, data });

                const trialOptResp = response1.data.trialOpt?.[0];

                labels = ["Grade 1 or 2", "Grade 3 to 6", "Both"];
                data = [
                    parseInt(trialOptResp.course_117 || 0),
                    parseInt(trialOptResp.course_113 || 0),
                    parseInt(trialOptResp.both_courses || 0),
                ];

                setTrialOpt({ labels, data });

                const resgistrationTypeResp = response1.data.RegistrationType;
                labels = resgistrationTypeResp.map(item => item.persona);
                data = resgistrationTypeResp.map(item => parseInt(item.count));

                setRegistrationType({ labels, data });

                const cumuResp = response1.data.CumulativeReg;

                labels = cumuResp.map(item => {
                    if (!item.classLevel) return "Unknown";

                    return item.classLevel
                        .split(" ")
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");
                });
                data = cumuResp.map(item => parseInt(item.count));

                setCumuReg({ labels, data });
            }


            if (response.status === 200 && response.data) {
                // Format user data for table
                const formattedUserData = response.data.userData.map(user => {
                    // Determine current stage based on available data (for sorting)
                    let sortingStage;
                    let displayStage;

                    if (user.userRegistrationComplete) {
                        sortingStage = "Registration Complete";
                        displayStage = "Registration Complete";
                    } else if (user.freeDemoEnded) {
                        sortingStage = "Demo Ended";
                        displayStage = "Demo Ended";
                    } else if (user.freeDemoStarted) {
                        sortingStage = "Demo Started";
                        // For Demo Started, use the engagement_type as the display stage
                        displayStage = user.engagement_type || "Demo Started";
                    } else if (user.userClickedLink) {
                        sortingStage = "Clicked Link";
                        displayStage = "Clicked Link";
                    } else {
                        sortingStage = "Unknown";
                        displayStage = "Unknown";
                    }

                    // Determine demo type from engagement_type
                    const currentStage = user.engagement_type || "";

                    return {
                        phoneNumber: user.phoneNumber || "",
                        city: escapeCommas(user.city || ""),
                        userClickedLink: user.userClickedLink ? escapeCommas(new Date(user.userClickedLink).toLocaleString().replace(",", "")) : "",
                        freeDemoStarted: user.freeDemoStarted ? escapeCommas(new Date(user.freeDemoStarted).toLocaleString().replace(",", "")) : "",
                        currentStage: escapeCommas(currentStage),
                        freeDemoEnded: user.freeDemoEnded ? escapeCommas(new Date(user.freeDemoEnded).toLocaleString().replace(",", "")) : "",
                        userRegistrationComplete: user.userRegistrationComplete ? escapeCommas(new Date(user.userRegistrationComplete).toLocaleString().replace(",", "")) : "",
                        schoolName: escapeCommas(user.schoolName || ""),
                        persona: user.persona || "parent or student",
                        sortingStage: sortingStage,
                        level1_trial_starts: user.level1_trial_starts || 0,
                        level3_trial_starts: user.level3_trial_starts || 0,
                        activityType: escapeCommas(user.activityType || ""),
                        currentLessonId: escapeCommas(user.currentLessonId || ""),
                        currentLesson_sequence: escapeCommas(user.currentLesson_sequence || ""),
                        questionNumber: escapeCommas(user.questionNumber || ""),
                        acceptableMessages: user.acceptableMessages ? escapeCommas(formatArrayForDisplay(user.acceptableMessages)) : "",
                        last_message_content: user.last_message_content ? escapeCommas(formatArrayForDisplay(user.last_message_content)) : "",
                        last_message_timestamp: user.last_message_timestamp ? escapeCommas(new Date(user.last_message_timestamp).toLocaleString().replace(",", "")) : "",
                        source: escapeCommas(user.source ? `${user.source}` : "")
                    };
                });

                // Sort by funnel stage using the sortingStage field
                const sortedUserData = formattedUserData.sort((a, b) => {
                    const stageOrder = {
                        "Clicked Link": 1,
                        "Demo Started": 2,
                        "Demo Ended": 3,
                        "Registration Complete": 4,
                        "Unknown": 5
                    };

                    return stageOrder[a.sortingStage] - stageOrder[b.sortingStage];
                });

                setStudentUserData(sortedUserData);
                setStudentStats(response.data.stats || {});

                // Generate acceptableMessages statistics
                const messageStatsData = {};
                response.data.userData.forEach(user => {
                    if (user.acceptableMessages && user.acceptableMessages.length > 0) {
                        const messageKey = JSON.stringify(user.acceptableMessages);
                        if (!messageStatsData[messageKey]) {
                            messageStatsData[messageKey] = {
                                messages: user.acceptableMessages,
                                count: 0
                            };
                        }
                        messageStatsData[messageKey].count += 1;
                    }
                });
                setMessageStats(messageStatsData);

                // Generate activityType statistics
                const activityStatsData = {};
                response.data.userData.forEach(user => {
                    if (user.activityType) {
                        if (!activityStatsData[user.activityType]) {
                            activityStatsData[user.activityType] = 0;
                        }
                        activityStatsData[user.activityType] += 1;
                    }
                });
                setActivityTypeStats(activityStatsData);

                // Generate persona statistics
                const personaStatsData = {};
                response.data.userData.forEach(user => {
                    if (user.persona) {
                        if (!personaStatsData[user.persona]) {
                            personaStatsData[user.persona] = 0;
                        }
                        personaStatsData[user.persona] += 1;
                    }
                });
                setPersonaStats(personaStatsData);

                // Generate source statistics
                const sourceStatsData = {};
                response.data.userData.forEach(user => {
                    if (user.source) {
                        if (!sourceStatsData[user.source]) {
                            sourceStatsData[user.source] = 0;
                        }
                        sourceStatsData[user.source] += 1;
                    }
                });
                setSourceStats(sourceStatsData);

                // Update graphData
                setGraphData(response.data.graphData);
            }
        } catch (error) {
            console.error("Error fetching student data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Apply pagination to the processed data
    const getPaginatedData = (data) => {
        const processedData = getProcessedData(data);
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return processedData.slice(indexOfFirstItem, indexOfLastItem);
    };

    // Total pages calculation
    const getTotalPages = (data) => {
        return Math.ceil(filterData(data).length / itemsPerPage);
    };

    // Pagination component
    const Pagination = ({ data }) => {
        const totalPages = getTotalPages(data);

        const getPageNumbers = () => {
            const pageNumbers = [];
            const maxPagesToShow = 5;
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            if (totalPages - startPage < maxPagesToShow) {
                startPage = Math.max(1, totalPages - maxPagesToShow + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
            return pageNumbers;
        };

        return (
            <div className={styles.pagination}>
                <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={styles.pagination_button}
                >
                    1
                </button>

                {getPageNumbers()[0] > 2 && <span>...</span>}

                {getPageNumbers().map(number => (
                    number !== 1 && number !== totalPages && (
                        <button
                            key={number}
                            onClick={() => setCurrentPage(number)}
                            className={`${styles.pagination_button} ${currentPage === number ? styles.active : ''}`}
                        >
                            {number}
                        </button>
                    )
                ))}

                {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && <span>...</span>}

                {totalPages > 1 && (
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className={styles.pagination_button}
                    >
                        {totalPages}
                    </button>
                )}

                <span className={styles.page_info}>
                    ({getFilteredRecords(data)} total records)
                </span>
            </div>
        );
    };

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <h1>Users Data</h1>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab_button} ${activeTab === 'student' ? styles.active_tab : ''}`}
                        onClick={() => setActiveTab('student')}
                    >
                        Student Product
                    </button>
                    <button
                        className={`${styles.tab_button} ${activeTab === 'teacher' ? styles.active_tab : ''}`}
                        onClick={() => setActiveTab('teacher')}
                    >
                        Teacher Product
                    </button>
                     <button
                        className={`${styles.tab_button} ${activeTab === "analytics" ? styles.active_tab : ""}`}
                        onClick={() => setActiveTab("analytics")}
                    >
                        Analytics
                    </button>
                </div>

                {/* Date Filter Controls */}
                {activeTab === 'student' || activeTab === 'teacher' && (
                     <>
                <div className={styles.filters_container}>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Phone Number</label>
                        <input
                            type="text"
                            value={phoneNumberSearch}
                            onChange={(e) => setPhoneNumberSearch(e.target.value)}
                            placeholder="Search phone number"
                            className={styles.text_input}
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>From Date</label>
                        <input
                            type="date"
                            value={dateFilter.from}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                            className={styles.date_input}
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>To Date</label>
                        <input
                            type="date"
                            value={dateFilter.to}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                            className={styles.date_input}
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Filter Column</label>
                        <Select
                            className={styles.select}
                            options={dateColumnOptions}
                            value={dateColumnOptions.find(option => option.value === dateFilter.column)}
                            onChange={(option) => setDateFilter(prev => ({ ...prev, column: option?.value || null }))}
                            isClearable
                            placeholder="Select Column"
                        />
                    </div>
                    {activeTab === 'student' && (
                        <>
                            <div className={styles.filter_group}>
                                <label className={styles.filter_label}>Activity Type</label>
                                <Select
                                    className={styles.select}
                                    options={activityTypeOptions}
                                    value={activityTypeFilter}
                                    onChange={setActivityTypeFilter}
                                    isClearable
                                    placeholder="Select Activity Type"
                                />
                            </div>
                            <div className={styles.filter_group}>
                                <label className={styles.filter_label}>Persona</label>
                                <Select
                                    className={styles.select}
                                    options={personaOptions}
                                    value={personaFilter}
                                    onChange={setPersonaFilter}
                                    isClearable
                                    placeholder="Select Persona"
                                />
                            </div>
                            <div className={styles.filter_group}>
                                <label className={styles.filter_label}>Source</label>
                                <Select
                                    className={styles.select}
                                    options={sourceOptions}
                                    value={sourceFilter}
                                    onChange={setSourceFilter}
                                    isClearable
                                    placeholder="Select Source"
                                />
                            </div>
                            <div className={styles.filter_group}>
                                <label className={styles.filter_label}>Acceptable Messages</label>
                                <Select
                                    className={styles.select}
                                    options={messageOptions}
                                    value={messageFilter}
                                    onChange={setMessageFilter}
                                    isClearable
                                    placeholder="Select Message Type"
                                />
                            </div>
                            <div className={styles.filter_group}>
                                <button
                                    className={styles.clear_filters_button}
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </>
                    )}
                </div>
                

              
                <div className={styles.record_count_container}>
                    <div className={styles.record_count}>
                        {(dateFilter.column && dateFilter.from && dateFilter.to) || activityTypeFilter || messageFilter || phoneNumberSearch ? (
                            <>
                                Showing <span className={styles.filtered_count}>{getFilteredRecords(activeTab === 'teacher' ? userData : studentUserData)}</span>
                                <span className={styles.total_count}> of {getTotalRecords(activeTab === 'teacher' ? userData : studentUserData)} records</span>
                            </>
                        ) : (
                            <span className={styles.total_count}>Total records: {getTotalRecords(activeTab === 'teacher' ? userData : studentUserData)}</span>
                        )}
                    </div>
                </div>
                </>
                )}

                {activeTab === 'teacher' ? (
                    <>
                        <div className={styles.stats_summary}>
                            <CSVDownloader
                                datas={getProcessedData(userData)}
                                columns={[
                                    { id: 'userId', displayName: 'User ID' },
                                    { id: 'phoneNumber', displayName: 'Phone Number' },
                                    { id: 'name', displayName: 'Name' },
                                    { id: 'city', displayName: 'City' },
                                    { id: 'targetGroup', displayName: 'Target Group' },
                                    { id: 'cohort', displayName: 'Cohort' },
                                    { id: 'isTeacher', displayName: 'Is Teacher' },
                                    { id: 'schoolName', displayName: 'School Name' },
                                    { id: 'freeDemoStarted', displayName: 'Free Demo Started' },
                                    { id: 'freeDemoEnded', displayName: 'Free Demo Ended' },
                                    { id: 'userClickedLink', displayName: 'User Clicked Link' },
                                    { id: 'userRegistrationComplete', displayName: 'User Registration Complete' },
                                ]}
                                filename="teachers_data.csv"
                                className={styles.download_button}
                                text="Download CSV"
                            />
                        </div>

                        {isLoading ? (
                            <div className={styles.loader_container}>
                                <TailSpin color="#51bbcc" height={50} width={50} />
                            </div>
                        ) : (
                            <div className={styles.table_container}>
                                <table className={styles.table}>
                                    <thead className={styles.heading_row}>
                                        <tr>
                                            <th className={styles.table_heading}>User ID</th>
                                            <th className={styles.table_heading}>Phone Number</th>
                                            <th className={styles.table_heading}>Name</th>
                                            <th className={styles.table_heading}>City</th>
                                            <th className={styles.table_heading}>Target Group</th>
                                            <th className={styles.table_heading}>Cohort</th>
                                            <th className={styles.table_heading}>Teacher</th>
                                            <th className={styles.table_heading}>School Name</th>
                                            <th
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('freeDemoStarted')}
                                            >
                                                Free Demo Started
                                                {sortConfig.key === 'freeDemoStarted' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('freeDemoEnded')}
                                            >
                                                Free Demo Ended
                                                {sortConfig.key === 'freeDemoEnded' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('userClickedLink')}
                                            >
                                                User Clicked Link
                                                {sortConfig.key === 'userClickedLink' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('userRegistrationComplete')}
                                            >
                                                User Registration Complete
                                                {sortConfig.key === 'userRegistrationComplete' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.table_body}>
                                        {getPaginatedData(userData).map((user, index) => (
                                            <tr key={index}>
                                                <td>{user.userId || ""}</td>
                                                <td>{user.phoneNumber || ""}</td>
                                                <td>{user.name || ""}</td>
                                                <td>{user.city || ""}</td>
                                                <td>{user.targetGroup || ""}</td>
                                                <td>{user.cohort || ""}</td>
                                                <td>{user.isTeacher || ""}</td>
                                                <td>{user.schoolName || ""}</td>
                                                <td>{user.freeDemoStarted || ""}</td>
                                                <td>{user.freeDemoEnded || ""}</td>
                                                <td>{user.userClickedLink || ""}</td>
                                                <td>{user.userRegistrationComplete || ""}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Pagination data={userData} />
                            </div>
                        )}
                    </>
                ) : (
                    <>
                    {activeTab === 'student' && (
                    <>
                        {/* Stats Cards */}
                        <div className={styles.stats_cards}>
                            {isLoading ? (
                                <div className={styles.loader_container}>
                                    <TailSpin color="#51bbcc" height={50} width={50} />
                                </div>
                            ) : (
                                // Define specific order for stats cards
                                ['Clicked Link', 'Demo Started', 'Demo Ended', 'Registration Completed'].map((stage, index, stagesArray) => {
                                    const data = studentStats[stage] || { count: 0, percentage: 0, dropPercentage: 0 };

                                    // Calculate correct conversion and drop rates based on actual counts
                                    let conversionRate = 100; // Default for first stage
                                    let dropRate = 0;

                                    if (index > 0) {
                                        const previousStage = stagesArray[index - 1];
                                        const previousCount = studentStats[previousStage]?.count || 0;

                                        if (previousCount > 0) {
                                            conversionRate = ((data.count / previousCount) * 100).toFixed(2);
                                            dropRate = (100 - conversionRate).toFixed(2);
                                        } else {
                                            conversionRate = "0.00";
                                            dropRate = "100.00";
                                        }
                                    }

                                    return (
                                        <div key={stage} className={styles.stat_card}>
                                            <h3>{stage}</h3>
                                            <p className={styles.card_value}>{data.count}</p>
                                            <div className={styles.card_metrics}>
                                                <p className={styles.conversion_rate}>
                                                    Conversion: {conversionRate}%
                                                </p>
                                                <p className={styles.drop_rate}>
                                                    Drop: {dropRate}%
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Conversion Graph */}
                        {!isLoading && graphData && graphData.length > 0 && (
                            <div className={styles.graph_container}>
                                <h3>Daily Conversion Rates</h3>
                                <div className={styles.chart_wrapper}>
                                    <Line
                                        data={{
                                            labels: graphData.map(item => item.date),
                                            datasets: [
                                                {
                                                    label: 'Clicked Count',
                                                    data: graphData.map(item => parseInt(item.clicked_count)),
                                                    borderColor: '#4285F4',
                                                    backgroundColor: 'rgba(66, 133, 244, 0.1)',
                                                    tension: 0.3,
                                                    yAxisID: 'y',
                                                },
                                                {
                                                    label: 'Registered Count',
                                                    data: graphData.map(item => parseInt(item.registered_count)),
                                                    borderColor: '#34A853',
                                                    backgroundColor: 'rgba(52, 168, 83, 0.1)',
                                                    tension: 0.3,
                                                    yAxisID: 'y',
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            interaction: {
                                                mode: 'index',
                                                intersect: false,
                                            },
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Count'
                                                    }
                                                },
                                                x: {
                                                    title: {
                                                        display: true,
                                                        text: 'Date'
                                                    }
                                                }
                                            },
                                            plugins: {
                                                tooltip: {
                                                    callbacks: {
                                                        afterBody: (context) => {
                                                            const dataIndex = context[0].dataIndex;
                                                            return `Conversion: ${graphData[dataIndex].conversion_percentage}%`;
                                                        }
                                                    }
                                                },
                                                legend: {
                                                    position: 'top',
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* New Charts Section */}

                        {!isLoading && (
                            <div className={styles.charts_grid}>
                                {/* User Persona Pie Chart */}
                                <div className={styles.chart_container}>
                                    <h3>User Demographic Information</h3>
                                    <p>Distribution of users based on demographic categories.</p>
                                    <div className={styles.chart_wrapper}>
                                        <Pie
                                            data={{
                                                labels: userGroupPie.labels,
                                                datasets: [
                                                    {
                                                        data: userGroupPie.data,
                                                        backgroundColor: ["rgba(255, 159, 64, 0.6)", "rgba(75, 192, 192, 0.6)", "rgba(153, 102, 255, 0.6)", "rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)", "rgba(255, 206, 86, 0.6)"],
                                                        borderColor: ["rgba(255, 159, 64, 1)", "rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)", "rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)"],
                                                        borderWidth: 1,
                                                        boldness: 200,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: "bottom",
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => {
                                                                const label = context.label || ""
                                                                const value = context.raw || 0
                                                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0)
                                                                const percentage = ((value / total) * 100).toFixed(1)
                                                                return `${label}: ${value} (${percentage}%)`
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>


                                <div className={styles.chart_container}>
                                    <h3>Trial Opt-ins by Level</h3>
                                    <p>Highlights number of users opting in for trials at each grade.</p>
                                    <div className={styles.chart_wrapper}>
                                        <Bar
                                            data={{
                                                labels: trialOpt.labels,
                                                datasets: [
                                                    {
                                                        label: 'Trial Completions',
                                                        data: trialOpt.data,
                                                        backgroundColor: ['rgba(116, 243, 105, 0.6)', 'rgba(255, 205, 86, 0.6)', 'rgba(123, 198, 230, 0.6)'],
                                                        borderColor: ['rgba(116, 243, 105, 1)', 'rgba(255, 205, 86, 1)', 'rgb(110, 213, 244)'],
                                                        borderWidth: 1,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                indexAxis: 'y',
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: {
                                                    x: {
                                                        beginAtZero: true,
                                                        title: {
                                                            display: true,
                                                            text: 'No. of People',
                                                        },
                                                    },
                                                    y: {
                                                        title: {
                                                            display: true,
                                                            text: 'Trial Level',
                                                        },
                                                    },
                                                },
                                                plugins: {
                                                    legend: {
                                                        display: false,
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => `Opted: ${context.raw}`,
                                                        },
                                                    },
                                                },
                                            }}
                                        />

                                    </div>
                                </div>

                                {/* <div className={styles.charts_grid}> */}
                                {/* Trial Level Bar Chart */}
                                <div className={styles.chart_container}>
                                    <h3>Trial Grade 1 or 2 Drop Off</h3>
                                    <p>Shows drop-off rates for users in trial across different lessons.</p>
                                    <div className={styles.chart_wrapper}>
                                        <Bar
                                            data={{
                                                labels: trialLevel1Data.labels,
                                                datasets: [
                                                    {
                                                        label: "Level 1 Completions",
                                                        data: trialLevel1Data.data,
                                                        backgroundColor: ["rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)"],
                                                        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
                                                        borderWidth: 1,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        title: {
                                                            display: true,
                                                            text: "No. of People",
                                                        },
                                                    },
                                                    x: {
                                                        title: {
                                                            display: true,
                                                            text: "Lessons",
                                                        },
                                                    },
                                                },
                                                plugins: {
                                                    legend: {
                                                        display: false,
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => `Trials: ${context.raw}`,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className={styles.chart_container}>
                                    <h3>Trial Grade 3 to 6 Drop Off</h3>
                                    <p>Shows drop-off rates for users in trial across different lessons.</p>
                                    <div className={styles.chart_wrapper}>
                                        <Bar
                                            data={{
                                                labels: trialLevel3Data.labels,
                                                datasets: [
                                                    {
                                                        label: "Level 3 Completions",
                                                        data: trialLevel3Data.data,
                                                        backgroundColor: ["rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)"],
                                                        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
                                                        borderWidth: 1,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        title: {
                                                            display: true,
                                                            text: "No. of People",
                                                        },
                                                    },
                                                    x: {
                                                        title: {
                                                            display: true,
                                                            text: "Lessons",
                                                        },
                                                    },
                                                },
                                                plugins: {
                                                    legend: {
                                                        display: false,
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => `Trials: ${context.raw}`,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* </div> */}


                                <div className={styles.chart_container}>
                                    <h3>User Persona Distribution</h3>
                                    <p>Breakdown of users by different persona or registration types.</p>
                                    <div className={styles.chart_wrapper}>
                                        <Doughnut
                                            data={{
                                                labels: registrationType.labels,
                                                datasets: [
                                                    {
                                                        label: "Persona Count",
                                                        data: registrationType.data,
                                                        backgroundColor: [
                                                            "rgba(238, 130, 238, 0.6)",   // Red
                                                            "rgba(106, 90, 205, 0.6)",   // Blue
                                                            "rgba(255, 206, 86, 0.6)",   // Yellow
                                                        ],
                                                        borderColor: [
                                                            "rgba(238, 130, 238, 1)",
                                                            "rgba(106, 90, 205, 1)",
                                                            "rgba(255, 206, 86, 1)",
                                                        ],
                                                        borderWidth: 1,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: "bottom",
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => {
                                                                const value = context.raw;
                                                                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                                                const percentage = ((value / total) * 100).toFixed(1);
                                                                return `${context.label}: ${value} (${percentage}%)`;
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>


                                <div className={styles.chart_container}>
                                    <h3>Cumulative Registration Distribution</h3>
                                    <p>Shows overall registrations distributed across levels.</p>
                                    <div className={styles.chart_wrapper}>
                                        <Bar
                                            data={{
                                                labels: cumuReg.labels,
                                                datasets: [
                                                    {
                                                        label: "Level 3 Completions",
                                                        data: cumuReg.data,
                                                        backgroundColor: ["rgba(255, 99, 71, 0.6)", "rgba(60, 179, 113, 0.6)"],
                                                        borderColor: ["rgba(255, 99, 71, 1)", "rgba(60, 179, 113, 1)"],
                                                        borderWidth: 1,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        title: {
                                                            display: true,
                                                            text: "No. of People",
                                                        },
                                                    },
                                                    x: {
                                                        title: {
                                                            display: true,
                                                            text: "Lessons",
                                                        },
                                                    },
                                                },
                                                plugins: {
                                                    legend: {
                                                        display: false,
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => `Trials: ${context.raw}`,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>



                            </div>
                        )}



                        {/* Message Statistics */}
                        {!isLoading && Object.keys(messageStats).length > 0 && (
                            <div className={styles.stats_section}>
                                <h3>Users by Acceptable Messages</h3>
                                <div className={styles.stats_grid}>
                                    {Object.values(messageStats).sort((a, b) => b.count - a.count).map((stat, index) => (
                                        <div key={index} className={styles.message_stat_card}>
                                            <div className={styles.message_display}>
                                                {stat.messages.map((msg, i) => (
                                                    <span key={i} className={styles.message_item}>
                                                        {msg}
                                                        {i < stat.messages.length - 1 && <span className={styles.message_separator}>or</span>}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className={styles.stat_count}>
                                                {stat.count} users
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Persona Statistics */}
                        {!isLoading && Object.keys(personaStats).length > 0 && (
                            <div className={styles.stats_section}>
                                <h3>Users by Persona</h3>
                                <div className={styles.stats_grid}>
                                    {Object.entries(personaStats).filter(([persona]) => persona).sort((a, b) => b[1] - a[1]).map(([persona, count], index) => (
                                        <div key={index} className={styles.activity_stat_card}>
                                            <div className={styles.activity_badge}>
                                                {persona || 'Unknown'}
                                            </div>
                                            <div className={styles.stat_count}>
                                                {count} users
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Activity Type Statistics */}
                        {!isLoading && Object.keys(activityTypeStats).length > 0 && (
                            <div className={styles.stats_section}>
                                <h3>Users by Activity Type</h3>
                                <div className={styles.stats_grid}>
                                    {Object.entries(activityTypeStats).sort((a, b) => b[1] - a[1]).map(([type, count], index) => (
                                        <div key={index} className={styles.activity_stat_card}>
                                            <div className={styles.activity_badge}>
                                                {type || 'Unknown'}
                                            </div>
                                            <div className={styles.stat_count}>
                                                {count} users
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.stats_summary}>
                            <CSVDownloader
                                datas={getProcessedData(studentUserData)}
                                columns={[
                                    { id: 'phoneNumber', displayName: 'Phone Number' },
                                    { id: 'city', displayName: 'City' },
                                    { id: 'userClickedLink', displayName: 'Clicked Link' },
                                    { id: 'freeDemoStarted', displayName: 'Demo Started' },
                                    { id: 'freeDemoEnded', displayName: 'Demo Ended' },
                                    { id: 'userRegistrationComplete', displayName: 'Registration' },
                                    { id: 'source', displayName: 'Source' },
                                    { id: 'schoolName', displayName: 'School' },
                                    { id: 'persona', displayName: 'Persona' },
                                    { id: 'currentStage', displayName: 'Current Stage' },
                                    { id: 'level1_trial_starts', displayName: 'Level 1 Trials' },
                                    { id: 'level3_trial_starts', displayName: 'Level 3 Trials' },
                                    { id: 'activityType', displayName: 'Activity Type' },
                                    { id: 'currentLessonId', displayName: 'Current Lesson ID' },
                                    { id: 'currentLesson_sequence', displayName: 'Lesson Sequence' },
                                    { id: 'questionNumber', displayName: 'Question Number' },
                                    { id: 'acceptableMessages', displayName: 'Acceptable Messages' },
                                    { id: 'last_message_content', displayName: 'Last Message' },
                                    { id: 'last_message_timestamp', displayName: 'Last Message Time' }
                                ]}
                                filename="students_data.csv"
                                className={styles.download_button}
                                text="Download CSV"
                            />
                        </div>

                        {isLoading ? (
                            <div className={styles.loader_container}>
                                <TailSpin color="#51bbcc" height={50} width={50} />
                            </div>
                        ) : (
                            <div className={styles.table_container}>
                                <table className={styles.table}>
                                    <thead className={styles.heading_row}>
                                        <tr>
                                            <th className={styles.table_heading}>Phone Number</th>
                                            <th className={styles.table_heading}>City</th>
                                            <th
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('userClickedLink')}
                                            >
                                                Clicked Link
                                                {sortConfig.key === 'userClickedLink' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('freeDemoStarted')}
                                            >
                                                Demo Started
                                                {sortConfig.key === 'freeDemoStarted' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('freeDemoEnded')}
                                            >
                                                Demo Ended
                                                {sortConfig.key === 'freeDemoEnded' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('userRegistrationComplete')}
                                            >
                                                Registration
                                                {sortConfig.key === 'userRegistrationComplete' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th className={styles.table_heading}>Source</th>
                                            <th className={styles.table_heading}>School</th>
                                            <th className={styles.table_heading}>Persona</th>
                                            <th className={styles.table_heading}>Current Stage</th>
                                            <th
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('level1_trial_starts')}
                                            >
                                                Level 1 Trials
                                                {sortConfig.key === 'level1_trial_starts' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('level3_trial_starts')}
                                            >
                                                Level 3 Trials
                                                {sortConfig.key === 'level3_trial_starts' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th className={styles.table_heading}>Activity Type</th>
                                            <th className={styles.table_heading}>Current Lesson ID</th>
                                            <th className={styles.table_heading}>Lesson Sequence</th>
                                            <th className={styles.table_heading}>Question Number</th>
                                            <th className={styles.table_heading}>Acceptable Messages</th>
                                            <th className={styles.table_heading}>Last Message</th>
                                            <th
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('last_message_timestamp')}
                                            >
                                                Last Message Time
                                                {sortConfig.key === 'last_message_timestamp' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.table_body}>
                                        {getPaginatedData(studentUserData).map((user, index) => (
                                            <tr key={index} className={`${styles.table_row} ${styles[user.sortingStage.toLowerCase().replace(' ', '_')]}`}>
                                                <td className={styles.normal_text}>{user.phoneNumber}</td>
                                                <td className={styles.normal_text}>{user.city}</td>
                                                <td className={styles.normal_text}>{user.userClickedLink}</td>
                                                <td className={styles.normal_text}>{user.freeDemoStarted}</td>
                                                <td className={styles.normal_text}>{user.freeDemoEnded}</td>
                                                <td className={styles.normal_text}>{user.userRegistrationComplete}</td>
                                                <td className={styles.normal_text}>{user.source}</td>
                                                <td className={styles.normal_text}>{user.schoolName}</td>
                                                <td className={styles.normal_text}>{user.persona}</td>
                                                <td className={styles.normal_text}>{user.currentStage}</td>
                                                <td className={styles.normal_text}>{user.level1_trial_starts || 0}</td>
                                                <td className={styles.normal_text}>{user.level3_trial_starts || 0}</td>
                                                <td className={styles.normal_text}>{user.activityType || ''}</td>
                                                <td className={styles.normal_text}>{user.currentLessonId || ''}</td>
                                                <td className={styles.normal_text}>{user.currentLesson_sequence || ''}</td>
                                                <td className={styles.normal_text}>{user.questionNumber || ''}</td>
                                                <td className={styles.normal_text}>{user.acceptableMessages || ''}</td>
                                                <td className={styles.normal_text}>{user.last_message_content || ''}</td>
                                                <td className={styles.normal_text}>{user.last_message_timestamp || ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Pagination data={studentUserData} />
                            </div>
                        )}
                    </>
                    )}
                    </>
                )}

          {activeTab === "analytics" && (
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
            <div className={styles.analytics_grid}>
              {/* Graph 2 - Last Completed Activity Drop-off Rate */}
              <div className={styles.analytics_card}>
                <div className={styles.card_header}>
                  <div className={styles.card_title_section}>
                    <h3>Last Completed Activity - Drop-off Rate</h3>
                    {/* <p>Shows drop-off rates by last completed activity</p> */}
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
            <div className={styles.analytics_grid}>
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
          </>
        )}

        {/* Right Sidebar for clicked bar data */}
        {/* {rightSidebarOpen && (
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
                  <div className={styles.users_list}>
                    <div className={styles.users_count}>Total Users: {rightSidebarData.length}</div>
                    {rightSidebarData.map((user, index) => (
                      <div key={index} className={styles.user_item}>
                        <div className={styles.user_phone}>📱 {user.phoneNumber || "N/A"}</div>
                        {user.profile_id && <div className={styles.user_profile}>👤 Profile: {user.profile_id}</div>}
                        {user.name && <div className={styles.user_name}>📝 {user.name}</div>}
                        <div className={styles.user_class}>🎓 School: {user.schoolName || "N/A"}</div>
                       <div className={styles.user_class}>🎓 City: {user.city ||"N/A"}</div>
                        {clickedBarInfo?.type === "lesson" && user.city && (
                          <div className={styles.user_day}>📅 Day: {user.city}</div>
                        )}
                        {clickedBarInfo?.type === "activity" && user.lessonId && (
                          <div className={styles.user_lesson}>📚 Lesson: {user.lessonId}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.no_users}>
                    <p>No users found for this selection.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )} */}

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
                      <span className={styles.users_count_badge}>Total Users: {rightSidebarData.length} {gradeName} {cohortName}</span>
                    </div>
                    <div className={styles.table_wrapper}>
                      <table className={styles.users_table}>
                        <thead className={styles.table_header}>
                          <tr>
                            <th className={styles.table_th}>#</th>
                            <th className={styles.table_th}>Phone</th>
                            <th className={styles.table_th}>Name</th>
                            <th className={styles.table_th}>School</th>
                            <th className={styles.table_th}>City</th>
                            <th className={styles.table_th}>Cohort</th>
                            <th className={styles.table_th}>Customer Source</th>
                            <th className={styles.table_th}>Customer Channel</th>
                            <th className={styles.table_th}>Profile</th>
                            <th className={styles.table_th}>Class</th>
                            <th className={styles.table_th}>Rollout</th>
                            
                            {/* {clickedBarInfo?.type === "lesson" && <th className={styles.table_th}>Day</th>}
                            {clickedBarInfo?.type === "activity" && <th className={styles.table_th}>Lesson</th>} */}
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
                                  {/* <span className={styles.phone_icon}>📱</span> */}
                                  <span >
                                    {user.phoneNumber || "N/A"}
                                  </span>
                                </div>
                              </td>
                              <td className={styles.table_td}>
                                <div className={styles.name_cell}>
                                  {/* <span className={styles.name_icon}>👤</span> */}
                                  <span>{user.name|| "N/A"}</span>
                                </div>
                              </td>
                              <td className={styles.table_td}>
                                <div className={styles.school_cell}>
                                  {/* <span className={styles.school_icon}>🏫</span> */}
                                  <span >{user.schoolName || "N/A"}</span>
                                </div>
                              </td>
                               <td className={styles.table_td}>
                                <div className={styles.school_cell}>
                                  {/* <span className={styles.school_icon}>🏫</span> */}
                                  <span >{user.city || "N/A"}</span>
                                </div>
                              </td>
                               <td className={styles.table_td}>
                                <div className={styles.school_cell}>
                                  {/* <span className={styles.school_icon}>🏫</span> */}
                                  <span >{user.cohort || "N/A"}</span>
                                </div>
                              </td>
                               
                               <td className={styles.table_td}>
                                <div className={styles.school_cell}>
                                  {/* <span className={styles.school_icon}>🏫</span> */}
                                  <span >{user.customerSource || "N/A"}</span>
                                </div>
                              </td>
                              <td className={styles.table_td}>
                                <div className={styles.school_cell}>
                                  {/* <span className={styles.school_icon}>🏫</span> */}
                                  <span >{user.customerChannel || "N/A"}</span>
                                </div>
                              </td>
                              <td className={styles.table_td}>
                                <div className={styles.phone_cell}>
                                  {/* <span className={styles.phone_icon}>📱</span> */}
                                  <span >
                                    {user.profile_id || "N/A"}
                                  </span>
                                </div>
                              </td>
                              <td className={styles.table_td}>
                                <div className={styles.school_cell}>
                                  {/* <span className={styles.school_icon}>🏫</span> */}
                                  <span >{user.classLevel || "N/A"}</span>
                                </div>
                              </td>

                              <td className={styles.table_td}>
                                <div className={styles.phone_cell}>
                                  {/* <span className={styles.phone_icon}>📱</span> */}
                                  <span >
                                    {user.rollout || "N/A"}
                                  </span>
                                </div>
                              </td>

                              {/* <td className={styles.table_td}>
                                <div className={styles.school_cell}>
                                  
                                  <span >{user.city || "N/A"}</span>
                                </div>
                              </td> */}
                              
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
            </div>
        </div>
    );
};

export default UsersData;
