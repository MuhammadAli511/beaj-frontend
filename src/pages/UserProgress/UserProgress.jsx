
import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './UserProgress.module.css';
import { useSidebar } from '../../components/SidebarContext';
import { getAlluserProgressByModule } from '../../helper/index';
import { TailSpin } from 'react-loader-spinner';
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels)


const LeaderboardModal = ({ isOpen, onClose, targetGroup, cohort, viewType, imageData, loading }) => {
  if (!isOpen) return null

  const handleDownload = () => {
    if (!imageData) return

    const link = document.createElement("a")
    link.href = imageData
    link.download = `leaderboard-${targetGroup}-${cohort}-${viewType}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopy = async () => {
    if (!imageData) return

    try {
      const response = await fetch(imageData)
      const blob = await response.blob()
      const item = new ClipboardItem({ 'image/png': blob })
      await navigator.clipboard.write([item])

      alert('Image copied to clipboard! You can now paste it anywhere.')
    } catch (error) {
      console.error('Failed to copy image:', error)
      alert('Failed to copy image to clipboard. Your browser may not support this feature.')
    }
  }

  return (
    <div className={styles.overlay_leader} onClick={onClose}>
      <div className={styles.modal_leader} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header_leader}>
          <h2>
            Leaderboard - {targetGroup} {cohort}
          </h2>
          <div className={styles.actions_leader}>
            {imageData && (
              <>
                <button className={styles.downloadButton_leader} onClick={handleDownload}>
                  <span>📥</span>
                  Download
                </button>
                <button className={styles.copyButton_leader} onClick={handleCopy}>
                  <span>📋</span>
                  Copy
                </button>
              </>
            )}
            <button className={styles.closeButton_leader} onClick={onClose}>
              {/* × */}
              ❌
            </button>
          </div>
        </div>
        <div className={styles.content_leader}>
          {loading ? (
            <div className={styles.loading_leader}>
              <TailSpin color="#51bbcc" height={50} width={50} />
              <p>Loading leaderboard...</p>
            </div>
          ) : imageData ? (
            <img src={imageData || "/placeholder.svg"} alt="Leaderboard" className={styles.image_leader} />
          ) : (
            <div className={styles.error_leader}>
              <p>Failed to load leaderboard image.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ActivityChartModal = ({ isOpen, onClose, targetGroup, cohort, userData }) => {
  const [chartType, setChartType] = useState("L1")
  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState(null)
  const [chartOptions, setChartOptions] = useState(null)
  const chartRef = useRef(null)
  const chartContainerRef = useRef(null)
  const [optionFilter, setOptionFilter] = useState("all")
  const [thresholdValue, setThresholdValue] = useState(null)
  const [maxTotalLessons, setMaxTotalLessons] = useState(null)
  const [filteredCount, setFilteredCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  // Column indices for different chart types
  const chartTypeIndices = {
    L1: { title: "Level 1 Progress" },
    L2: { title: "Level 2 Progress" },
    L3: { title: "Level 3 Progress" },
    Grand: { title: "Grand Total Progress" },
  }

  // Function to determine the "Total Lessons" value based on the highest value in the dataset
  const getTotalLessonsValue = (maxValue) => {
    if (maxValue <= 6) return 6
    if (maxValue <= 12) return 12
    if (maxValue <= 18) return 18
    if (maxValue <= 24) return 24
    if (maxValue <= 48) return 48
    return 72
  }

  // Initialize threshold when modal opens or chart type changes
  useEffect(() => {
    if (isOpen && userData && userData.length > 0) {
      const columnIndices = {
        L1: 7,
        L2: 12,
        L3: 17,
        Grand: 18,
      }

      const valueColumnIndex = columnIndices[chartType]

      // Get all valid values for the current chart type
      const validValues = userData
        .map((row) => {
          const value = Number.parseInt(row[valueColumnIndex] || "")
          return isNaN(value) ? 0 : value
        })
        .filter((value) => value !== null)

      const maxValue = Math.max(...validValues, 6)
      const totalLessons = getTotalLessonsValue(maxValue)

      setMaxTotalLessons(totalLessons)
      setTotalCount(userData.length)

      // Set initial threshold to max total lessons if not already set
      if (thresholdValue === null) {
        setThresholdValue(totalLessons)
      }
    }
  }, [isOpen, chartType, userData])

  // Generate chart data and options
  const generateChart = () => {
    setLoading(true)

    try {
      // Map chart types to their corresponding column indices
      const columnIndices = {
        L1: 7, // L1 total is column 7
        L2: 12, // L2 total is column 12
        L3: 17, // L3 total is column 17
        Grand: 18, // Grand total is column 18
      }

      // Get the column index for the selected chart type
      const valueColumnIndex = columnIndices[chartType]
      const title = chartTypeIndices[chartType].title

      // Get usernames (column 2) and data for the selected level
      let processedData = userData.map((row) => {
        const username = row[2] || ""
        const value = Number.parseInt(row[valueColumnIndex] || "")

        return {
          name: username,
          value: isNaN(value) ? null : value,
        }
      })

      // Remove entries with null/undefined names
      processedData = processedData.filter((item) => item.name && item.name.trim() !== "")

      // Store original count
      const originalCount = processedData.length

      // Apply filtering based on threshold and option filter
      if (thresholdValue !== null && thresholdValue > 0) {
        processedData = processedData.filter((item) => {
          switch (optionFilter) {
            case "all":
              return item.value <= thresholdValue
            case "update":
              return item.value === thresholdValue
            case "lagging":
              return item.value < thresholdValue
            default:
              return true
          }
        })
      }

      // Update filtered count
      setFilteredCount(processedData.length)

      // Find the maximum value for setting the scale
      const maxValue = Math.max(...processedData.map((item) => item.value), 6)
      const totalLessonsValue = maxTotalLessons || getTotalLessonsValue(maxValue)

      // Add "Total Lessons" as the first item
      processedData.unshift({
        name: "Total Lessons",
        value: thresholdValue,
        isTotal: true,
      })

      // Create chart data object with consistent styling
      const data = {
        labels: processedData.map((item) => item.name),
        datasets: [
          {
            label: "Lessons Completed",
            data: processedData.map((item) => item.value),
            backgroundColor: processedData.map((item) => {
              if (item.name === "Total Lessons") return "#4CD964" // Green for Total Lessons
              if (item.isEmpty) return "#ff6b6b" // Red for empty state
              return "#51bbcc" // Blue for others
            }),
            borderColor: processedData.map((item) => {
              if (item.name === "Total Lessons") return "#3CB371"
              if (item.isEmpty) return "#ff5252"
              return "#3da7b8"
            }),
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
          },
        ],
      }

      // Create chart options object with consistent formatting
      const options = {
        indexAxis: "y", // This makes the bar chart horizontal
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            right: 50, // Add padding for value labels
          },
        },
        plugins: {
          legend: {
            display: false, // Hide legend
          },
          title: {
            display: true,
            text: `${title}`,
            font: {
              size: 18,
              weight: "bold",
            },
            padding: {
            },
          },
          subtitle: {
            display: true,
            text: `Showing ${filteredCount} of ${totalCount} users | Threshold: ${thresholdValue || "None"} | Filter: ${optionFilter}`,
            font: {
              size: 14,
              // style: "italic",
            },
            color: "#666",
            padding: {
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => `Lessons: ${context.raw}`,
            },
          },
          datalabels: {
            display: true,
            align: "end",
            anchor: "end",
            color: "#333",
            font: {
              weight: "bold",
              size: 12,
            },
            formatter: (value) => value,
            padding: {
              left: 10,
            },
            clamp: true,
            clip: false,
          },
        },
        scales: {
          y: {
            title: {
              display: true,
              text: "Names",
              font: {
                weight: "bold",
              },
              padding: {
                bottom: 10,
              },
            },
            ticks: {
              font: {
                size: 11,
              },
              autoSkip: false,
              maxRotation: 0,
            },
            grid: {
              display: false,
            },
          },
          x: {
            title: {
              display: true,
              text: "Lessons Completed",
              font: {
                weight: "bold",
              },
              padding: {
                top: 10,
              },
            },
            beginAtZero: true,
            max: thresholdValue, // Consistent max value
            grid: {
              display: true,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              color: "#e5e7eb",
            },
            ticks: {
              stepSize: thresholdValue <= 24 ? 5 : 12, // Consistent step size
            },
          },
        },
      }

      // Update state with chart data and options
      setChartData(data)
      setChartOptions(options)
    } catch (error) {
      console.error("Error generating chart:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOptionFilterChange = (e) => {
    setOptionFilter(e.target.value)
  }

  const handleChartTypeChange = (e) => {
    setChartType(e.target.value)
    // Reset threshold when chart type changes
    setThresholdValue(null)
  }

  const handleThresholdChange = (e) => {
    const value = e.target.value
    if (/^\d*$/.test(value)) {
      setThresholdValue(value ? Number.parseInt(value) : null)
    }
  }

  const handleDownload = () => {
    if (!chartRef.current) return

    try {
      const chartCanvas = chartRef.current.canvas
      if (!chartCanvas) {
        console.error("Canvas not found")
        alert("Unable to download chart. Canvas not found.")
        return
      }

      const tempCanvas = document.createElement("canvas")
      const tempCtx = tempCanvas.getContext("2d")

      tempCanvas.width = chartCanvas.width
      tempCanvas.height = chartCanvas.height

      tempCtx.fillStyle = "white"
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

      tempCtx.drawImage(chartCanvas, 0, 0)

      const imageUrl = tempCanvas.toDataURL("image/png", 1.0)

      const link = document.createElement("a")
      link.href = imageUrl
      link.download = `${chartTypeIndices[chartType].title}-${targetGroup}-${cohort}-${optionFilter}-${thresholdValue || "all"}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading chart:", error)
      alert("Failed to download chart. Please try again.")
    }
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  const handleCopy = async () => {
    if (!chartRef.current) return

    try {
      const chartCanvas = chartRef.current.canvas
      if (!chartCanvas) {
        console.error("Canvas not found")
        alert("Unable to copy chart. Canvas not found.")
        return
      }

      const tempCanvas = document.createElement("canvas")
      const tempCtx = tempCanvas.getContext("2d")

      tempCanvas.width = chartCanvas.width
      tempCanvas.height = chartCanvas.height

      tempCtx.fillStyle = "white"
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

      tempCtx.drawImage(chartCanvas, 0, 0)

      const imageUrl = tempCanvas.toDataURL("image/png", 1.0)

      const blob = await (await fetch(imageUrl)).blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ])

      alert("Chart copied to clipboard! You can now paste it anywhere.")
    } catch (error) {
      console.error("Error copying chart:", error)
      alert("Failed to copy chart. Please try again.")
    }
  }

  // Generate chart when dependencies change
  useEffect(() => {
    if (isOpen && userData && userData.length > 0 && maxTotalLessons !== null) {
      generateChart()
    }
  }, [isOpen, chartType, userData, optionFilter, thresholdValue, maxTotalLessons])

  // Early return if modal is not open
  if (!isOpen) return null

  return (
    <div className={styles.overlay_chart} onClick={onClose}>
      <div className={styles.modal_chart} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header_chart}>
          <h2>
            Progress Chart - {targetGroup} {cohort}
          </h2>
          <div className={styles.actions_chart}>
            {chartData && (
              <>
                <button className={styles.downloadButton_chart} onClick={handleDownload}>
                  <span>📥</span>
                  Download
                </button>
                <button className={styles.copyButton_chart} onClick={handleCopy}>
                  <span>📋</span>
                  Copy
                </button>
              </>
            )}
            <button className={styles.closeButton_chart} onClick={onClose}>
              ❌
            </button>
          </div>
          <div className={styles.chartControls}>
            <input
              type="number"
              className={styles.searchInput}
              placeholder={`Max threshold (${maxTotalLessons || "Loading..."})`}
              min="1"
              max={maxTotalLessons || 72}
              step="1"
              value={thresholdValue || ""}
              onChange={handleThresholdChange}
            />
            <select className={styles.chartTypeSelect} value={chartType} onChange={handleChartTypeChange}>
              <option value="L1">L1 Progress Chart</option>
              <option value="L2">L2 Progress Chart</option>
              <option value="L3">L3 Progress Chart</option>
              <option value="Grand">Grand Total Chart</option>
            </select>
            <select className={styles.chartTypeSelect} value={optionFilter} onChange={handleOptionFilterChange}>
              <option value="all">All</option>
              <option value="update">Up-to-date</option>
              <option value="lagging">Lagging Behind</option>
            </select>
          </div>
        </div>
        <div className={styles.content_chart}>
          {loading ? (
            <div className={styles.loading_chart}>
              <TailSpin color="#51bbcc" height={50} width={50} />
              <p>Generating chart...</p>
            </div>
          ) : chartData && chartOptions ? (
            <div className={styles.chartContainer} ref={chartContainerRef}>
              <Bar
                data={chartData}
                options={chartOptions}
                ref={chartRef}
                height={600}
                width={800}
              />
            </div>
          ) : (
            <div className={styles.noChartData}>
              <p>No chart data available. Please check your data or try a different selection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const UserProgress = () => {
  const { isSidebarOpen } = useSidebar();
  // State for dropdown selections
  const [targetGroup, setTargetGroup] = useState("");
  const [cohort, setCohort] = useState("");
  const [botType, setBotType] = useState("teacher");
  const [rollout, setRollout] = useState("1");

  // State for tabs and search
  const [activeTab, setActiveTab] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [cohortStartRange, setCohortStartRange] = useState('');
  const [cohortEndRange, setCohortEndRange] = useState('');

  // Leaderboard states
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardImage, setLeaderboardImage] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const [leaderboardBuffer, setLeaderboardBuffer] = useState('');
  const [showActivityChart, setShowActivityChart] = useState(false);


  let courseId1 = 106, courseId2 = 111, courseId3 = 118;



  // Generate cohort options
  const cohortOptions = Array.from({ length: cohortEndRange - cohortStartRange + 1 }, (_, i) => `Cohort ${i + cohortStartRange}`);

  // Reset cohort when target group changes
  useEffect(() => {
    setCohort("");

  }, [targetGroup]);

  if (targetGroup == "T1" && botType == "teacher") {
    courseId1 = 106; courseId2 = 111; courseId3 = 118;
  }
  else if (targetGroup == "T2" && botType == "teacher") {

    courseId1 = 105; courseId2 = 110; courseId3 = 112;
  }

  const clearUserState = () => {
    setUserData([]);
    setFilteredData([]);
  }

  // Fetch data when both dropdowns are filled
  useEffect(() => {
    clearUserState();
    if (targetGroup && cohort && activeTab && botType) {
      const loadData = async () => {
        setLoading(true);
        try {
          const response = await getAlluserProgressByModule(courseId1, courseId2, courseId3, targetGroup, activeTab, cohort);

          if (response.status === 200) {
            setLeaderboardBuffer(response.data.data.leaderboard);
            let arrayList = response.data.data.array_list;
            let rows = arrayList.map(row => [...row]);
            setUserData(rows);
            setFilteredData(rows);
          }
          else {
            console.error("Error fetching data:", response);
          }
        } catch (error) {
          console.error("Failed to fetch user progress data:", error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [targetGroup, cohort, activeTab, botType]);

  // Filter data based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(userData);
    } else {
      const filtered = userData.filter(
        (user) =>
          user[2]?.toLowerCase().includes(searchQuery.toLowerCase()) || // username (3rd column)
          user[1]?.includes(searchQuery) // phoneNumber (2nd column)
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, userData]);

  // Handle dropdown changes
  const handleTargetGroupChange = (e) => {
    setTargetGroup(e.target.value);
    if (e.target.value === "T1" && botType === "teacher") {
      setCohortEndRange(20); // Set range for T1
      setCohortStartRange(1);
    }
    else if (e.target.value === "T2" && botType === "teacher") {
      setCohortEndRange(44);
      setCohortStartRange(25); // Set range for T2
    }
    else if (e.target.value === "T1" && botType === "student") {
    }
    else if (e.target.value === "T2" && botType === "student") {
    }

  };

  const handleRolloutChange = (e) => {
    setRollout(e.target.value);
  }
  const handleBotTypeChange = (e) => {
    setBotType(e.target.value);
  }

  const handleCohortChange = (e) => {
    setCohort(e.target.value);
  };

  // Handle tab changes
  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
  };

  // Handle leaderboard display
  const handleShowLeaderboard = async () => {
    if (!targetGroup || !cohort) {
      alert("Please select both target group and cohort first")
      return
    }
    if (filteredData.length <= 0) {
      alert("No data available to display in leaderboard. Please try a different selection.")
      return
    }

    setLoadingLeaderboard(true)
    setShowLeaderboard(true)

    try {
      // get leaderboard image buffer
      if (leaderboardBuffer) {
        const base64Image = `data:image/png;base64,${leaderboardBuffer}`
        setLeaderboardImage(base64Image)
      } else {
        console.error("Failed to fetch leaderboard image")
        alert("Failed to load leaderboard. Please try again.")
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      alert("Error loading leaderboard. Please try again.")
    } finally {
      setLoadingLeaderboard(false)
    }
  }

  // Close leaderboard modal
  const closeLeaderboard = () => {
    setShowLeaderboard(false)
  }

  // Inside your UserProgress component, add this function to handle showing the activity chart
  const handleShowActivityChart = () => {
    if (!targetGroup || !cohort) {
      alert("Please select both target group and cohort first")
      return
    }

    if (userData.length === 0) {
      alert("No data available to display in chart. Please try a different selection.")
      return
    }

    setShowActivityChart(true)
  }

  // Add this function to close the activity chart
  const closeActivityChart = () => {
    setShowActivityChart(false)
  }

  // Render lesson view table
  const renderLessonTable = () => {
    return (
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th rowSpan={2}>Sr No.</th>
              <th rowSpan={2}>Phone Number</th>
              <th rowSpan={2}>Username</th>
              <th colSpan={5} className={styles.groupHeader}>Level 1</th>
              <th colSpan={5} className={styles.groupHeader}>Level 2</th>
              <th colSpan={5} className={styles.groupHeader}>Level 3</th>
            </tr>
            <tr>
              <th>Week1</th>
              <th>Week2</th>
              <th>Week3</th>
              <th>Week4</th>
              <th>Total</th>
              <th>Week1</th>
              <th>Week2</th>
              <th>Week3</th>
              <th>Week4</th>
              <th>Total</th>
              <th>Week1</th>
              <th>Week2</th>
              <th>Week3</th>
              <th>Week4</th>
              <th>Total</th>
              <th>Grand</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow}>
                {row.map((cell, colIndex) => {
                  let cellClass = styles.centerText;

                  // Add specific classes based on the column index
                  if (colIndex === 7 || colIndex === 12 || colIndex === 17) cellClass = styles.totalCell;
                  else if (colIndex === 18) cellClass = styles.grandtotalCell;

                  return (
                    <td key={colIndex} className={cellClass}>
                      {cell ?? ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render week view table
  const renderWeekTable = () => {
    // Define the column indices for each week in each level
    const weekColumns = {
      level1: [3, 4, 5, 6], // Level 1: Week 1-4
      level2: [7, 8, 9, 10], // Level 2: Week 1-4
      level3: [11, 12, 13, 14], // Level 3: Week 1-4
    }

    // Function to get color based on rank
    const getColorClass = (rank) => {
      if (rank === 1) return styles.goldMedal
      if (rank === 2) return styles.silverMedal
      if (rank === 3) return styles.bronzeMedal
      return ""
    }

    // Calculate rankings for each column
    const columnRankings = {}

    // Process each column group (level1, level2, level3)
    Object.keys(weekColumns).forEach((level) => {
      // Process each week column in the level
      weekColumns[level].forEach((colIndex) => {
        // Extract all values for this column, ignoring empty or non-numeric values
        const columnValues = filteredData
          .map((row) => {
            const value = row[colIndex]
            // Extract numeric value from percentage string (e.g., "85%" -> 85)
            if (typeof value === "string" && value.includes("%")) {
              return Number.parseInt(value, 10)
            }
            return null
          })
          .filter((val) => val !== null && !isNaN(val))

        // Sort values in descending order
        const sortedValues = [...new Set(columnValues)].sort((a, b) => b - a)

        // Create a mapping of value to rank
        const rankMap = {}
        sortedValues.forEach((value, index) => {
          rankMap[value] = index + 1
        })

        // Store rankings for this column
        columnRankings[colIndex] = rankMap
      })
    })

    return (
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th rowSpan={2}>Sr No.</th>
              <th rowSpan={2}>Phone Number</th>
              <th rowSpan={2}>Username</th>
              <th colSpan={4} className={styles.groupHeader}>
                Level 1
              </th>
              <th colSpan={4} className={styles.groupHeader}>
                Level 2
              </th>
              <th colSpan={4} className={styles.groupHeader}>
                Level 3
              </th>
            </tr>
            <tr>
              <th>Week1</th>
              <th>Week2</th>
              <th>Week3</th>
              <th>Week4</th>
              <th>Week1</th>
              <th>Week2</th>
              <th>Week3</th>
              <th>Week4</th>
              <th>Week1</th>
              <th>Week2</th>
              <th>Week3</th>
              <th>Week4</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow}>
                {row.map((cell, colIndex) => {
                  let cellClass = styles.centerText

                  // Apply medal colors for week columns
                  if ([...weekColumns.level1, ...weekColumns.level2, ...weekColumns.level3].includes(colIndex)) {
                    // Extract numeric value from percentage string
                    if (typeof cell === "string" && cell.includes("%")) {
                      const numericValue = Number.parseInt(cell, 10)
                      if (!isNaN(numericValue) && columnRankings[colIndex] && columnRankings[colIndex][numericValue]) {
                        const rank = columnRankings[colIndex][numericValue]
                        if (rank <= 3) {
                          cellClass = `${cellClass} ${getColorClass(rank)}`
                        }
                      }
                    }
                  }

                  return (
                    <td key={colIndex} className={cellClass}>
                      {cell ?? ""}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Render activity view table
  const renderActivityTable = () => {
    return (
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th rowSpan={2}>Sr No.</th>
              <th rowSpan={2}>Phone Number</th>
              <th rowSpan={2}>Username</th>
              <th colSpan={5} className={styles.groupHeader}>Level 1</th>
              <th colSpan={5} className={styles.groupHeader}>Level 2</th>
              <th colSpan={5} className={styles.groupHeader}>Level 3</th>
            </tr>
            <tr>
              <th>Week1</th>
              <th>Week2</th>
              <th>Week3</th>
              <th>Week4</th>
              <th>Total</th>
              <th>Week1</th>
              <th>Week2</th>
              <th>Week3</th>
              <th>Week4</th>
              <th>Total</th>
              <th>Week1</th>
              <th>Week2</th>
              <th>Week3</th>
              <th>Week4</th>
              <th>Total</th>
              <th>Grand</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow}>
                {row.map((cell, colIndex) => {
                  let cellClass = styles.centerText;

                  // Add specific classes based on the column index
                  if (colIndex === 7 || colIndex === 12 || colIndex === 17) cellClass = styles.totalCell;
                  else if (colIndex === 18) cellClass = styles.grandtotalCell;

                  return (
                    <td key={colIndex} className={cellClass}>
                      {cell ?? ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={styles.main_page}>
      <Navbar />
      {isSidebarOpen && <Sidebar />}
      <div className={styles.content}>
        <h1>User Progress</h1>
        <div className={styles.container}>
          <div className={styles.filterSection}>

            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>Bot Type</label>
              <select
                className={styles.select}
                value={botType}
                onChange={handleBotTypeChange}
                default={botType}
              >
                <option value="">Select bot type</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>


            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>Rollout</label>
              <select
                className={styles.select}
                value={rollout}
                onChange={handleRolloutChange}
                default={rollout}
              >
                <option value="">Select rollout</option>
                <option value="1">Rollout - 1</option>
                {(botType === "teacher") && (
                  <option value="0">Pilot - 0</option>
                )}
              </select>
            </div>

            {botType !== "student" && (
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>Target Group</label>
                <select
                  className={styles.select}
                  value={targetGroup}
                  onChange={handleTargetGroupChange}
                  disabled={!botType}
                >
                  <option value="">
                    {!botType ? "Select bot type first" : "Select target group"}
                  </option>
                  <option value="T1">T1</option>
                  <option value="T2">T2</option>
                  {/* <option value="Control">Control</option> */}
                </select>
              </div>
            )}


            {/* Second dropdown - Cohort (enabled only when target group is selected) */}
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>Cohort</label>
              <select
                className={styles.select}
                value={cohort}
                onChange={handleCohortChange}
                disabled={!targetGroup && botType == "teacher"}
              >
                <option value="">
                  {(!targetGroup && botType == "teacher") ? "Select target group first" : "Select cohort"}
                </option>
                {cohortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabs for different views */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tabButton} ${activeTab === "lesson" ? styles.activeTab : ""}`}
                onClick={() => handleTabChange("lesson")}
                disabled={!cohort}
              >
                Lesson View
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === "week" ? styles.activeTab : ""}`}
                onClick={() => handleTabChange("week")}
                disabled={!cohort}
              >
                Week View
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === "activity" ? styles.activeTab : ""}`}
                onClick={() => handleTabChange("activity")}
                disabled={!cohort}
              >
                Activity View
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === "assessment" ? styles.activeTab : ""}`}
                onClick={() => handleTabChange("assessment")}
                disabled={!cohort}
              >
                Assessment View
              </button>
            </div>
          </div>

          {/* Search bar and Leaderboard button */}
          <div className={styles.searchAndLeaderboard}>
            <div className={styles.searchContainer}>
              <div className={styles.searchIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by username or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {targetGroup && cohort && !loading && activeTab == "week" && (
              <button
                className={styles.leaderboardButton}
                onClick={handleShowLeaderboard}
                disabled={!targetGroup || !cohort}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.leaderboardIcon}
                >
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
                Leaderboard
              </button>
            )}


            {targetGroup && cohort && !loading && activeTab === "lesson" && (
              <button className={styles.leaderboardButton} onClick={handleShowActivityChart} disabled={!targetGroup || !cohort}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.leaderboardIcon}
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                Progress Chart
              </button>
            )}
          </div>

          {/* Content area */}
          <div className={styles.contentArea}>
            {!targetGroup || !cohort || !botType || activeTab == "" ? (
              <div className={styles.emptyState}>Please select bot type, target group and cohort to view data</div>
            ) : loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className={styles.emptyState}>No data found for the selected criteria</div>
            ) : (
              <>
                {activeTab === "lesson" && renderLessonTable()}
                {activeTab === "week" && renderWeekTable()}
                {activeTab === "activity" && renderActivityTable()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={closeLeaderboard}
          targetGroup={targetGroup}
          cohort={cohort}
          viewType={activeTab}
          imageData={leaderboardImage}
          loading={loadingLeaderboard}
        />
      )}
      {/* Activity Chart Modal */}
      {showActivityChart && (
        <ActivityChartModal
          isOpen={showActivityChart}
          onClose={closeActivityChart}
          targetGroup={targetGroup}
          cohort={cohort}
          userData={userData}
        />
      )}
    </div>
  );
};

export default UserProgress;