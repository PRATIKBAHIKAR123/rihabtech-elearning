import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  BarChart3,
  BookOpen,
  Users
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { payoutService, PayoutRequest, EarningsSummary, PayoutBreakdown, CourseEarnings } from "../../../utils/payoutService";
import { toast } from "sonner";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function InstructorPayment() {
  console.log('InstructorPayment function called');
  const { user } = useAuth();
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([]);
  const [courseEarnings, setCourseEarnings] = useState<CourseEarnings[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState<{ month: string; earnings: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [currentMonthBreakdown, setCurrentMonthBreakdown] = useState<PayoutBreakdown | null>(null);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'history' | 'analytics'>('overview');

  // Debug logging
  useEffect(() => {
    console.log('InstructorPayment component mounted');
    console.log('User object:', user);
    console.log('User UserName:', user?.UserName);
    console.log('Component state - loading:', loading, 'error:', error);
  }, [user, loading, error]);

  useEffect(() => {
    console.log('Attempting to load payment data...');
    if (user?.UserName) {
      console.log('User authenticated, loading payment data for:', user.UserName);
      loadPaymentData();
    } else {
      console.log('No user or UserName, setting loading to false');
      setLoading(false);
      setError('User not authenticated');
    }
  }, [user?.UserName]);

  // Recalculate current month breakdown when month changes
  useEffect(() => {
    const updateCurrentMonthBreakdown = async () => {
      if (!user?.UserName) return;
      
      try {
        console.log('Updating month breakdown for:', selectedMonth, selectedYear);
        const breakdown = await payoutService.calculateEarnings(
          user.UserName, 
          selectedMonth, 
          selectedYear
        );
        setCurrentMonthBreakdown(breakdown);

        // Load course earnings for the selected month
        const courseEarningsData = await payoutService.getCourseEarnings(
          user.UserName,
          selectedMonth,
          selectedYear
        );
        setCourseEarnings(courseEarningsData);
      } catch (error) {
        console.error('Error updating month breakdown:', error);
      }
    };

    updateCurrentMonthBreakdown();
  }, [user?.UserName, selectedMonth, selectedYear]);

  // Load monthly earnings for analytics
  useEffect(() => {
    const loadMonthlyEarnings = async () => {
      if (!user?.UserName) return;
      
      try {
        const monthlyData = await payoutService.getMonthlyEarnings(user.UserName, selectedYear);
        setMonthlyEarnings(monthlyData);
      } catch (error) {
        console.error('Error loading monthly earnings:', error);
      }
    };

    loadMonthlyEarnings();
  }, [user?.UserName, selectedYear]);

  // Simple fallback to prevent blank page
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment & Earnings</h1>
          <p className="text-gray-600">Loading user information...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Test render to ensure component is working
  console.log('Component is about to render main content');

  const loadPaymentData = async () => {
    try {
      console.log('Starting to load payment data...');
      setLoading(true);
      setError(null);
      
      if (!user?.UserName) {
        console.error('No user UserName found');
        toast.error('User not authenticated');
        setError('User not authenticated');
        return;
      }

      // Test Firebase connection
      console.log('Testing Firebase connection...');
      try {
        const testQuery = query(collection(db, 'users'), where('email', '==', user.UserName));
        const testSnapshot = await getDocs(testQuery);
        console.log('Firebase connection test successful, found users:', testSnapshot.docs.length);
      } catch (firebaseError) {
        console.error('Firebase connection test failed:', firebaseError);
        setError('Firebase connection failed. Using mock data.');
        // Use mock data as fallback
        setEarningsSummary(payoutService.getMockEarningsSummary());
        setPayoutHistory(payoutService.getMockPayoutHistory());
        setCourseEarnings(payoutService.getMockCourseEarnings());
        setLoading(false);
        return;
      }

      console.log('Loading earnings summary...');
      // Load earnings summary
      const summary = await payoutService.getEarningsSummary(user.UserName);
      console.log('Earnings summary loaded:', summary);
      setEarningsSummary(summary);

      console.log('Loading payout history...');
      // Load payout history
      const history = await payoutService.getPayoutHistory(user.UserName);
      console.log('Payout history loaded:', history);
      setPayoutHistory(history);

      console.log('Calculating current month breakdown...');
      // Calculate current month breakdown
      const breakdown = await payoutService.calculateEarnings(
        user.UserName, 
        selectedMonth, 
        selectedYear
      );
      console.log('Current month breakdown calculated:', breakdown);
      setCurrentMonthBreakdown(breakdown);

      console.log('Loading course earnings...');
      // Load course earnings
      const courseEarningsData = await payoutService.getCourseEarnings(
        user.UserName,
        selectedMonth,
        selectedYear
      );
      console.log('Course earnings loaded:', courseEarningsData);
      setCourseEarnings(courseEarningsData);

      console.log('Loading monthly earnings...');
      // Load monthly earnings for analytics
      const monthlyData = await payoutService.getMonthlyEarnings(user.UserName, selectedYear);
      console.log('Monthly earnings loaded:', monthlyData);
      setMonthlyEarnings(monthlyData);

      console.log('All payment data loaded successfully');

          } catch (error) {
        console.error('Error loading payment data:', error);
        toast.error('Failed to load payment data');
        setError('Failed to load payment data. Using mock data instead.');
        
        // Use mock data as fallback
        console.log('Loading mock data as fallback...');
        setEarningsSummary(payoutService.getMockEarningsSummary());
        setPayoutHistory(payoutService.getMockPayoutHistory());
        setCourseEarnings(payoutService.getMockCourseEarnings());
        
        // Also set monthly earnings
        setMonthlyEarnings([
          { month: '2025-01', earnings: 1500 },
          { month: '2025-02', earnings: 2200 },
          { month: '2025-03', earnings: 1800 }
        ]);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'processed':
        return 'Processed';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  const handleRequestPayout = async () => {
    if (!user?.UserName) {
      toast.error('Please log in to request a payout');
      return;
    }

    if (!currentMonthBreakdown || currentMonthBreakdown.instructorShare < 1000) {
      toast.error('Minimum payout amount is ₹1000');
      return;
    }

    try {
      setRequestingPayout(true);
      
      const payoutId = await payoutService.requestPayout(user.UserName, selectedMonth, selectedYear);
      
      toast.success('Payout request submitted successfully!');
      
      // Reload data to show updated status
      await loadPaymentData();
      
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to request payout');
    } finally {
      setRequestingPayout(false);
    }
  };

  const handleDownloadReport = () => {
    // Implement report download logic
    console.log('Downloading report for month:', selectedMonth);
    toast.success('Report download started');
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedMonth(`${year}-${new Date().getMonth() + 1}`.padStart(2, '0'));
  };

  // Show error state
  if (error && !loading) {
    return (
      <div className="flex flex-col min-h-screen p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment & Earnings</h1>
          <p className="text-gray-600">There was an issue loading your payment information</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <h3 className="text-xl font-medium text-red-900 mb-2">Error Loading Data</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button 
            onClick={loadPaymentData}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Always show something to prevent blank page
  console.log('Component rendering main content. User:', user?.UserName, 'Loading:', loading, 'Error:', error);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment & Earnings</h1>
          <p className="text-gray-600">Loading your payment information...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show authentication required state
  if (!user?.UserName) {
    return (
      <div className="flex flex-col min-h-screen p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment & Earnings</h1>
          <p className="text-gray-600">Please log in to view your payment information</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-blue-400" />
          <h3 className="text-xl font-medium text-blue-900 mb-2">Authentication Required</h3>
          <p className="text-blue-700 mb-4">You need to be logged in to access your payment information.</p>
          <Button 
            onClick={() => window.location.hash = '#/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment & Earnings</h1>
        <p className="text-gray-600">Track your earnings, request payouts, and view payment history</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: DollarSign },
              { id: 'earnings', label: 'Course Earnings', icon: BookOpen },
              { id: 'history', label: 'Payout History', icon: Clock },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Month and Year Selector */}
          <div className="mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label htmlFor="year-selector" className="text-sm font-medium text-gray-700">
                  Year:
                </label>
                <select
                  id="year-selector"
                  value={selectedYear}
                  onChange={(e) => handleYearChange(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[2023, 2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="month-selector" className="text-sm font-medium text-gray-700">
                  Month:
                </label>
                <input
                  type="month"
                  id="month-selector"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Earnings Summary Cards */}
          {earningsSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(earningsSummary.totalEarnings)}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                    <p className="text-2xl font-bold text-yellow-600">{formatCurrency(earningsSummary.pendingPayouts)}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available for Payout</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(earningsSummary.availableForPayout)}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Watch Time</p>
                    <p className="text-2xl font-bold text-purple-600">{earningsSummary.totalWatchTime}h</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
              <div className="text-gray-500">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Earnings Yet</h3>
                <p className="text-gray-500 mb-4">
                  You haven't earned any revenue yet. Start creating courses and building your audience to begin earning!
                </p>
                <Button 
                  onClick={() => window.location.hash = '#/instructor/course-title'}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Create Your First Course
                </Button>
              </div>
            </div>
          )}

          {/* Current Month Breakdown */}
          {currentMonthBreakdown && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Month Breakdown ({formatMonth(selectedMonth)})</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Base Amount</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(currentMonthBreakdown.baseAmount)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Tax (18%)</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(currentMonthBreakdown.taxAmount)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Platform Fee (40%)</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(currentMonthBreakdown.platformFee)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Your Share (60%)</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(currentMonthBreakdown.instructorShare)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(currentMonthBreakdown.totalAmount)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {earningsSummary && (
            <div className="flex flex-wrap gap-4 mb-8">
              {earningsSummary.availableForPayout >= 1000 && (
                <Button 
                  onClick={handleRequestPayout}
                  disabled={requestingPayout}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <DollarSign className="h-5 w-5" />
                  {requestingPayout ? 'Requesting...' : 'Request Payout'}
                </Button>
              )}
              
              {earningsSummary.availableForPayout < 1000 && earningsSummary.availableForPayout > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800 text-sm">
                    Minimum payout amount is ₹1000. Current available: ₹{earningsSummary.availableForPayout.toLocaleString()}
                  </span>
                </div>
              )}
              
              <Button 
                onClick={handleDownloadReport}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                Download Report
              </Button>
            </div>
          )}
        </>
      )}

      {/* Course Earnings Tab */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Earnings for {formatMonth(selectedMonth)}</h3>
            {courseEarnings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Watch Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollments</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courseEarnings.map((course) => (
                      <tr key={course.courseId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{course.courseTitle}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {course.watchMinutes} minutes
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {formatCurrency(course.earnings)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {course.enrollments}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No course earnings data available for this month.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payout History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {earningsSummary ? (
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Payout History</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Watch Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform Fee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payoutHistory.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatMonth(payout.month)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payout.watchTimeMinutes} minutes
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payout.courseCount} courses
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(payout.platformFee || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payout.status)}
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                              {getStatusText(payout.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(payout.requestDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {payoutHistory.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Payout History</h3>
                    <p className="text-gray-500">
                      {earningsSummary && earningsSummary.availableForPayout > 0 
                        ? `You have ₹${earningsSummary.availableForPayout.toLocaleString()} available for payout. Request a payout when you're ready!`
                        : "Start creating courses and earning to see your payout history."
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Earnings for {selectedYear}</h3>
            {monthlyEarnings.length > 0 ? (
              <div className="space-y-4">
                {monthlyEarnings.map((monthData) => (
                  <div key={monthData.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{formatMonth(monthData.month)}</span>
                    <span className="font-semibold text-green-600">{formatCurrency(monthData.earnings)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No analytics data available for this year.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Information */}
      {earningsSummary && activeTab === 'overview' && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">How Payouts Work</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Payouts are processed monthly based on watch time</li>
              <li>• Platform fee is deducted from your earnings</li>
              <li>• Minimum payout amount: ₹1000</li>
              <li>• Payouts are processed within 5-7 business days</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Earnings Calculation</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>• Earnings based on paid watch minutes</li>
              <li>• Free courses and previews are excluded</li>
              <li>• Revenue sharing: 60% instructor, 40% platform</li>
              <li>• Tax is calculated on the total amount</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
