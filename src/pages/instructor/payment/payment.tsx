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
  AlertCircle
} from "lucide-react";
import { Button } from "../../../components/ui/button";

interface PayoutRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestDate: Date;
  processedDate?: Date;
  watchTimeMinutes: number;
  courseCount: number;
  month: string;
  year: number;
  notes?: string;
}

interface EarningsSummary {
  totalEarnings: number;
  pendingPayouts: number;
  processedPayouts: number;
  currentMonthEarnings: number;
  totalWatchTime: number;
  totalCourses: number;
}

export default function InstructorPayment() {
  const { user } = useAuth();
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    pendingPayouts: 0,
    processedPayouts: 0,
    currentMonthEarnings: 0,
    totalWatchTime: 0,
    totalCourses: 0
  });
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );

  useEffect(() => {
    if (user?.UserName) {
      loadPaymentData();
    }
  }, [user?.UserName, selectedMonth]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockEarnings: EarningsSummary = {
        totalEarnings: 25000,
        pendingPayouts: 8500,
        processedPayouts: 16500,
        currentMonthEarnings: 8500,
        totalWatchTime: 1250,
        totalCourses: 3
      };
      
      const mockPayouts: PayoutRequest[] = [
        {
          id: '1',
          amount: 8500,
          status: 'pending',
          requestDate: new Date('2025-01-15'),
          watchTimeMinutes: 450,
          courseCount: 2,
          month: '2025-01',
          year: 2025
        },
        {
          id: '2',
          amount: 8000,
          status: 'processed',
          requestDate: new Date('2024-12-15'),
          processedDate: new Date('2024-12-20'),
          watchTimeMinutes: 400,
          courseCount: 2,
          month: '2024-12',
          year: 2024
        },
        {
          id: '3',
          amount: 8500,
          status: 'processed',
          requestDate: new Date('2024-11-15'),
          processedDate: new Date('2024-11-20'),
          watchTimeMinutes: 400,
          courseCount: 2,
          month: '2024-11',
          year: 2024
        }
      ];

      setEarningsSummary(mockEarnings);
      setPayoutHistory(mockPayouts);
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
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

  const handleRequestPayout = () => {
    // Implement payout request logic
    console.log('Requesting payout for month:', selectedMonth);
  };

  const handleDownloadReport = () => {
    // Implement report download logic
    console.log('Downloading report for month:', selectedMonth);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment & Earnings</h1>
        <p className="text-gray-600">Track your earnings, request payouts, and view payment history</p>
      </div>

      {/* Month Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <label htmlFor="month-selector" className="text-sm font-medium text-gray-700">
            Select Month:
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

      {/* Earnings Summary Cards */}
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
              <p className="text-sm font-medium text-gray-600">Current Month</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(earningsSummary.currentMonthEarnings)}</p>
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          onClick={handleRequestPayout}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <DollarSign className="h-5 w-5" />
          Request Payout
        </Button>
        
        <Button 
          onClick={handleDownloadReport}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <Download className="h-5 w-5" />
          Download Report
        </Button>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Payout History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Watch Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payoutHistory.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(payout.month + '-01').toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long'
                    })}
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
              <p className="text-gray-500">You haven't requested any payouts yet.</p>
            </div>
          </div>
        )}
      </div>

      {/* Additional Information */}
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
    </div>
  );
}
