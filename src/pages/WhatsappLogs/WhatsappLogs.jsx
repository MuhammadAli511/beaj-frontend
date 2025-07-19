"use client"

import { useState, useEffect, useRef } from "react"
import { Navbar, Sidebar } from "../../components"
import styles from "./WhatsappLogs.module.css"
import {
  getCombinedUserData,
  getActivityLogsByPhoneNumber,
  getMetadataByPhoneNumber,
  getActiveSessionByPhoneNumberAndBotPhoneNumberId,
} from "../../helper"
import { useSidebar } from "../../components/SidebarContext"
import { TailSpin } from "react-loader-spinner"
import Select from "react-select"

const PAGE_SIZE = 15
const INACTIVE_DAYS_THRESHOLD = 3

const WhatsappLogs = () => {
  const { isSidebarOpen } = useSidebar()
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null)
  const [activityLogs, setActivityLogs] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // UI States
  const [selectedUserName, setSelectedUserName] = useState("")
  const [hoveredLog, setHoveredLog] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCohorts, setSelectedCohorts] = useState(["All"])
  const [selectedBotPhone, setSelectedBotPhone] = useState(null)
  const [profilesData, setProfilesData] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [profilesLoading, setProfilesLoading] = useState(false)
  const [activeSessionLoading, setActiveSessionLoading] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState(null)

  const BOT_PHONE_NUMBERS = [
    { label: "Teacher Bot", value: "410117285518514" },
    { label: "Student Bot", value: "608292759037444" },
    { label: "Marketing Bot", value: "630734623462388" },
  ]

  // Refs
  const chatContainerRef = useRef(null)

  // Cohort options
  const cohortOptions = [
    { value: "All", label: "All" },
    { value: "Pilot", label: "Pilot" },
    ...Array.from({ length: 60 }, (_, i) => ({
      value: `Cohort ${i + 1}`,
      label: `Cohort ${i + 1}`,
    })),
  ]

  const handleCohortsChange = (selectedOptions) => {
    if (selectedOptions.some((option) => option.value === "All")) {
      setSelectedCohorts(["All"])
    } else {
      setSelectedCohorts(selectedOptions.map((option) => option.value))
    }
  }

  const processMessageContent = (content) => {
    // Handle null or undefined content
    if (!content) return { url: "", caption: "" }

    // If content is an array, use first element as URL and second as caption
    if (Array.isArray(content)) {
      return {
        url: content[0] || "",
        caption: content[1] || "",
      }
    }

    // If it's a string, handle the comma case
    if (typeof content === "string") {
      // Remove trailing comma if it exists
      const trimmedContent = content.endsWith(",") ? content.slice(0, -1) : content

      // Split by comma if it exists
      const parts = trimmedContent.split(",")
      if (parts.length > 1) {
        return {
          url: parts[0].trim(),
          caption: parts[1].trim(),
        }
      }

      return {
        url: trimmedContent,
        caption: "",
      }
    }

    // For any other type, return empty values
    return { url: "", caption: "" }
  }

  // Determine profile type based on bot and profile data
  const getProfileType = (profile, botType) => {
    if (botType === "teacher") return "teacher"
    if (botType === "marketing") return "marketing"
    if (profile.classLevel && profile.classLevel.trim() !== "") return "student"
    return "unknown"
  }

  useEffect(() => {
    const fetchData = async () => {
      setUsersLoading(true)
      try {
        const combinedResponse = await getCombinedUserData()

        if (combinedResponse.data && Array.isArray(combinedResponse.data)) {
          const usersWithActivity = combinedResponse.data.map((user) => {
            const timestamp = user.last_message_timestamp
            const now = new Date()
            const lastMessageDate = new Date(timestamp)
            const diffTime = Math.abs(now - lastMessageDate)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            return {
              ...user,
              lastMessageTimestamp: timestamp,
              inactiveDays: diffDays,
            }
          })

          setPhoneNumbers(usersWithActivity)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setUsersLoading(false)
      }
    }
    fetchData()
  }, [])

  // Reset states when phone number changes
  useEffect(() => {
    if (!selectedPhoneNumber) {
      setSelectedBotPhone(null)
      setActivityLogs([])
      setProfilesData([])
      setActiveSession(null)
      setSelectedProfileId(null)
      return
    }

    // Fetch profiles immediately when phone number is selected
    fetchProfilesData(selectedPhoneNumber)
  }, [selectedPhoneNumber])

  const fetchLogs = async (phoneNumber, botPhoneNumber, currentPage, profileId) => {
    try {
      if (!phoneNumber || !botPhoneNumber || !profileId) return []
      const logs = await getActivityLogsByPhoneNumber(phoneNumber, botPhoneNumber, profileId, currentPage, PAGE_SIZE)

      let filteredLogs = logs.data || []
      if (profileId && filteredLogs.length > 0) {
        filteredLogs = filteredLogs.filter((log) => log.profile_id === profileId)
      }
      return filteredLogs
    } catch (error) {
      console.error("Error fetching activity logs:", error)
      return []
    }
  }

  const fetchProfilesData = async (phoneNumber) => {
    try {
      setProfilesLoading(true)
      const response = await getMetadataByPhoneNumber(phoneNumber)
      if (response.data && Array.isArray(response.data)) {
        // Ensure all profiles have profile_id and filter out any null/undefined ones
        const validProfiles = response.data.filter(
          (profile) =>
            profile.profile_id &&
            profile.profile_id !== null &&
            profile.profile_id !== undefined &&
            profile.profile_id.toString().trim() !== "",
        )

        setProfilesData(validProfiles)
        // Auto-select first profile if available
        if (validProfiles.length > 0) {
          setSelectedProfileId(validProfiles[0].profile_id)
        }
      }
    } catch (error) {
      console.error("Error fetching profiles:", error)
      setProfilesData([])
    } finally {
      setProfilesLoading(false)
    }
  }

  const fetchActiveSession = async (phoneNumber, botPhoneNumberId) => {
    try {
      setActiveSessionLoading(true)
      const response = await getActiveSessionByPhoneNumberAndBotPhoneNumberId(phoneNumber, botPhoneNumberId)
      if (response.data && response.data.profile_id) {
        setActiveSession(response.data)
        // Set active profile as selected by default
        setSelectedProfileId(response.data.profile_id)
      } else {
        setActiveSession(null)
      }
    } catch (error) {
      console.error("Error fetching active session:", error)
      setActiveSession(null)
    } finally {
      setActiveSessionLoading(false)
    }
  }

  // Handle profile selection
  const handleProfileSelect = (profileId) => {
    if (!profileId) return

    setSelectedProfileId(profileId)
    // Reset pagination when changing profile
    setPage(1)
    setHasMore(true)
    setActivityLogs([])

    // Fetch logs for the selected profile if bot is selected
    if (selectedPhoneNumber && selectedBotPhone) {
      loadLogsForProfile(profileId)
    }
  }

  const loadLogsForProfile = async (profileId) => {
    if (!profileId || !selectedPhoneNumber || !selectedBotPhone) return

    setMessagesLoading(true)
    try {
      const logs = await fetchLogs(selectedPhoneNumber, selectedBotPhone, 1, profileId)
      setActivityLogs(logs.reverse())
      setHasMore(logs.length === PAGE_SIZE)

      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
      }, 100)
    } catch (error) {
      console.error("Error fetching logs for profile:", error)
    } finally {
      setMessagesLoading(false)
    }
  }

  // Handle bot phone selection
  const handleBotPhoneSelect = async (botPhone) => {
    setSelectedBotPhone(botPhone)
    // Reset pagination when changing bot phone
    setPage(1)
    setHasMore(true)
    setActivityLogs([])

    if (selectedPhoneNumber) {
      // Fetch active session for this bot
      await fetchActiveSession(selectedPhoneNumber, botPhone)
    }
  }

  // Effect to load logs when bot is selected and we have a selected profile
  useEffect(() => {
    if (selectedPhoneNumber && selectedBotPhone && selectedProfileId) {
      loadLogsForProfile(selectedProfileId)
    }
  }, [selectedPhoneNumber, selectedBotPhone, selectedProfileId])

  const handleScroll = async () => {
    if (!chatContainerRef.current) return
    const { scrollTop } = chatContainerRef.current

    // If we are close to the very top and have more logs to fetch
    if (scrollTop <= 0 && hasMore && !isLoadingMore && !messagesLoading) {
      setIsLoadingMore(true)
      const oldScrollHeight = chatContainerRef.current.scrollHeight
      const nextPage = page + 1
      const olderLogs = await fetchLogs(selectedPhoneNumber, selectedBotPhone, nextPage, selectedProfileId)

      setActivityLogs((prev) => {
        return [...olderLogs.reverse(), ...prev]
      })

      setPage(nextPage)
      setHasMore(olderLogs.length === PAGE_SIZE)

      const newScrollHeight = chatContainerRef.current.scrollHeight
      const heightDiff = newScrollHeight - oldScrollHeight
      chatContainerRef.current.scrollTop = heightDiff

      setIsLoadingMore(false)
    }
  }

  const filteredPhoneNumbers = phoneNumbers.filter((user) => {
    const phone = user.phoneNumber || ""
    const userCohort = user.cohort || ""

    const matchesSearch = phone.includes(searchQuery)
    const matchesCohort = selectedCohorts.includes("All") || selectedCohorts.includes(userCohort)

    return matchesSearch && matchesCohort
  })

  return (
    <div className={styles.main_page}>
      <Navbar />
      {isSidebarOpen && <Sidebar />}
      <div className={styles.content}>
        <div className={styles.logs_container}>
          {/* Left panel for Contacts */}
          <div className={styles.phone_list}>
            <h3 className={styles.heading_color}>Contacts</h3>
            <div className={styles.filters}>
              <input
                type="text"
                placeholder="Search by phone number ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.search_input}
              />
              <div className={styles.cohort_filter}>
                <Select
                  className={styles.select}
                  options={cohortOptions}
                  isMulti
                  defaultValue={[cohortOptions[0]]}
                  onChange={handleCohortsChange}
                  placeholder="Select cohorts..."
                  isSearchable={true}
                />
              </div>
            </div>
            {usersLoading ? (
              <div className={styles.loader}>
                <TailSpin color="#51bbcc" height={50} width={50} />
              </div>
            ) : (
              <ul>
                {filteredPhoneNumbers.length > 0 ? (
                  filteredPhoneNumbers.map((user) => (
                    <li
                      key={user.profile_id}
                      className={`${selectedPhoneNumber === user.phoneNumber ? styles.active : ""} ${styles.user_item}`}
                      onClick={() => setSelectedPhoneNumber(user.phoneNumber)}
                    >
                      <div className={styles.user_info}>
                        <span>{user.phoneNumber}</span>
                        {user.inactiveDays >= INACTIVE_DAYS_THRESHOLD && (
                          <span className={styles.inactive_dot} title={`Inactive for ${user.inactiveDays} days`} />
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <p>No contacts found</p>
                )}
              </ul>
            )}
          </div>

          {/* Right Panel for Activity Logs */}
          <div className={styles.activity_logs}>
            {/* Compact unified row with profiles, active session, and bot selection */}
            {selectedPhoneNumber && (
              <div className={styles.unified_control_bar}>
                {/* Active Session Badge */}
                {selectedBotPhone && (
                  <div className={styles.active_session_compact}>
                    {activeSessionLoading ? (
                      <div className={styles.loader_tiny}>
                        <TailSpin color="#2e7d32" height={16} width={16} />
                      </div>
                    ) : activeSession && profilesData.length > 0 ? (
                      <>
                        <span className={styles.active_indicator}>●</span>
                        <span className={styles.active_text}>
                          Active: {(() => {
                            const activeProfile = profilesData.find((p) => p.profile_id === activeSession.profile_id)
                            return activeProfile
                              ? activeProfile.studentName || activeProfile.name || "Unknown"
                              : activeSession.profile_id
                          })()}
                        </span>
                      </>
                    ) : null}
                  </div>
                )}

                {/* Student Profiles */}
                {profilesData.length > 0 && (
                  <div className={styles.profiles_compact}>
                    {profilesLoading ? (
                      <div className={styles.loader_tiny}>
                        <TailSpin color="#51bbcc" height={16} width={16} />
                      </div>
                    ) : (
                      profilesData.map((profile, index) => {
                        const isActive = activeSession && activeSession.profile_id === profile.profile_id
                        const isSelected = selectedProfileId === profile.profile_id
                        return (
                          <div
                            key={profile.profile_id || index}
                            className={`${styles.profile_compact} ${isActive ? styles.profile_active : ""} ${isSelected ? styles.profile_selected : ""}`}
                            onClick={() => handleProfileSelect(profile.profile_id)}
                            style={{ cursor: "pointer" }}
                          >
                            <span className={styles.profile_name_compact}>
                              {profile.studentName || profile.name || "Unknown Name"}
                              {isActive && <span className={styles.active_dot}>●</span>}
                              {isSelected && <span className={styles.selected_indicator}>✓</span>}
                            </span>
                            <span className={styles.profile_class_compact}>
                              ID: {profile.profile_id} | Class: {profile.classLevel || "N/A"}
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {/* Bot Selection */}
                <div className={styles.bot_selector_compact}>
                  {BOT_PHONE_NUMBERS.map((bot) => (
                    <button
                      key={bot.value}
                      className={`${styles.bot_button_compact} ${selectedBotPhone === bot.value ? styles.active_bot_compact : ""}`}
                      onClick={() => handleBotPhoneSelect(bot.value)}
                    >
                      {bot.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Profile Info */}
            {selectedProfileId && profilesData.length > 0 && (
              <div className={styles.selected_profile_info}>
                {(() => {
                  const selectedProfile = profilesData.find((p) => p.profile_id === selectedProfileId)
                  return selectedProfile ? (
                    <div className={styles.profile_info_bar}>
                      <span className={styles.viewing_label}>Viewing logs for:</span>
                      <span className={styles.profile_name_selected}>
                        {selectedProfile.studentName || selectedProfile.name || "Unknown Name"}
                      </span>
                      <span className={styles.profile_details}>
                        (Class: {selectedProfile.classLevel}, ID: {selectedProfile.profile_id})
                      </span>
                    </div>
                  ) : null
                })()}
              </div>
            )}

            {messagesLoading ? (
              <div className={styles.loader}>
                <TailSpin color="#00BFFF" height={50} width={50} />
              </div>
            ) : selectedPhoneNumber && selectedBotPhone && selectedProfileId ? (
              activityLogs.length > 0 ? (
                <div className={styles.chat_container} ref={chatContainerRef} onScroll={handleScroll}>
                  {isLoadingMore && (
                    <div className={styles.loading_more}>
                      <TailSpin color="#00BFFF" height={30} width={30} />
                    </div>
                  )}
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className={log.messageDirection === "outbound" ? styles.message_outbound : styles.message_inbound}
                    >
                      <div className={styles.message_content}>
                        {/* Check if the message is media, text, or template */}
                        {log.actionType === "image" && (
                          <div className={styles.media_container}>
                            {(() => {
                              const { url, caption } = processMessageContent(log.messageContent)
                              return (
                                <>
                                  <img
                                    src={url || "/placeholder.svg"}
                                    alt={caption || "User sent media"}
                                    className={styles.media_message}
                                  />
                                  {caption && <p className={styles.media_caption}>{caption}</p>}
                                </>
                              )
                            })()}
                          </div>
                        )}
                        {log.actionType === "sticker" && (
                          <img
                            src={processMessageContent(log.messageContent).url || "/placeholder.svg"}
                            alt="User sent sticker"
                            className={styles.media_message}
                          />
                        )}
                        {log.actionType === "audio" && (
                          <audio controls>
                            <source src={processMessageContent(log.messageContent).url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        )}
                        {log.actionType === "video" && (
                          <div className={styles.media_container}>
                            {(() => {
                              const { url, caption } = processMessageContent(log.messageContent)
                              return (
                                <>
                                  <video controls className={styles.media_message}>
                                    <source src={url} type="video/mp4" />
                                    Your browser does not support the video element.
                                  </video>
                                  {caption && <p className={styles.media_caption}>{caption}</p>}
                                </>
                              )
                            })()}
                          </div>
                        )}
                        {log.actionType === "text" && <p>{processMessageContent(log.messageContent).url}</p>}
                        {log.actionType === "template" && (
                          <div className={styles.template_message}>
                            <p>{log.messageContent}</p>
                          </div>
                        )}
                        {/* Timestamp & Info */}
                        <div className={styles.message_footer}>
                          {log.messageDirection === "inbound" && (
                            <span className={styles.message_timestamp}>{new Date(log.timestamp).toLocaleString()}</span>
                          )}
                          <div
                            className={styles.info_icon}
                            onMouseEnter={() => setHoveredLog(log)}
                            onMouseLeave={() => setHoveredLog(null)}
                          >
                            ℹ️
                            {hoveredLog === log && (
                              <div className={styles.tooltip}>
                                <p>
                                  <strong>Profile ID:</strong> {log.profile_id}
                                </p>
                                <p>
                                  <strong>Course ID:</strong> {log.courseId}
                                </p>
                                <p>
                                  <strong>Lesson ID:</strong> {log.lessonId}
                                </p>
                                <p>
                                  <strong>Week Number:</strong> {log.weekNumber}
                                </p>
                                <p>
                                  <strong>Day Number:</strong> {log.dayNumber}
                                </p>
                                <p>
                                  <strong>Activity Type:</strong> {log.activityType}
                                </p>
                              </div>
                            )}
                          </div>
                          {log.messageDirection === "outbound" && (
                            <span className={styles.message_timestamp}>{new Date(log.timestamp).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No messages available for this contact and selected profile</p>
              )
            ) : (
              <p className={styles.no_messages}>
                {selectedPhoneNumber
                  ? selectedBotPhone
                    ? "Loading profile data..."
                    : "Please select a bot phone number to view messages"
                  : "No messages available. Select a contact first."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhatsappLogs
