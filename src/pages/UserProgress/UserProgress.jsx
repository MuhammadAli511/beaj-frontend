
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


const LeaderboardModal = ({ isOpen, onClose, targetGroup, cohort, viewType, leaderboardImages = [], loading }) => {
  const [selectedIndex, setSelectedIndex] = useState(leaderboardImages[0]?.columnIndex || null);

    useEffect(() => {
    if (leaderboardImages.length > 0) {
      setSelectedIndex(leaderboardImages[0].columnIndex);
    }
  }, [leaderboardImages]);

  if (!isOpen) return null;

  const getColumnLabel = (index) => {
  const week = ((index - 4) % 4) + 1;
  const level = Math.floor((index - 4) / 4) + 1;
  return `W${week} L${level}`;
};

  const selectedImage = leaderboardImages.find(item => item.columnIndex === selectedIndex)?.imageBase64;

  const handleDownload = () => {
    if (!selectedImage) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${selectedImage}`;
    link.download = `leaderboard-${targetGroup}-${cohort}-${viewType}-${getColumnLabel(selectedIndex)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!selectedImage) return;
    try {
      const response = await fetch(`data:image/png;base64,${selectedImage}`);
      const blob = await response.blob();
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      alert('Image copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy image:', error);
      alert('Your browser may not support this feature.');
    }
  };

  // const handleDownload = () => {
  //   if (!imageData) return

  //   const link = document.createElement("a")
  //   link.href = imageData
  //   link.download = `leaderboard-${targetGroup}-${cohort}-${viewType}.png`
  //   document.body.appendChild(link)
  //   link.click()
  //   document.body.removeChild(link)
  // }

  // const handleCopy = async () => {
  //   if (!imageData) return

  //   try {
  //     const response = await fetch(imageData);
  //     const blob = await response.blob();
  //     const item = new ClipboardItem({ 'image/png': blob });
  //     await navigator.clipboard.write([item]);

  //     alert('Image copied to clipboard! You can now paste it anywhere.')
  //   } catch (error) {
  //     console.error('Failed to copy image:', error)
  //     alert('Failed to copy image to clipboard. Your browser may not support this feature.')
  //   }
  // }

  return (
    <div className={styles.overlay_leader} onClick={onClose}>
      <div className={styles.modal_leader} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header_leader}>
          <h2>Leaderboard - {targetGroup} {cohort}</h2>
          <div className={styles.actions_leader}>
            {selectedImage && (
              <>
                <button className={styles.downloadButton_leader} onClick={handleDownload}>📥 Download</button>
                <button className={styles.copyButton_leader} onClick={handleCopy}>📋 Copy</button>
              </>
            )}
            <button className={styles.closeButton_leader} onClick={onClose}>❌</button>
          </div>
        </div>
       <div className={styles.chartControls}>
        <div className={styles.dropdownContainer}>
          {/* <label>Select Week: </label> */}
          {leaderboardImages.length > 0 && (
            <select
            className={styles.chartTypeSelect}
              // className={styles.select_leader}
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
            >
              {leaderboardImages.map(img => (
                <option key={img.columnIndex} value={img.columnIndex}>
                  {getColumnLabel(img.columnIndex)}
                </option>
              ))}
            </select>
          )}
        </div>
        </div>

        <div className={styles.content_leader}>
          {loading ? (
            <div className={styles.loading_leader}>
              <TailSpin color="#51bbcc" height={50} width={50} />
              <p>Loading leaderboard...</p>
            </div>
          ) : selectedImage ? (
            <img src={`data:image/png;base64,${selectedImage}`} alt="Leaderboard" className={styles.image_leader} />
          ) : (
            <div className={styles.error_leader}>
              <p>No leaderboard image found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
        L1: 8,
        L2: 13,
        L3: 18,
        Grand: 19,
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
        L1: 8, // L1 total is column 7
        L2: 13, // L2 total is column 12
        L3: 18, // L3 total is column 17
        Grand: 19, // Grand total is column 18
      }

      // Get the column index for the selected chart type
      const valueColumnIndex = columnIndices[chartType]
      const title = chartTypeIndices[chartType].title

      // Get usernames (column 3) and data for the selected level
      let processedData = userData.map((row) => {
        const username = row[3] || ""
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
  const [botType, setBotType] = useState("teacher");
  const [rollout, setRollout] = useState("2");
  const [targetGroup, setTargetGroup] = useState("");
  const [level, setLevel] = useState("");
  const [cohort, setCohort] = useState("");
  
  // State for tabs and search
  const [activeTab, setActiveTab] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data states
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Cohort range states
  const [cohortStartRange, setCohortStartRange] = useState(1);
  const [cohortEndRange, setCohortEndRange] = useState(20);
  
  // Leaderboard states
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardImage, setLeaderboardImage] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardBuffer, setLeaderboardBuffer] = useState('');
  const [leaderboardImages, setLeaderboardImages] = useState([]);
  
  // Activity chart state
  const [showActivityChart, setShowActivityChart] = useState(false);
  
  // Course IDs (will be set based on selections)
  const [courseIds, setCourseIds] = useState({
    courseId1: null,
    courseId2: null,
    courseId3: null,
    courseId4: null,
    courseId5: null
  });

  // Generate cohort options
  const cohortOptions = Array.from({ length: cohortEndRange - cohortStartRange + 1 }, 
    (_, i) => `Cohort ${i + cohortStartRange}`);

  // Reset cohort when target group or level changes
  useEffect(() => {
    setCohort("");
  }, [targetGroup, level]);

  // Set course IDs based on selections
  useEffect(() => {
    if (botType === "teacher") {
      if (rollout === "2"){
        //  setCourseIds({ courseId1: 134, courseId2: 135, courseId3: 136, courseId4: 139, courseId5: 140 });
          setCourseIds({ courseId1: 106, courseId2: 111, courseId3: 118, courseId4: 106, courseId5: 111 });
      }
      else if (targetGroup === "T1" && rollout === "1") {
        setCourseIds({ courseId1: 106, courseId2: 111, courseId3: 118, courseId4: 106, courseId5: 111 });
      } else if (targetGroup === "T2" && rollout === "1") {
        setCourseIds({ courseId1: 105, courseId2: 110, courseId3: 112, courseId4: 105, courseId5: 110 });
      }
      else if(targetGroup === "T1" && rollout === "0"){
         setCourseIds({ courseId1: 98, courseId2: 104, courseId3: 109, courseId4: null, courseId5: null });
      }
      else if(targetGroup === "T2" && rollout === "0"){
        setCourseIds({ courseId1: 99, courseId2: 103, courseId3: 108, courseId4: null, courseId5: null });
      }
    }
    // For students, we might need different course IDs based on level
    else if (botType === "student" && rollout === "1") {
      if (level === "class 1") {
        setCourseIds({ courseId1: 106, courseId2: 111, courseId3: 118, courseId4: 106, courseId5: 111 });
      } else if (level === "class 2") {
        setCourseIds({ courseId1: 105, courseId2: 110, courseId3: 112, courseId4: 105, courseId5: 110 });
      }
    }
  }, [botType, targetGroup, level, cohort, rollout, activeTab]);

  // Set cohort ranges based on selections
  useEffect(() => {
    if (botType === "teacher") {
      if (targetGroup === "T1") {
        setCohortStartRange(1);
        setCohortEndRange(20);
      } else if (targetGroup === "T2") {
        setCohortStartRange(25);
        setCohortEndRange(44);
      }
    } else if (botType === "student") {
      // Set cohort ranges for students
      setCohortStartRange(1);
      setCohortEndRange(20); // Adjust as needed
    }
  }, [botType, targetGroup]);

  // Clear user data
  const clearUserState = () => {
    setUserData([]);
    setFilteredData([]);
  };

  // Fetch data when required selections are made
  useEffect(() => {
    clearUserState();
    
    if ((botType === "teacher" && rollout && targetGroup && cohort && activeTab) || (botType === "teacher" && rollout === "2" && cohort && activeTab)  ||
        (botType === "student" && rollout && level && cohort && activeTab)) {
      const loadData = async () => {
        setLoading(true);
        try {
          const response = await getAlluserProgressByModule(
            botType,
            rollout,
            level,
            cohort,
            targetGroup,
            courseIds.courseId1,
            courseIds.courseId2,
            courseIds.courseId3,
            courseIds.courseId4,
            courseIds.courseId5,
            activeTab
          );

          if (response.status === 200) {
            const leaderboardArray = response.data.data.leaderboard || [];
            setLeaderboardImages(leaderboardArray);
            setLeaderboardBuffer(leaderboardArray[0]?.imageBase64 || null);
            let arrayList = response.data.data.array_list;
            let rows = arrayList.map(row => [...row]);
            setUserData(rows);
            setFilteredData(rows);
          } else {
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
  }, [botType, rollout, targetGroup, level, cohort, activeTab, courseIds]);

useEffect(() => {
  if (searchQuery.trim() === "") {
    setFilteredData(userData);
  } else {
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = userData.filter((user, index) => {
      // Skip the total row in assessment view (first row)
      if (activeTab === "assessment" && index === 0) {
        return true; // Keep the total row in filtered data
      }
      
      // Safely convert and search each field
      const profileId = (user[1] || "").toString().toLowerCase();
      const phoneNumber = (user[2] || "").toString().toLowerCase();
      const username = (user[3] || "").toString().toLowerCase();
      
      return (
        profileId.includes(query) ||
        phoneNumber.includes(query) ||
        username.includes(query)
      );
    });
    
    setFilteredData(filtered);
  }
}, [searchQuery, userData, activeTab]);


  // Handler functions
  const handleBotTypeChange = (e) => {
    setBotType(e.target.value);
    setTargetGroup("");
    setLevel("");
    setCohort("");
    setActiveTab("");
  };

  const handleRolloutChange = (e) => {
    setRollout(e.target.value);
    // Reset target group if changing from pilot to rollout or vice versa
    if (botType === "teacher") {
      setTargetGroup("");
    }
  };

  const handleTargetGroupChange = (e) => {
    setTargetGroup(e.target.value);
  };

  const handleLevelChange = (e) => {
    setLevel(e.target.value);
  };

  const handleCohortChange = (e) => {
    setCohort(e.target.value);
  };

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
  };

  const handleShowLeaderboard = async () => {

    if (leaderboardImages.length > 0) {
        setShowLeaderboard(true);
      } else {
        alert("No leaderboard images available");
      }

    if ((botType === "teacher" && !targetGroup) || !cohort) {
      alert("Please make all required selections first");
      return;
    }
    if (filteredData.length <= 0) {
      alert("No data available to display in leaderboard");
      return;
    }

    setLoadingLeaderboard(true);
    setShowLeaderboard(true);

    try {
      if (leaderboardBuffer) {
        const base64Image = `data:image/png;base64,${leaderboardBuffer}`;
        setLeaderboardImage(base64Image);
      } else {
        console.error("Failed to fetch leaderboard image");
        alert("Failed to load leaderboard. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      alert("Error loading leaderboard. Please try again.");
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const closeLeaderboard = () => {
    setShowLeaderboard(false);
  };

  const handleShowActivityChart = () => {
    if ((botType === "teacher" && !targetGroup) || !cohort) {
      alert("Please make all required selections first");
      return;
    }
    if (userData.length === 0) {
      alert("No data available to display in chart");
      return;
    }
    setShowActivityChart(true);
  };

  const closeActivityChart = () => {
    setShowActivityChart(false);
  };

  // Render lesson view table
  const renderLessonTable = () => {
    if(botType === "teacher"){
       return (
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th rowSpan={2}>Sr No.</th>
              <th rowSpan={2}>Profile Id</th>
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
                  if (colIndex === 8 || colIndex === 13 || colIndex === 18) cellClass = styles.totalCell;
                  else if (colIndex === 19) cellClass = styles.grandtotalCell;

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
    }
    else if(botType === "student"){
      return (
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th rowSpan={2}>Sr No.</th>
              <th rowSpan={2}>Profile Id</th>
              <th rowSpan={2}>Phone Number</th>
              <th rowSpan={2}>Username</th>
              <th colSpan={5} className={styles.groupHeader}>{level}</th>
            </tr>
            <tr>
              <th>Week1</th>
              <th>Week2</th>
              <th>Week3</th>
              <th>Week4</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow}>
                {row.map((cell, colIndex) => {
                  let cellClass = styles.centerText;

                  // Add specific classes based on the column index
                  if (colIndex === 8) cellClass = styles.totalCell;

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
  }
  };

  // Render week view table
  const renderWeekTable = () => {
    // Define the column indices for each week in each level
    const weekColumns = {
      level1: [4, 5, 6, 7], // Level 1: Week 1-4
      level2: [8, 9, 10, 11], // Level 2: Week 1-4
      level3: [12, 13, 14, 15], // Level 3: Week 1-4
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
    if(botType === "teacher"){
    return (
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th rowSpan={2}>Sr No.</th>
              <th rowSpan={2}>Profile Id</th>
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
  }

  // Render activity view table
  const renderActivityTable = () => {
    if(botType === "teacher"){
    return (
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th rowSpan={2}>Sr No.</th>
               <th rowSpan={2}>Profile Id</th>
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
                  if (colIndex === 8 || colIndex === 13 || colIndex === 18) cellClass = styles.totalCell;
                  else if (colIndex === 19) cellClass = styles.grandtotalCell;

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
  }
  else if(botType === "student"){
     return (
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th rowSpan={2}>Sr No.</th>
              <th rowSpan={2}>Profile Id</th>
              <th rowSpan={2}>Phone Number</th>
              <th rowSpan={2}>Username</th>
              <th colSpan={5} className={styles.groupHeader}>{level}</th>
            </tr>
            <tr>
              <th>Week1</th>
              <th>Week2</th>
              <th>Week3</th>
              <th>Week4</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow}>
                {row.map((cell, colIndex) => {
                  let cellClass = styles.centerText;

                  // Add specific classes based on the column index
                  if (colIndex === 8) cellClass = styles.totalCell;

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
  }
  };

//     // Render activity view table
//   const renderAssessmentTable = () => {
//     return (
//   <div className={styles.tableContainer}>
//     <table className={styles.dataTable}>
//       <thead>
//         <tr>
//           <th rowSpan={2}>Sr No.</th>
//           <th rowSpan={2}>Profile Id</th>
//           <th rowSpan={2}>Phone Number</th>
//           <th rowSpan={2}>Username</th>
//           <th colSpan={2} className={styles.groupHeader}>Pre-Assessment</th>
//           <th colSpan={2} className={styles.groupHeader}></th>
//           <th colSpan={2} className={styles.groupHeader}>Post-Assessment</th>
//         </tr>
//         <tr>
//           <th>MCQs</th>
//           <th>WatchAndSpeak</th>
//           <th></th>
//           <th></th>
//           <th>MCQs</th>
//           <th>WatchAndSpeak</th>
//         </tr>
//       </thead>
//       <tbody>
//         {filteredData.map((row, rowIndex) => (
//           <tr
//             key={rowIndex}
//             className={rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow}
//           >
//             {row.map((cell, colIndex) => {
//               let cellClass = styles.centerText;

//               // Add specific classes based on the column index
//               if (colIndex === 6 || colIndex === 7 || colIndex === 8 || colIndex === 9) {
//                 cellClass = styles.totalCell;
//               }

//               return (
//                 <td key={colIndex} className={cellClass}>
//                   {cell ?? ''}
//                 </td>
//               );
//             })}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );
// };

const renderAssessmentTable = () => {
  // Get total scores from first row of filteredData
  const totalScores = filteredData.length > 0 ? filteredData[0] : [];

  return (
    <div className={styles.tableContainer}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th rowSpan={2}>Sr No.</th>
            <th rowSpan={2}>Profile Id</th>
            <th rowSpan={2}>Phone Number</th>
            <th rowSpan={2}>Username</th>
            <th colSpan={3} className={styles.groupHeader}>Pre-Assessment</th>
            <th className={styles.spacerColumn}></th>
            <th colSpan={3} className={styles.groupHeader}>Post-Assessment</th>
          </tr>
          <tr>
            <th className={styles.activityHeader}>
              MCQs
              <br />
              <span className={styles.totalLabel}>Total: {totalScores[4] ?? 0}</span>
            </th>
            <th className={styles.activityHeader}>
              WatchAndSpeak
              <br />
              <span className={styles.totalLabel}>Total: {totalScores[5] ?? 0}</span>
            </th>
            <th className={styles.activityHeader}>
              Total Score
            </th>

            <th className={styles.spacerColumn}></th>

            <th className={styles.activityHeader}>
              MCQs
              <br />
              <span className={styles.totalLabel}>Total: {totalScores[8] ?? 0}</span>
            </th>
            <th className={styles.activityHeader}>
              WatchAndSpeak
              <br />
              <span className={styles.totalLabel}>Total: {totalScores[9] ?? 0}</span>
            </th>
            <th className={styles.activityHeader}>
              Total Score
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.slice(1).map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow}
            >
              {row.map((cell, colIndex) => {
                // Spacer column
                if (colIndex === 7) {
                  return <td key={colIndex} className={styles.spacerColumn}></td>;
                }

                // Style score columns
                const isScore = [4, 5, 8, 9].includes(colIndex);
                let cellClass = `${styles.centerText} ${
                  isScore ? styles.scoreCell : ''
                }`;

                if(colIndex === 6 || colIndex === 10){
                  cellClass = `${styles.totalScoreCell}`
                }
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
            {/* Bot Type Dropdown */}
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>Bot Type</label>
              <select
                className={styles.select}
                value={botType}
                onChange={handleBotTypeChange}
              >
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>

            {/* Rollout Dropdown */}
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>Rollout</label>
              <select
                className={styles.select}
                value={rollout}
                onChange={handleRolloutChange}
              >
                {botType === "teacher" && <option value="2">Rollout - 2</option>}
                <option value="1">Rollout - 1</option>
                {botType === "teacher" && <option value="0">Pilot - 0</option>}
              </select>
            </div>

            {/* Conditional Dropdowns */}
            {botType === "teacher" && (rollout === "1" || rollout === "0") && (
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>Target Group</label>
                <select
                  className={styles.select}
                  value={targetGroup}
                  onChange={handleTargetGroupChange}
                  disabled={!botType || !rollout}
                >
                  <option value="">Select target group</option>
                  <option value="T1">T1</option>
                  <option value="T2">T2</option>
                </select>
              </div>
            )}

            {botType === "student" && (
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>Level</label>
                <select
                  className={styles.select}
                  value={level}
                  onChange={handleLevelChange}
                >
                  <option value="">Select level</option>
                  <option value="class 1">Grade 1</option>
                  <option value="class 2">Grade 2</option>
                  <option value="class 3">Grade 3</option>
                  <option value="class 4">Grade 4</option>
                  <option value="class 5">Grade 5</option>
                  <option value="class 6">Grade 6</option>
                  <option value="class 7 and above">Grade 7</option>
                  <option value="class 8">Grade 8</option>
                </select>
              </div>
            )}

            {/* Cohort Dropdown */}
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>Cohort</label>
              <select
                className={styles.select}
                value={cohort}
                onChange={handleCohortChange}
               disabled={
                    (botType === "student" && !level) ||
                    (botType === "teacher" && (
                      ((rollout === "0" || rollout === "1") && !targetGroup) ||
                      (rollout !== "0" && rollout !== "1" && rollout !== "2")
                    ))
                  }
              >
                <option value="">Select cohort</option>
                {botType === "teacher" && rollout === "0" ? (
                  <option value="pilot">Pilot</option>
                ) : (
                  <>
                {cohortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                   </>)}

              </select>
            </div>
          </div>

          {/* Tabs for different views */}
          <div className={styles.tabsContainer}>
            <div
                  className={
                    botType === "student"
                    ? styles.tabs
                    : botType === "teacher" && rollout === "2"
                    ? styles.tabss
                    : styles.tabs
                  }
                >
              <button
                className={`${styles.tabButton} ${activeTab === "lesson" ? styles.activeTab : ""}`}
                onClick={() => handleTabChange("lesson")}
                disabled={!cohort}
              >
                Lesson View
              </button>
              {(botType === "teacher") && (
              <button
                className={`${styles.tabButton} ${activeTab === "week" ? styles.activeTab : ""}`}
                onClick={() => handleTabChange("week")}
                disabled={!cohort}
              >
                Week View
              </button>
              )}
              <button
                className={`${styles.tabButton} ${activeTab === "activity" ? styles.activeTab : ""}`}
                onClick={() => handleTabChange("activity")}
                disabled={!cohort}
              >
                Activity View
              </button>
              {((botType === "teacher" && rollout === "2") || botType === "student") && (
                <button
                  className={`${styles.tabButton} ${activeTab === "assessment" ? styles.activeTab : ""}`}
                  onClick={() => handleTabChange("assessment")}
                  disabled={!cohort}
                >
                  Assessment View
                </button>
              )}

            </div>
          </div>

          {/* Search bar and buttons */}
          
          <div className={styles.searchAndLeaderboard}>
            {activeTab && (
            <div className={styles.searchContainer}>
              <div className={styles.searchIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by username, profile id or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            )}

            {cohort && !loading && activeTab === "week" && (
              <button
                className={styles.leaderboardButton}
                onClick={handleShowLeaderboard}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.leaderboardIcon}>
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
                Leaderboard
              </button>
            )}

            {cohort && !loading && activeTab === "lesson" && (
              <button 
                className={styles.leaderboardButton} 
                onClick={handleShowActivityChart}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.leaderboardIcon}>
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
            {!cohort ? (
              <div className={styles.emptyState}>
                Please select {botType === "teacher" ? "bot type, rollout, target group" : "bot type, level"} and cohort to view data
              </div>
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
                {activeTab === "assessment" && renderAssessmentTable()}
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
          leaderboardImages={leaderboardImages}
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