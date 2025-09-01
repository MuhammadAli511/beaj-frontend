"use client"

import { useState, useEffect } from "react"
import { Navbar, Sidebar } from "../../components"
import styles from "./ContentIngestor.module.css"
import { useSidebar } from "../../components/SidebarContext"
import { getAllCategories, getCoursesByCategoryId, validateSheetData, processIngestionData } from "../../helper"

const ContentIngestor = () => {
  const [categories, setCategories] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [tabName, setTabName] = useState("")
  const [sheetUrl, setSheetUrl] = useState("")
  const [logs, setLogs] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const { isSidebarOpen } = useSidebar()
  const userRole = typeof window !== "undefined" ? localStorage.getItem("role") : null

  // Helper function to extract spreadsheet ID from Google Sheets URL
  const extractSpreadsheetId = (url) => {
    const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  // Helper function to filter and sort courses
  const filterAndSortCourses = (coursesData) => {
    return coursesData
      .filter(
        (course) =>
          !course.CourseName.includes("2024") &&
          !course.CourseName.includes("Level 3 - T1 - January 27, 2025") &&
          !course.CourseName.includes("Level 3 - T2 - January 27, 2025") &&
          !course.CourseName.includes("Level 1 - T1 - January 27, 2025") &&
          !course.CourseName.includes("Level 1 - T2 - January 27, 2025") &&
          !course.CourseName.includes("Level 2 - T1 - February 24, 2025") &&
          !course.CourseName.includes("Level 2 - T2 - February 24, 2025") &&
          !course.CourseName.includes("Level 3 - T1 - April 7, 2025") &&
          !course.CourseName.includes("Level 3 - T2 - April 7, 2025") &&
          course.CourseName !== "Free Trial",
      )
      .sort((a, b) => a.CourseName.localeCompare(b.CourseName))
  }

  // Filter categories based on role
  const filterCategoriesByRole = (categoriesData) => {
    if (userRole === "kid-lesson-creator") {
      return categoriesData.filter((category) => category.CourseCategoryName === "Chatbot Courses - Kids")
    } else if (userRole === "teacher-lesson-creator") {
      return categoriesData.filter((category) => category.CourseCategoryName === "Chatbot Courses - Teachers")
    } else {
      return categoriesData.filter((category) => category.CourseCategoryName.includes("Chatbot"))
    }
  }

  useEffect(() => {
    const fetchCategoriesAndDefaultCourses = async () => {
      try {
        const categoriesResponse = await getAllCategories()
        if (categoriesResponse.status === 200) {
          const filteredCategories = filterCategoriesByRole(categoriesResponse.data)
          setCategories(filteredCategories)

          if (filteredCategories.length > 0) {
            const firstCategoryId = filteredCategories[0].CourseCategoryId
            setSelectedCategoryId(firstCategoryId)

            const coursesResponse = await getCoursesByCategoryId(firstCategoryId)
            if (coursesResponse.status === 200) {
              const filteredAndSortedCourses = filterAndSortCourses(coursesResponse.data)
              setCourses(filteredAndSortedCourses)

              if (filteredAndSortedCourses.length > 0) {
                setSelectedCourseId(filteredAndSortedCourses[0].CourseId)
              }
            } else {
              addLog(coursesResponse.data.message || "Failed to fetch courses", "error")
            }
          }
        } else {
          addLog(categoriesResponse.data.message || "Failed to fetch categories", "error")
        }
      } catch (error) {
        addLog(`Error fetching data: ${error.message}`, "error")
      }
    }

    fetchCategoriesAndDefaultCourses()
  }, [userRole])

  // Update courses when category changes
  useEffect(() => {
    const fetchCoursesForCategory = async () => {
      if (selectedCategoryId) {
        try {
          const coursesResponse = await getCoursesByCategoryId(selectedCategoryId)
          if (coursesResponse.status === 200) {
            const filteredAndSortedCourses = filterAndSortCourses(coursesResponse.data)
            setCourses(filteredAndSortedCourses)

            if (filteredAndSortedCourses.length > 0) {
              setSelectedCourseId(filteredAndSortedCourses[0].CourseId)
            } else {
              setSelectedCourseId("")
            }
          }
        } catch (error) {
          addLog(`Error fetching courses: ${error.message}`, "error")
        }
      }
    }

    fetchCoursesForCategory()
  }, [selectedCategoryId])

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, { message, type, timestamp }])
  }

const validateData = async () => {
  const sheetId = extractSpreadsheetId(sheetUrl)

  if (!sheetId) {
    addLog("Invalid Google Sheet URL. Please provide a valid Google Sheets URL.", "error")
    return false
  }

  try {
    addLog("Starting validation...", "info")

    const response = await validateSheetData({ sheetId, sheetTitle: tabName })

    if (response.status === 200) {
      addLog("Validation successful!", "success")

      // Show full response in logs
      if (response.data) {
        addLog(JSON.stringify(response.data, null, 2), "success")  // << 👈 stringify nicely
      }

      return true
    } else {
      addLog("Validation failed!", "error")

      if (response.data) {
        addLog(JSON.stringify(response.data, null, 2), "error")  // << 👈 stringify errors too
      }

      return false
    }
  } catch (error) {
    addLog(`Validation error: ${error.message}`, "error")
    return false
  }
}


const ingestContent = async () => {
  const sheetId = extractSpreadsheetId(sheetUrl)

  try {
    addLog("Starting content ingestion...", "info")

    const response = await processIngestionData({
      courseId: selectedCourseId,
      sheetId,
      sheetTitle: tabName,
    })

    if (response.status === 200) {
      addLog("Content ingestion completed successfully!", "success")

      if (response.data) {
        addLog(JSON.stringify(response.data, null, 2), "success")  // << 👈 stringify logs
      }
    } else {
      addLog("Content ingestion failed!", "error")

      if (response.data) {
        addLog(JSON.stringify(response.data, null, 2), "error")
      }
    }
  } catch (error) {
    addLog(`Ingestion error: ${error.message}`, "error")
  }
}


  const handleIngest = async () => {
    if (!selectedCategoryId || !selectedCourseId || !tabName || !sheetUrl) {
      addLog("Please fill in all fields before proceeding.", "error")
      return
    }

    setIsProcessing(true)
    setLogs([]) // Clear previous logs

    try {
      // const validationSuccess = await validateData()

      // if (validationSuccess) {
        await ingestContent()
      // }
    } finally {
      setIsProcessing(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className={styles.main_page}>
      <Navbar />
      {isSidebarOpen && <Sidebar />}
      <div className={styles.content}>
        <div className={styles.header}>
          <h2>Content Ingestor</h2>
        </div>

        <div className={styles.form_container}>
          <div className={styles.form_row}>
            <div className={styles.form_group}>
              <label htmlFor="category">Select Category:</label>
              <select
                id="category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className={styles.dropdown}
              >
                {categories.map((category) => (
                  <option key={category.CourseCategoryId} value={category.CourseCategoryId}>
                    {category.CourseCategoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.form_group}>
              <label htmlFor="course">Select Course:</label>
              <select
                id="course"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className={styles.dropdown}
              >
                {courses.map((course) => (
                  <option key={course.CourseId} value={course.CourseId}>
                    {course.CourseName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.form_group}>
            <label htmlFor="tabName">Google Sheet Tab Name:</label>
            <input
              type="text"
              id="tabName"
              value={tabName}
              onChange={(e) => setTabName(e.target.value)}
              placeholder="Enter tab name (e.g., Sheet1)"
              className={styles.text_input}
            />
          </div>

          <div className={styles.form_group}>
            <label htmlFor="sheetUrl">Google Sheet URL:</label>
            <textarea
              id="sheetUrl"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="Enter Google Sheet URL"
              className={styles.url_input}
              rows={3}
            />
          </div>

          <div className={styles.button_container}>
            <button onClick={handleIngest} disabled={isProcessing} className={styles.ingest_button}>
              {isProcessing ? "Processing..." : "Ingestor"}
            </button>
            {logs.length > 0 && (
              <button onClick={clearLogs} className={styles.clear_button}>
                Clear Logs
              </button>
            )}
          </div>
        </div>

        {logs.length > 0 && (
          <div className={styles.logs_container}>
            <h3>Process Logs</h3>
            <div className={styles.logs}>
              {logs.map((log, index) => (
                <div key={index} className={`${styles.log_entry} ${styles[log.type]}`}>
                  <span className={styles.timestamp}>[{log.timestamp}]</span>
                  <span className={styles.log_message}>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentIngestor
