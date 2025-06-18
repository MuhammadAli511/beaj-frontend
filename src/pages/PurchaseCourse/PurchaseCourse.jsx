import { useState, useEffect } from "react"
import { Navbar, Sidebar } from "../../components"
import styles from "./PurchaseCourse.module.css"
import {
  getAllMetadata,
  getMetadataByPhoneNumber,
  assignTargetGroup,
  getAllCoursesByPhoneNumber,
  getPurchasedCoursesByPhoneNumber,
  getUnpurchasedCoursesByPhoneNumber,
  getCompletedCourses,
  purchaseCourse,
  getTargetGroupByPhoneNumber,
} from "../../helper"
import { TailSpin } from "react-loader-spinner"
import { useSidebar } from '../../components/SidebarContext';

const CoursePurchaseModal = ({ isOpen, onClose, phoneNumber, courseId, onPurchase, allProfiles }) => {
  const [profiles, setProfiles] = useState([])
  const [selectedProfile, setSelectedProfile] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)

  useEffect(() => {
    const fetchPhoneNumberprofiles = async () => {
      try {
        // const response = await getMetadataByPhoneNumber(phoneNumber)
        // if (response.status === 200) {
        //   const data = response.data
        //   if (Array.isArray(data)) {
        //     setProfiles(data)
        //   } else if (typeof data === "object" && data !== null) {
        //     setProfiles([data])
        //   } else {
        //     console.error("Unexpected data format for profiles:", data)
        //     setProfiles([])
        //   }
        // } else {
        //   alert(response.data.message)
        // }
      } catch (error) {
        // alert("Failed to fetch phone number profiles.")
      } finally {
        setIsLoading(false)
      }
    }
    if (isOpen) {
      setIsLoading(true)
      fetchPhoneNumberprofiles()
    }
  }, [isOpen, phoneNumber])

  const handleCoursePurchase = async () => {
    if (!selectedProfile) {
      alert("Please select a profile to purchase course.")
      return
    }

    setIsPurchasing(true)

    try {
      await onPurchase(phoneNumber, selectedProfile, courseId)
      onClose()
    } catch (error) {
      alert("Course Purchase failed.")
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <div>
      {isOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modal_heading}>Purchase Course</h2>
            {isLoading ? (
              <div className={styles.loader}>
                <TailSpin color="#51bbcc" height={30} width={30} />
              </div>
            ) : (
              <div className={styles.form_group}>
                <label className={styles.label} htmlFor="profile_select">
                  Select Profile
                </label>
                <select
                  className={styles.input_field}
                  id="profile_select"
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                >
                  <option value="">Select a Profile</option>
                  {allProfiles.map((profile) => (
                    <option key={profile.profile_id} value={profile.profile_id}>
                      {profile.name} (Profile ID: {profile.profile_id})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className={styles.form_group_row}>
              <button
                className={`${styles.submit_button} ${styles.purchase_modal_button}`}
                onClick={handleCoursePurchase}
                disabled={isLoading || isPurchasing || !selectedProfile}
              >
                {isPurchasing ? (
                  <div className={styles.button_loader}>
                    <TailSpin color="#ffffff" height={20} width={20} />
                  </div>
                ) : (
                  "Purchase"
                )}
              </button>
              <button className={styles.cancel_button} onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const TargetGroupModal = ({ isOpen, onClose, phoneNumber, onTargetGroup, allProfiles }) => {
  const [profiles, setProfiles] = useState([])
  const [selectedProfile, setSelectedProfile] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isTargeting, setIsTargeting] = useState(false)
  const [targetGroup, setTargetGroup] = useState("")
  const [profileData, setProfileData] = useState(null)

  // Fetch all profiles for this phone number when modal opens
  useEffect(() => {
    const fetchPhoneNumberprofiles = async () => {
      try {
        setIsLoading(true)
        // const response = await getMetadataByPhoneNumber(phoneNumber)

        // if (response.status === 200) {
        //   const data = response.data
        //   if (Array.isArray(data)) {
        //     setProfiles(data)
        //   } else if (typeof data === "object" && data !== null) {
        //     setProfiles([data])
        //   } else {
        //     console.error("Unexpected data format for profiles:", data)
        //     setProfiles([])
        //   }
        // } else {
        //   alert(response.data.message)
        // }
      } catch (error) {
        // console.error("Error fetching profiles:", error)
        // alert("Failed to fetch phone number profiles.")
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && phoneNumber) {
      fetchPhoneNumberprofiles()
    }
  }, [isOpen, phoneNumber])

  // Fetch target group when a profile is selected
  useEffect(() => {
    const fetchProfileTargetGroup = async () => {
      if (!selectedProfile) {
        setProfileData(null)
        setTargetGroup("")
        return
      }

      try {
        setIsProfileLoading(true);
        setTargetGroup(allProfiles.find(profile => profile.profile_id == selectedProfile).targetGroup || "");
        setProfileData(allProfiles.find(profile => profile.profile_id == selectedProfile));
      } catch (error) {
        console.error("Error fetching target group:", error)
        alert("Failed to fetch target group.")
        setProfileData(null)
        setTargetGroup("")
      } finally {
        setIsProfileLoading(false)
      }
    }

    if (selectedProfile) {
      fetchProfileTargetGroup()
    } else {
      // Reset when no profile is selected
      setProfileData(null)
      setTargetGroup("")
    }
  }, [selectedProfile, phoneNumber])

  const handleTargetGroupAssignment = async () => {
    if (!selectedProfile) {
      alert("Please select a profile.")
      return
    }

    if (!targetGroup) {
      alert("Please select a target group.")
      return
    }

    setIsTargeting(true)

    try {
      // Call the onTargetGroup function passed from parent component
      await onTargetGroup(phoneNumber, selectedProfile, targetGroup);
      if (profileData) {
        setProfileData({
          ...profileData,
          targetGroup: targetGroup,
        })
      }
      onClose(); // Close modal after successful assignment
    } catch (error) {
      console.error("Target group assignment failed:", error)
      alert("Target group assignment failed.")
    } finally {
      setIsTargeting(false)
    }
  }

  return (
    <div>
      {isOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modal_heading}>Target Group</h2>

            {/* Profile selection */}
            {isLoading ? (
              <div className={styles.loader}>
                <TailSpin color="#51bbcc" height={30} width={30} />
              </div>
            ) : (
              <div className={styles.form_group}>
                <label className={styles.label} htmlFor="profile_select">
                  Select Profile
                </label>
                <select
                  className={styles.input_field}
                  id="profile_select"
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                >
                  <option value="">Select a Profile</option>
                  {allProfiles.map((profile) => (
                    <option key={profile.profile_id} value={profile.profile_id}>
                      {profile.name || ""} (Profile ID: {profile.profile_id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Target group selection */}
            {isProfileLoading ? (
              <div className={styles.loader}>
                <TailSpin color="#51bbcc" height={30} width={30} />
              </div>
            ) : selectedProfile ? (
              <div className={styles.form_group}>
                <div className={styles.target_group_section}>
                  {profileData && profileData.targetGroup ? (
                    <p>
                      <strong>Current Target Group: </strong> {profileData.targetGroup}
                    </p>
                  ) : (
                    <p>No target group currently assigned.</p>
                  )}

                  <label className={styles.label} htmlFor="target_group_select">
                    Select Target Group
                  </label>
                  <select
                    className={styles.input_field}
                    id="target_group_select"
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                  >
                    <option value="">Select Target Group</option>
                    <option value="None">None</option>
                    <option value="T1">T1</option>
                    <option value="T2">T2</option>
                    <option value="Control">Control</option>
                  </select>
                </div>
              </div>
            ) : null}

            <div className={styles.form_group_row}>
              {selectedProfile && (
                <button
                  className={styles.submit_button}
                  onClick={handleTargetGroupAssignment}
                  disabled={!targetGroup || isTargeting}
                >
                  {isTargeting ? (
                    <div className={styles.button_loader}>
                      <TailSpin color="#ffffff" height={20} width={20} />
                    </div>
                  ) : profileData && profileData.targetGroup ? (
                    "Change Target Group"
                  ) : (
                    "Assign Target Group"
                  )}
                </button>
              )}
              <button className={styles.cancel_button} onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const PurchaseCourse = () => {
  // Use the useSidebar hook with error handling
  const { isSidebarOpen } = useSidebar()

  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingUserDetails, setLoadingUserDetails] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [selectedUserData, setSelectedUserData] = useState(null)
  const [error, setError] = useState(null)
  const [targetGroup, setTargetGroup] = useState("")
  const [courses, setCourses] = useState([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState(null)

  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false)
  const [allProfiles, setAllProfiles] = useState([])
  const [allNumbers, setAllNumbers] = useState([])

  const fetchPhoneNumbers = async () => {
    setLoadingUsers(true)
    try {
      const response = await getAllMetadata()
      setAllNumbers(response.data)
      if (response.data && Array.isArray(response.data)) {
        const uniqueUserMap = new Map()
        response.data.forEach((user) => {
          if (!uniqueUserMap.has(user.phoneNumber)) {
            uniqueUserMap.set(user.phoneNumber, user)
          }
        })
        const uniqueUsers = Array.from(uniqueUserMap.values())
        setPhoneNumbers(uniqueUsers)
      } else {
        console.error("Expected an array in response.data, got:", response)
      }
    } catch (error) {
      console.error("Error fetching metadata:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Fetch user list on component mount
  useEffect(() => {
    fetchPhoneNumbers();
  }, []);

  // Fetch courses when the active tab or selected user changes
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedPhoneNumber) return
      setLoadingCourses(true)
      setError(null)

      setAllProfiles(allNumbers.filter((user) => user.phoneNumber === selectedPhoneNumber))

      try {
        let response
        switch (activeTab) {
          case "purchased":
            response = await getPurchasedCoursesByPhoneNumber(selectedPhoneNumber)
            break
          case "unpurchased":
            response = await getUnpurchasedCoursesByPhoneNumber(selectedPhoneNumber)
            break
          case "completed":
            response = await getCompletedCourses(selectedPhoneNumber)
            break
          case "all":
          default:
            response = await getAllCoursesByPhoneNumber(selectedPhoneNumber)
            break
        }

        if (response.data) {
          setCourses(response.data)
        } else {
          setError("No courses found")
        }
      } catch (error) {
        console.error("Error fetching courses:", error)
        setError("Failed to fetch courses.")
      } finally {
        setLoadingCourses(false)
      }
    }

    fetchCourses();
  }, [activeTab, selectedPhoneNumber, allNumbers])

  const handleUserClick = async (phoneNumber) => {
    setSelectedPhoneNumber(phoneNumber)
    setLoadingUserDetails(true)
    setError(null)
    setSelectedUserData(null)

    try {
      const response = await getMetadataByPhoneNumber(phoneNumber)
      if (response.data) {
        setSelectedUserData(response.data)
        setTargetGroup(response.data.targetGroup || "")
      } else {
        setSelectedUserData(null)
        setError("No user data found for this phone number")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to fetch user details")
    } finally {
      setLoadingUserDetails(false)
    }
  }

  // Handle assigning a target group
  const handleAssignTargetGroup = async (phoneNumber, profileId, targetGroup) => {
    try {
      const response = await assignTargetGroup(phoneNumber, profileId, targetGroup)

      if (response.status === 200) {
        
        alert("Target group assigned successfully.");
        const refreshedProfiles = await getMetadataByPhoneNumber(phoneNumber);
        const profilesData = Array.isArray(refreshedProfiles.data)
          ? refreshedProfiles.data
          : [refreshedProfiles.data];
        setAllProfiles(profilesData);

        // Refresh all data to ensure UI is updated
        // await fetchPhoneNumbers();

        // If the current phone number is the one being updated, refresh its details
        if (selectedPhoneNumber === phoneNumber) {

          // Refresh user data
          const updatedUserResponse = await getMetadataByPhoneNumber(phoneNumber)
          if (updatedUserResponse.status === 200) {
            setSelectedUserData(updatedUserResponse.data);
          }

          // Update the allProfiles state to reflect the changes
        //   setAllProfiles(allNumbers.filter((user) => user.phoneNumber === phoneNumber))
        }

        return true
      } else {
        alert("Failed to assign target group.")
        return false
      }
    } catch (error) {
      console.error("Error assigning target group:", error)
      alert("An error occurred while assigning target group.")
      return false
    }
  }

  const openPurchaseModal = (courseId) => {
    setIsPurchaseModalOpen(true)
    setSelectedCourseId(courseId)
  }

  const closePurchaseModal = () => {
    setIsPurchaseModalOpen(false)
    setSelectedCourseId(null)
  }

  const openTargetModal = () => {
    setIsTargetModalOpen(true)
  }

  const closeTargetModal = () => {
    setIsTargetModalOpen(false)
  }

  // Handle course purchase
  const handlePurchase = async (phone, profileId, courseId) => {
    setLoadingCourses(true)
    setError(null)

    try {
      const response = await purchaseCourse(phone, courseId, profileId)

      if (response.status === 200) {
        alert("Course purchased successfully!")

        // Refresh courses to update the list
        const updatedCoursesResponse = await getAllCoursesByPhoneNumber(phone)
        if (updatedCoursesResponse.data) {
          setCourses(updatedCoursesResponse.data)
        }

        return true
      } else {
        alert("Failed to purchase course")
        return false
      }
    } catch (error) {
      console.error("Error purchasing course:", error)
      setError("Failed to purchase course.")
      return false
    } finally {
      setLoadingCourses(false)
    }
  }

  const filteredPhoneNumbers = phoneNumbers.filter((user) => user.phoneNumber.includes(searchQuery))

  return (
    <div className={styles.main_page}>
      <Navbar />
      {isSidebarOpen && <Sidebar />}
      <div className={styles.content}>
        <div className={styles.logs_container}>
          <div className={styles.phone_list}>
            <h3 className={styles.heading_color}>Users</h3>
            <input
              type="text"
              placeholder="Search by phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.search_input}
            />
            {loadingUsers ? (
              <div className={styles.loader}>
                <TailSpin color="#51bbcc" height={50} width={50} />
              </div>
            ) : (
              <ul>
                {filteredPhoneNumbers.length > 0 ? (
                  filteredPhoneNumbers.map((user) => (
                    <li
                      key={user.profile_id}
                      className={selectedPhoneNumber === user.phoneNumber ? styles.active : ""}
                      onClick={() => handleUserClick(user.phoneNumber)}
                    >
                      {user.phoneNumber}
                    </li>
                  ))
                ) : (
                  <p>No users found</p>
                )}
              </ul>
            )}
          </div>
          <div className={styles.person_details_section}>
            <div className={styles.person_container}>
              {loadingUserDetails ? (
                <div className={styles.loader}>
                  <TailSpin color="#51bbcc" height={50} width={50} />
                </div>
              ) : error ? (
                <p className={styles.error_message}>{error}</p>
              ) : selectedUserData ? (
                <div>
                  <h1>{selectedUserData.phoneNumber || "N/A"}</h1>
                  <h2 className={styles.personal_details_heading}>Personal Details</h2>
                  <div className={styles.tableContainer}>
                    <table className={styles.profileTable}>
                      <thead>
                        <tr>
                          <th>Profile ID</th>
                          <th>Name</th>
                          <th>Target Group</th>
                          <th>Cohort</th>
                          <th>City</th>
                          <th>District</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allProfiles.map((profile) => (
                          <tr key={profile.profile_id}>
                            <td>{profile.profile_id}</td>
                            <td>{profile.name || "N/A"}</td>
                            <td>{profile.targetGroup || "N/A"}</td>
                            <td>{profile.cohort || "N/A"}</td>
                            <td>{profile.city || "N/A"}</td>
                            <td>{profile.district || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <h2 className={styles.personal_details_heading}>Target Group</h2>
                  <div className={styles.target_group_section}>
                    <button className={styles.target_group_button} onClick={openTargetModal}>
                      Assign Target Group
                    </button>
                  </div>

                  {/* Tabs for Course Management */}
                  <div className={styles.tabs}>
                    <button
                      className={activeTab === "all" ? styles.active_tab : ""}
                      onClick={() => setActiveTab("all")}
                    >
                      All Courses
                    </button>
                    <button
                      className={activeTab === "purchased" ? styles.active_tab : ""}
                      onClick={() => setActiveTab("purchased")}
                    >
                      Purchased
                    </button>
                    <button
                      className={activeTab === "unpurchased" ? styles.active_tab : ""}
                      onClick={() => setActiveTab("unpurchased")}
                    >
                      Unpurchased
                    </button>
                    <button
                      className={activeTab === "completed" ? styles.active_tab : ""}
                      onClick={() => setActiveTab("completed")}
                    >
                      Completed
                    </button>
                  </div>

                  {/* Course Listing */}
                  <div className={styles.course_list}>
                    {loadingCourses ? (
                      <div className={styles.loader}>
                        <TailSpin color="#51bbcc" height={50} width={50} />
                      </div>
                    ) : error ? (
                      <p className={styles.error_message}>{error}</p>
                    ) : courses.length > 0 ? (
                      courses.map((course) => (
                        <div key={course.CourseId} className={styles.course_item}>
                          <h3>{course.CourseName}</h3>
                          <p>Status: {course.user_status}</p>
                          {(course.user_status === "purchased" || course.user_status === "completed") && (
                            <p> {
                                (allProfiles.find(p => p.profile_id === course.profile_id)?.name || "")
                              } (Profile ID: {course.profile_id})</p>
                          )}
                          {activeTab === "unpurchased" && (
                            <button
                              className={styles.purchase_button}
                              onClick={() => openPurchaseModal(course.CourseId)}
                            >
                              Purchase Course
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className={styles.no_courses}>No courses found</p>
                    )}
                  </div>
                </div>
              ) : (
                <p>Select a phone number to see details</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Course Modal */}
      {isPurchaseModalOpen && selectedCourseId && (
        <CoursePurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={closePurchaseModal}
          phoneNumber={selectedPhoneNumber}
          courseId={selectedCourseId}
          onPurchase={handlePurchase}
          allProfiles={allProfiles}
        />
      )}

      {/* Target Group Modal */}
      {isTargetModalOpen && selectedPhoneNumber && (
        <TargetGroupModal
          isOpen={isTargetModalOpen}
          onClose={closeTargetModal}
          phoneNumber={selectedPhoneNumber}
          onTargetGroup={handleAssignTargetGroup}
          allProfiles={allProfiles}
        />
      )}
    </div>
  )
}

export default PurchaseCourse