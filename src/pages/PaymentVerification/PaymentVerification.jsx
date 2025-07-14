import { useState, useEffect } from "react";
import { Navbar, Sidebar } from "../../components";
import styles from "./PaymentVerification.module.css";
import { getPurchasedCourseByPaymentStatus, updatePaymentStatusByProfileId, getAllMetadata } from "../../helper";
import { TailSpin } from "react-loader-spinner";
import { useSidebar } from '../../components/SidebarContext';

const PaymentVerification = () => {
  const { isSidebarOpen } = useSidebar();
  
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending Approval");
  const [classLevelFilter, setClassLevelFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("oldest");
  const [userMetadata, setUserMetadata] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [approveLoading, setApproveLoading] = useState({});
  const [rejectLoading, setRejectLoading] = useState({});

  // Fetch payment requests based on status filter
  useEffect(() => {
    const fetchPaymentRequests = async () => {
      setLoading(true);
      try {
        const response = await getPurchasedCourseByPaymentStatus(statusFilter);
        if (response.status === 200) {
          // Sort by oldest first (default behavior)
          const sortedData = response.data.sort((a, b) => 
            new Date(a.courseStartDate) - new Date(b.courseStartDate)
          );
          setPaymentRequests(sortedData);
          setFilteredRequests(sortedData);
        } else {
          console.error("Failed to fetch payment requests");
        }
      } catch (error) {
        console.error("Error fetching payment requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentRequests();
  }, [statusFilter]);

  // Fetch user metadata to get names for searching
  useEffect(() => {
    const fetchUserMetadata = async () => {
      try {
        const response = await getAllMetadata();
        if (response.status === 200) {
          // Create a lookup object for easy access to user metadata by profile_id
          const metadataMap = {};
          response.data.forEach(user => {
            metadataMap[user.profile_id] = user;
          });
          setUserMetadata(metadataMap);
        }
      } catch (error) {
        console.error("Error fetching user metadata:", error);
      }
    };

    fetchUserMetadata();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let results = [...paymentRequests];
    
    // Apply search query filter (search by name)
    if (searchQuery.trim() !== "") {
      results = results.filter(request => {
        const user = userMetadata[request.profile_id];
        if (!user) return false;
        
        const userNameLower = (user.name || "").toLowerCase();
        return userNameLower.includes(searchQuery.toLowerCase());
      });
    }
    
    // Apply class level filter (if not "all")
    if (classLevelFilter !== "all") {
      results = results.filter(request => {
        const user = userMetadata[request.profile_id];
        return user && user.classLevel === classLevelFilter;
      });
    }
    
    // Apply sorting
    if (sortOrder === "newest") {
      results.sort((a, b) => new Date(b.courseStartDate) - new Date(a.courseStartDate));
    } else {
      results.sort((a, b) => new Date(a.courseStartDate) - new Date(b.courseStartDate));
    }
    
    setFilteredRequests(results);
  }, [paymentRequests, searchQuery, classLevelFilter, sortOrder, userMetadata]);

  // Handle approve action
  const handleApprove = async (profileId) => {
    setApproveLoading(prev => ({ ...prev, [profileId]: true }));
    try {
      const response = await updatePaymentStatusByProfileId(profileId, "Payment Verified");
      if (response.status === 200) {
        // Remove the updated item if we're not in the "Payment Verified" view
        if (statusFilter !== "Payment Verified") {
          setPaymentRequests(prev => prev.filter(item => item.profile_id !== profileId));
          setFilteredRequests(prev => prev.filter(item => item.profile_id !== profileId));
        } else {
          // Update the status in the current list
          setPaymentRequests(prev => 
            prev.map(item => 
              item.profile_id === profileId ? { ...item, paymentStatus: "Payment Verified" } : item
            )
          );
          setFilteredRequests(prev => 
            prev.map(item => 
              item.profile_id === profileId ? { ...item, paymentStatus: "Payment Verified" } : item
            )
          );
        }
        alert("Payment approved successfully!");
      } else {
        alert("Failed to approve payment.");
      }
    } catch (error) {
      console.error("Error approving payment:", error);
      alert("An error occurred while approving payment.");
    } finally {
      setApproveLoading(prev => ({ ...prev, [profileId]: false }));
    }
  };

  // Handle reject action
  const handleReject = async (profileId) => {
    setRejectLoading(prev => ({ ...prev, [profileId]: true }));
    try {
      const response = await updatePaymentStatusByProfileId(profileId, "Rejected");
      if (response.status === 200) {
        // Remove the updated item if we're not in the "Rejected" view
        if (statusFilter !== "Rejected") {
          setPaymentRequests(prev => prev.filter(item => item.profile_id !== profileId));
          setFilteredRequests(prev => prev.filter(item => item.profile_id !== profileId));
        } else {
          // Update the status in the current list
          setPaymentRequests(prev => 
            prev.map(item => 
              item.profile_id === profileId ? { ...item, paymentStatus: "Rejected" } : item
            )
          );
          setFilteredRequests(prev => 
            prev.map(item => 
              item.profile_id === profileId ? { ...item, paymentStatus: "Rejected" } : item
            )
          );
        }
        alert("Payment rejected successfully!");
      } else {
        alert("Failed to reject payment.");
      }
    } catch (error) {
      console.error("Error rejecting payment:", error);
      alert("An error occurred while rejecting payment.");
    } finally {
      setRejectLoading(prev => ({ ...prev, [profileId]: false }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && selectedImage) {
        closeImageModal();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [selectedImage]);

  return (
    <div className={styles.main_page}>
      <Navbar />
      {isSidebarOpen && <Sidebar />}
      <div className={styles.content}>
        <div className={styles.payment_verification_container}>
          <h1 className={styles.page_title}>Payment Verification</h1>
          
          <div className={styles.filters_section}>
            <div className={styles.search_filter}>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.search_input}
              />
            </div>
            
            <div className={styles.filter_group}>
              <div className={styles.filter_item}>
                <label>Status:</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={styles.filter_select}
                >
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Payment Verified">Payment Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              
              <div className={styles.filter_item}>
                <label>Class Level:</label>
                <select 
                  value={classLevelFilter} 
                  onChange={(e) => setClassLevelFilter(e.target.value)}
                  className={styles.filter_select}
                >
                  <option value="all">All Levels</option>
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div className={styles.filter_item}>
                <label>Sort:</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={styles.filter_select}
                >
                  <option value="oldest">Oldest First</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className={styles.loader}>
              <TailSpin color="#51bbcc" height={50} width={50} />
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className={styles.payment_requests_list}>
              {filteredRequests.map((request) => {
                const userData = userMetadata[request.profile_id] || {};
                return (
                  <div key={request.id} className={styles.payment_request_card}>
                    <div className={styles.request_header}>
                      <h3>{userData.name || "Unknown User"} - {request.phoneNumber}</h3>
                      <p>Profile ID: {request.profile_id}</p>
                    </div>
                    
                    <div className={styles.request_details}>
                      <div className={styles.request_info}>
                        <p><strong>Payment Date:</strong> {formatDate(request.courseStartDate)}</p>
                        <p><strong>Status:</strong> {request.paymentStatus}</p>
                        <p><strong>Class Level:</strong> {userData.classLevel || "Not specified"}</p>
                      </div>
                      
                      <div className={styles.payment_proof}>
                        {request.paymentProof ? (
                          <div>
                            <img 
                              src={request.paymentProof} 
                              alt="Payment Proof" 
                              className={styles.payment_thumbnail}
                              onClick={() => openImageModal(request.paymentProof)}
                            />
                            <p className={styles.view_image_text} onClick={() => openImageModal(request.paymentProof)}>
                              View Full Image
                            </p>
                          </div>
                        ) : (
                          <p className={styles.no_proof}>No payment proof available</p>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.action_buttons}>
                      {statusFilter === "Pending Approval" && (
                        <>
                          <button 
                            className={`${styles.approve_button} ${approveLoading[request.profile_id] ? styles.loading_button : ''}`}
                            onClick={() => handleApprove(request.profile_id)}
                            disabled={approveLoading[request.profile_id] || rejectLoading[request.profile_id]}
                          >
                            {approveLoading[request.profile_id] ? (
                              <TailSpin color="#ffffff" height={20} width={20} />
                            ) : "Approve"}
                          </button>
                          <button 
                            className={`${styles.reject_button} ${rejectLoading[request.profile_id] ? styles.loading_button : ''}`}
                            onClick={() => handleReject(request.profile_id)}
                            disabled={approveLoading[request.profile_id] || rejectLoading[request.profile_id]}
                          >
                            {rejectLoading[request.profile_id] ? (
                              <TailSpin color="#ffffff" height={20} width={20} />
                            ) : "Reject"}
                          </button>
                        </>
                      )}
                      
                      {statusFilter === "Rejected" && (
                        <button 
                          className={`${styles.approve_button} ${approveLoading[request.profile_id] ? styles.loading_button : ''}`}
                          onClick={() => handleApprove(request.profile_id)}
                          disabled={approveLoading[request.profile_id]}
                        >
                          {approveLoading[request.profile_id] ? (
                            <TailSpin color="#ffffff" height={20} width={20} />
                          ) : "Approve Instead"}
                        </button>
                      )}
                      
                      {statusFilter === "Payment Verified" && (
                        <button 
                          className={`${styles.reject_button} ${rejectLoading[request.profile_id] ? styles.loading_button : ''}`}
                          onClick={() => handleReject(request.profile_id)}
                          disabled={rejectLoading[request.profile_id]}
                        >
                          {rejectLoading[request.profile_id] ? (
                            <TailSpin color="#ffffff" height={20} width={20} />
                          ) : "Reject Instead"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.no_requests}>
              <p>No payment requests found</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Image Modal */}
      {selectedImage && (
        <div className={styles.image_modal} onClick={closeImageModal}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <span className={styles.close_button} onClick={closeImageModal}>&times;</span>
            </div>
            <img src={selectedImage} alt="Payment Proof" className={styles.full_image} />
            <div className={styles.modal_footer}>
              <button className={styles.close_button} onClick={closeImageModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification; 