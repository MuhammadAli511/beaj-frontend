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
  const [isProcessing, setIsProcessing] = useState(false)
  
  // New state for multi-stage flow
  const [currentStage, setCurrentStage] = useState("form") // form, validation, confirmation, processing, results
  const [validationResults, setValidationResults] = useState(null)
  const [processingResults, setProcessingResults] = useState(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

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
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching data: ${error.message}`)
      }
    }

    fetchCategoriesAndDefaultCourses()
  }, [userRole]) // eslint-disable-line react-hooks/exhaustive-deps

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
          console.error(`Error fetching courses: ${error.message}`)
        }
      }
    }

    fetchCoursesForCategory()
  }, [selectedCategoryId])

  const validateData = async () => {
    const sheetId = extractSpreadsheetId(sheetUrl)

    if (!sheetId) {
      console.error("Invalid Google Sheet URL. Please provide a valid Google Sheets URL.")
      return false
    }

    try {

      const response = await validateSheetData({ courseId: selectedCourseId, sheetId, sheetTitle: tabName });

      if (response.status === 200) {
        const responseData = response.data.result;
        
        // Store validation results for the new UI
        setValidationResults(responseData)
        
        // Check if there are errors that prevent processing
        const hasErrors = responseData.errors && responseData.errors.length > 0
        
        if (!hasErrors) {
          // Move to validation results stage
          setCurrentStage("validation")
          return true
        } else {
          // Still show validation stage but with errors
          setCurrentStage("validation")
          return false
        }
      } else {
        console.error("Validation failed!", response.data)
        return false
      }
    } catch (error) {
      console.error(`Validation error: ${error.message}`)
      return false
    }
  }


  const ingestContent = async () => {
    const sheetId = extractSpreadsheetId(sheetUrl)
    const courseId = selectedCourseId

    try {
      setCurrentStage("processing")

      const response = await processIngestionData({
        courseId,
        sheetId,
        sheetTitle: tabName,
      })

      if (response.status === 200) {
        const responseData = response.data.result;
        // Pass the complete response data including any errors
        setProcessingResults(responseData)
        setCurrentStage("results")
      } else {
        setProcessingResults({ error: true, message: response.data })
        setCurrentStage("results")
      }
    } catch (error) {
      setProcessingResults({ error: true, message: error.message })
      setCurrentStage("results")
    }
  }


  const handleIngest = async () => {
    if (!selectedCategoryId || !selectedCourseId || !tabName || !sheetUrl) {
      return
    }

    setIsProcessing(true)

    try {
      await validateData()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmProcessing = async () => {
    setShowConfirmDialog(false)
    setIsProcessing(true)
    try {
      await ingestContent()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBackToForm = () => {
    setCurrentStage("form")
    setValidationResults(null)
    setProcessingResults(null)
  }

  const handleProceedWithProcessing = () => {
    setShowConfirmDialog(true)
  }

  // Component for Validation Results Page
  const ValidationResultsPage = () => {
    if (!validationResults) return null

    const { stats, errors, activities } = validationResults
    const hasErrors = errors && errors.length > 0

    return (
      <div className={styles.validation_container}>
        <div className={styles.header}>
          <h2>Validation Results</h2>
        </div>

        {/* Stats Cards */}
        <div className={styles.stats_grid}>
          <div className={styles.stat_card}>
            <div className={styles.stat_number}>{stats?.totalActivities || 0}</div>
            <div className={styles.stat_label}>Activities Found</div>
          </div>
          <div className={styles.stat_card}>
            <div className={styles.stat_number}>{stats?.activitiesToProcess || 0}</div>
            <div className={styles.stat_label}>Marked for Processing</div>
          </div>
          <div className={styles.stat_card}>
            <div className={styles.stat_number}>{stats?.toCreate || 0}</div>
            <div className={styles.stat_label}>New Activities to Create</div>
          </div>
          <div className={styles.stat_card}>
            <div className={styles.stat_number}>{stats?.toUpdate || 0}</div>
            <div className={styles.stat_label}>Existing to Update</div>
          </div>
          <div className={styles.stat_card}>
            <div className={styles.stat_number}>{stats?.toDelete || 0}</div>
            <div className={styles.stat_label}>Outdated to Remove</div>
          </div>
        </div>

        {/* Activity Breakdown Table */}
        {activities && activities.length > 0 && (
          <div className={styles.activity_breakdown}>
            <div className={styles.breakdown_header}>
              <h3>Activity Breakdown</h3>
              <div className={styles.status_legend}>
                <div className={styles.legend_item}>
                  <span className={`${styles.legend_color} ${styles.create}`}></span>
                  <span>CREATE</span>
                </div>
                <div className={styles.legend_item}>
                  <span className={`${styles.legend_color} ${styles.update}`}></span>
                  <span>UPDATE</span>
                </div>
                <div className={styles.legend_item}>
                  <span className={`${styles.legend_color} ${styles.skip}`}></span>
                  <span>SKIP</span>
                </div>
              </div>
            </div>
            <div className={styles.table_container}>
              <table className={styles.activity_table}>
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Day</th>
                    <th>Seq</th>
                    <th>Activity Type</th>
                    <th>Start Row</th>
                    <th>End Row</th>
                    <th>Status</th>
                    <th>Alias</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity, index) => (
                    <tr key={index} className={`${styles.activity_row} ${styles[activity.status?.toLowerCase() || 'default']}`}>
                      <td>{activity.week}</td>
                      <td>{activity.day}</td>
                      <td>{activity.seq}</td>
                      <td>{activity.activityType}</td>
                      <td>{activity.startRow}</td>
                      <td>{activity.endRow}</td>
                      <td>
                        <span className={`${styles.status_badge} ${styles[activity.status?.toLowerCase() || 'default']}`}>
                          {activity.status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className={styles.alias_cell}>{activity.alias}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error Section */}
        {hasErrors && (
          <div className={styles.error_section}>
            <h3>Issues Found</h3>
            <div className={styles.error_box}>
              {errors.map((error, index) => (
                <div key={index} className={styles.error_message}>
                  {typeof error === 'object' ? error.message || JSON.stringify(error) : error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.action_buttons}>
          <button onClick={handleBackToForm} className={styles.back_button}>
            Back to Form
          </button>
          {hasErrors ? (
            <button disabled className={styles.proceed_button_disabled}>
              Fix issues first
            </button>
          ) : (
            <button onClick={handleProceedWithProcessing} className={styles.proceed_button}>
              Proceed with Processing
            </button>
          )}
        </div>
      </div>
    )
  }

  // Component for Confirmation Dialog
  const ConfirmationDialog = () => {
    if (!showConfirmDialog || !validationResults) return null

    const { stats } = validationResults

    return (
      <div className={styles.dialog_overlay}>
        <div className={styles.dialog_content}>
          <h3>Ready to Process Your Course Content?</h3>
          <p>This will make the following changes to your course:</p>
          
          <div className={styles.changes_list}>
            {stats?.toCreate > 0 && (
              <div className={styles.change_item}>
                <span className={styles.check_icon}>✅</span>
                Create {stats.toCreate} new activities
              </div>
            )}
            {stats?.toUpdate > 0 && (
              <div className={styles.change_item}>
                <span className={styles.check_icon}>✅</span>
                Update {stats.toUpdate} existing activities
              </div>
            )}
            {stats?.toDelete > 0 && (
              <div className={styles.change_item}>
                <span className={styles.remove_icon}>❌</span>
                Remove {stats.toDelete} outdated activities
              </div>
            )}
          </div>
          
          <p className={styles.warning_text}>This action cannot be undone.</p>
          
          <div className={styles.dialog_buttons}>
            <button onClick={() => setShowConfirmDialog(false)} className={styles.cancel_button}>
              Cancel
            </button>
            <button onClick={handleConfirmProcessing} className={styles.confirm_button}>
              Yes, Proceed
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Component for Processing Progress Page
  const ProcessingProgressPage = () => (
    <div className={styles.processing_container}>
      <div className={styles.header}>
        <h2>Processing Content</h2>
      </div>
      
      <div className={styles.progress_content}>
        <div className={styles.spinner}></div>
        <h3>Processing your activities...</h3>
        <p>Please wait while we create, update, and remove activities as needed.</p>
        
        <div className={styles.progress_steps}>
          <div className={styles.progress_step}>Creating new activities...</div>
          <div className={styles.progress_step}>Updating existing activities...</div>
          <div className={styles.progress_step}>Removing outdated activities...</div>
        </div>
      </div>
    </div>
  )

  // Component for Final Results Page
  const FinalResultsPage = () => {
    if (!processingResults) return null

    // Check for network/API errors OR processing errors in the response
    const hasNetworkError = processingResults.error
    const hasProcessingErrors = processingResults.errors && processingResults.errors.length > 0
    const hasAnyErrors = hasNetworkError || hasProcessingErrors

    return (
      <div className={styles.results_container}>
        <div className={styles.header}>
          <h2>Processing Complete</h2>
        </div>
        
        <div className={styles.results_content}>
          {hasAnyErrors ? (
            <div className={styles.error_results}>
              <div className={styles.warning_icon}>⚠️</div>
              <h3>Processing Completed with Issues</h3>
              
              {/* Show network errors */}
              {hasNetworkError && (
                <div className={styles.error_details}>
                  <strong>System Error:</strong> {typeof processingResults.message === 'object' ? JSON.stringify(processingResults.message) : processingResults.message}
                </div>
              )}
              
              {/* Show processing errors */}
              {hasProcessingErrors && (
                <div className={styles.error_details}>
                  <strong>Processing Errors:</strong>
                  <ul className={styles.error_list}>
                    {processingResults.errors.map((error, index) => (
                      <li key={index}>{typeof error === 'object' ? error.message || JSON.stringify(error) : error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Show what was successfully processed */}
              {processingResults.stats && (
                <div className={styles.final_stats}>
                  <h4>What was completed:</h4>
                  {processingResults.stats.totalCreated > 0 && (
                    <div className={styles.final_stat_item}>
                      ✅ Successfully created {processingResults.stats.totalCreated} activities
                    </div>
                  )}
                  {processingResults.stats.totalUpdated > 0 && (
                    <div className={styles.final_stat_item}>
                      ✅ Successfully updated {processingResults.stats.totalUpdated} activities
                    </div>
                  )}
                  {processingResults.stats.totalDeleted > 0 && (
                    <div className={styles.final_stat_item}>
                      ✅ Successfully removed {processingResults.stats.totalDeleted} outdated activities
                    </div>
                  )}
                  <div className={styles.final_stat_item}>
                    <strong>Total processed: {processingResults.stats.totalProcessed || 0} activities</strong>
                  </div>
                </div>
              )}
              
              <div className={styles.next_steps}>
                <h4>Next Steps:</h4>
                <p>You may need to manually check and fix the failed items listed above.</p>
              </div>
            </div>
          ) : (
            <div className={styles.success_results}>
              <div className={styles.success_icon}>✅</div>
              <h3>Processing Complete!</h3>
              
              <div className={styles.final_stats}>
                {processingResults.stats ? (
                  <>
                    {processingResults.stats.totalCreated > 0 && (
                      <div className={styles.final_stat_item}>
                        Successfully created {processingResults.stats.totalCreated} activities
                      </div>
                    )}
                    {processingResults.stats.totalUpdated > 0 && (
                      <div className={styles.final_stat_item}>
                        Successfully updated {processingResults.stats.totalUpdated} activities
                      </div>
                    )}
                    {processingResults.stats.totalDeleted > 0 && (
                      <div className={styles.final_stat_item}>
                        Successfully removed {processingResults.stats.totalDeleted} outdated activities
                      </div>
                    )}
                    <div className={styles.final_stat_item}>
                      <strong>Total: {processingResults.stats.totalProcessed || 0} activities processed</strong>
                    </div>
                  </>
                ) : (
                  <div className={styles.final_stat_item}>
                    Content ingestion completed successfully!
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className={styles.final_actions}>
            <button onClick={handleBackToForm} className={styles.new_ingestion_button}>
              Start New Ingestion
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderCurrentStage = () => {
    switch (currentStage) {
      case "validation":
        return <ValidationResultsPage />
      case "processing":
        return <ProcessingProgressPage />
      case "results":
        return <FinalResultsPage />
      default:
  return (
          <>
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
                  {isProcessing ? "Validating..." : "Validate Sheet"}
              </button>
                </div>
            </div>
          </>
        )
    }
  }

  return (
    <div className={styles.main_page}>
      <Navbar />
      {isSidebarOpen && <Sidebar />}
      <div className={styles.content}>
        {renderCurrentStage()}
      </div>
      <ConfirmationDialog />
    </div>
  )
}

export default ContentIngestor
