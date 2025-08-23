
import { User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { dashboardService, ReviewData } from "../../../utils/dashboardService";
import { toast } from "sonner";

interface Testimonial {
    name: string;
    role: string;
    message: string;
    rating: number;
  }
  
  const testimonials: Testimonial[] = [
    {
      name: "Mehul Shah",
      role: "Student",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla a eleifend elit. Orci varius natoque penatibus",
      rating: 5,
    },
    {
      name: "Mehul Shah",
      role: "Student",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla a eleifend elit. Orci varius natoque penatibus",
      rating: 5,
    },
    {
      name: "Mehul Shah",
      role: "Student",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla a eleifend elit. Orci varius natoque penatibus",
      rating: 5,
    },
  ];

export default function Reviews()  {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const { user } = useAuth();

    const loadReviewsData = async (isRefresh = false) => {
        if (!user?.UserName) return;
        
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            const reviewsData = await dashboardService.getReviewsData(user.UserName);
            setReviews(reviewsData);
        } catch (error) {
            console.error('Error loading reviews data:', error);
            // Fallback to mock data
            setReviews([
                {
                    id: '1',
                    studentName: 'Mehul Shah',
                    studentRole: 'Student',
                    rating: 5,
                    reviewText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla a eleifend elit. Orci varius natoque penatibus',
                    courseId: 'course-1',
                    courseTitle: 'Web Development Fundamentals',
                    reviewDate: new Date('2025-01-15'),
                    isReplied: false
                },
                {
                    id: '2',
                    studentName: 'Rajesh Kumar',
                    studentRole: 'Student',
                    rating: 4,
                    reviewText: 'Excellent course with practical examples. Highly recommended for beginners.',
                    courseId: 'course-2',
                    courseTitle: 'React.js Masterclass',
                    reviewDate: new Date('2025-01-10'),
                    isReplied: true,
                    replyText: 'Thank you for your feedback! We\'re glad you found the course helpful.',
                    replyDate: new Date('2025-01-11')
                },
                {
                    id: '3',
                    studentName: 'Priya Singh',
                    studentRole: 'Student',
                    rating: 5,
                    reviewText: 'Great content and clear explanations. The instructor is very knowledgeable.',
                    courseId: 'course-3',
                    courseTitle: 'Node.js Backend Development',
                    reviewDate: new Date('2025-01-08'),
                    isReplied: false
                }
            ]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadReviewsData();
    }, [user?.UserName]);

    const handleRefresh = () => {
        loadReviewsData(true);
    };

    const handleReplyClick = (review: ReviewData) => {
        setSelectedReview(review);
        if (review.isReplied && review.replyText) {
            setReplyText(review.replyText);
        } else {
            setReplyText('');
        }
        setShowReplyModal(true);
    };

    const handleSubmitReply = async () => {
        if (!selectedReview || !replyText.trim()) return;
        
        try {
            setSubmittingReply(true);
            
            // Update the review with the reply
            const updatedReviews = reviews.map(review => 
                review.id === selectedReview.id 
                    ? { 
                        ...review, 
                        isReplied: true, 
                        replyText: replyText.trim(),
                        replyDate: new Date()
                    }
                    : review
            );
            
            setReviews(updatedReviews);
            
            // Close modal and reset state
            setShowReplyModal(false);
            setSelectedReview(null);
            setReplyText('');
            
            // Show success message
            toast.success('Reply submitted successfully!');
            
        } catch (error) {
            console.error('Error submitting reply:', error);
            toast.error('Failed to submit reply. Please try again.');
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleCloseModal = () => {
        setShowReplyModal(false);
        setSelectedReview(null);
        setReplyText('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
             
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
          <h1 className="form-title mr-6">Student Reviews</h1>
          <div>
          <Select defaultValue="all">
                            <SelectTrigger className="rounded-none text-primary border border-primary">
                                <SelectValue placeholder="Choose a Currency" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="all">All Courses</SelectItem>
                                <SelectItem value="development">Development</SelectItem>

                            </SelectContent>
                        </Select>
                        </div>
          </div>
          
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline" 
            className="rounded-none border-primary text-primary hover:bg-primary hover:text-white"
          >
            {refreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Refreshing...
              </>
            ) : (
              'Refresh Reviews'
            )}
          </Button>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] shadow-md p-6 text-left border border-gray-100"
          >
            <div className="flex flex-col items-center">
            <div className="flex items-center justify-start w-full gap-3">
              <div className="w-12 h-12 bg-[#c9c9c9] rounded-full flex items-center justify-center text-gray-500 text-lg">
                <User/>
              </div>
              <div>
              <h3 className="mt-2  text-[#1e2532] text-lg font-semibold font-['Inter'] leading-7">{review.studentName}</h3>
              <p className=" text-[#495565] text-sm font-normal font-['Inter'] leading-tight">{review.studentRole}</p>
              </div>
              </div>
              <div className="flex justify-left text-yellow-500 w-full mt-2">
              {[...Array(review.rating)].map((_, i) => (
                      <img src="Images/icons/Container (6).png" className="h-4 w-4" alt="Star" key={i} />
                       
                    ))}
              </div>
              <p className="text-[#354152] text-sm font-normal font-['Inter'] leading-[21px] mt-3">{review.reviewText}</p>
              
              {/* Show existing reply if available */}
              {review.isReplied && review.replyText && (
                <div className="w-full mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-xs text-blue-600 font-medium mb-1">Your Reply:</p>
                      <p className="text-sm text-blue-800">{review.replyText}</p>
                      {review.replyDate && (
                        <p className="text-xs text-blue-500 mt-1">
                          {review.replyDate.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                variant={'outline'} 
                className="rounded-none w-full border border-primary text-primary mt-4"
                onClick={() => handleReplyClick(review)}
              >
                {review.isReplied ? 'Edit Reply' : 'Reply'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedReview.isReplied ? 'Edit Reply' : 'Reply to Review'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Student Review</h4>
                <p className="text-gray-700">{selectedReview.reviewText}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>By: {selectedReview.studentName}</span>
                  <span>Course: {selectedReview.courseTitle}</span>
                  <span>Rating: {selectedReview.rating}/5</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  rows={4}
                  placeholder="Write your reply to the student..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                disabled={submittingReply}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReply}
                disabled={submittingReply || !replyText.trim()}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {submittingReply ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Reply'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      </>
    );
  };