import { BarChart2, Calendar, ChevronDown } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Button } from "../../../components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "../../../components/ui/table";
import { MouseEventHandler, useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../../components/ui/select";
import { useAuth } from "../../../context/AuthContext";
import { dashboardService, DashboardStats, RevenueData } from "../../../utils/dashboardService";
import { CourseDisplayData } from "../course/courseList";
import { getInstructorCourses } from "../../../utils/firebaseInstructorCourses";
import { format } from "date-fns";
import revenueSharingService, { MonthlyRevenueSummary } from "../../../utils/revenueSharingService";

export const Overview = () =>{
    const [revenueMonthly, setRevenueMonthly] = useState<MonthlyRevenueSummary[]>([]);
    const [showmonthWiseReport, setShowMonthWiseReport] = useState(false);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [revenueStats, setRevenueStats] = useState<RevenueData[]>([]);
    const [courses, setCourses] = useState<CourseDisplayData[]>([]);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

    const [selectedCourse, setSelectedCourse] = useState<string >('all-courses');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const loadDashboardData = async () => {
            const instructorId = user?.UserName || user?.email; // Fallback for testing
            if (!instructorId) {
                console.log("No user UserName or email found:", user);
                return;
            }
            
            console.log("Loading dashboard data for instructor:", instructorId);
            
            try {
                setLoading(true);
                const [stats, revenue] = await Promise.all([
                    dashboardService.getDashboardStats(instructorId,selectedCourse==='all-courses'?null:selectedCourse),
                    dashboardService.getRevenueStatistics(instructorId, new Date().getFullYear())
                ]);

                const revenueWithMonthNames = revenue.map((item) => ({
                ...item,
                month: monthNames[parseInt(item.month, 10) - 1],
                }));
              setDashboardStats(stats);
              setRevenueStats(revenueWithMonthNames);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                // Fallback to mock data
                setDashboardStats(dashboardService.getMockDashboardStats());
                setRevenueStats([
                    { month: 'May', revenue: 8000, enrollments: 0, percentage: 80 },
                    { month: 'Jun', revenue: 6500, enrollments: 0, percentage: 65 },
                    { month: 'Jul', revenue: 8000, enrollments: 0, percentage: 80 },
                    { month: 'Aug', revenue: 5000, enrollments: 0, percentage: 50 },
                    { month: 'Sep', revenue: 10000, enrollments: 0, percentage: 100 },
                    { month: 'Oct', revenue: 7500, enrollments: 0, percentage: 75 },
                    { month: 'Nov', revenue: 7500, enrollments: 0, percentage: 75 },
                    { month: 'Dec', revenue: 7500, enrollments: 0, percentage: 75 },
                    { month: 'Jan', revenue: 8000, enrollments: 0, percentage: 80 },
                    { month: 'Feb', revenue: 7000, enrollments: 0, percentage: 70 }
                ]);
            } finally {
                setLoading(false);
            }
        };

        const fetchInstructorCourses = async () => {
                try {
                    setLoading(true);
                    
                    const instructorId = user?.UserName || user?.email || 'abdulquader152@gmail.com'; // Fallback for testing
                    if (!instructorId) {
                        console.log("No user email found");
                        return;
                    }
        
                    console.log("Fetching courses for instructor:", instructorId);
                    const instructorCourses = await getInstructorCourses(instructorId);
                    
                    // Transform Firebase data to match the UI structure
                    const transformedCourses: CourseDisplayData[] = instructorCourses.map(course => ({
                        ...course,
                        // Add mock data for fields not in Firebase (for now)
                        earnings: Math.floor(Math.random() * 5000) + 500, // Random earnings between 500-5500
                        enrollments: Math.floor(Math.random() * 100) + 20, // Random enrollments between 20-120
                        ratings: Math.floor(Math.random() * 200) + 500, // Random ratings between 500-700
                        ratingScore: parseFloat((Math.random() * 2 + 3).toFixed(1)) // Random rating between 3.0-5.0
                    }));
                    
                    console.log("Transformed courses:", transformedCourses);
                    setCourses(transformedCourses);
        
                } catch (err) {
                    console.error("Error fetching courses:", err);
                    
                } finally {
                    setLoading(false);
                }
            };

            const loadMonthlyRevenueData = async () => {
            const instructorId = user?.UserName || user?.email || 'abdulquader152@gmail.com'; // Fallback for testing
            if (!instructorId) return;
            
            try {
                setLoading(true);
                console.log("Loading monthly revenue data for instructor:", instructorId);
                const monthlyrevenueData = await 
                    revenueSharingService.getInstructorRevenueSummary(instructorId,2025)
                
                console.log("Monthly Revenue Data:", monthlyrevenueData);
                console.log("Monthly Breakdown:", monthlyrevenueData.monthlyBreakdown);
                
                if (monthlyrevenueData.monthlyBreakdown && monthlyrevenueData.monthlyBreakdown.length > 0) {
                    setRevenueMonthly(monthlyrevenueData.monthlyBreakdown);
                } else {
                    console.log("No monthly breakdown data found");
                    setRevenueMonthly([]);
                }
            } catch (error) {
                console.error("Error loading monthly revenue data:", error);
                setRevenueMonthly([]);
            } finally {
                setLoading(false);
            }
        };
      loadMonthlyRevenueData();
      fetchInstructorCourses();
      loadDashboardData();
        
    }, [user?.UserName]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <img src="/icons/loader.gif" alt="Loading..." className="w-16 h-16 mb-4" />
                <p className="text-gray-600">Loading dashboard data...</p>
            </div>
        );
    }

    return(
        <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            {/* <Select onValueChange={(value) => setSelectedCourse(value)} value={selectedCourse || "all-courses"}>
            <SelectTrigger className="form-title mr-2 border-none shadow-none outline-none truncate max-w-lg">{selectedCourse
      ? courses.find((c) => c.id === selectedCourse)?.title || "All Courses"
      : "All Courses"}</SelectTrigger>
            <SelectContent>
              <SelectItem value='all-courses' className="cursor-pointer">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id} className="cursor-pointer">
                  {course.title.length > 30 ? course.title.substring(0, 30) + "..." : course.title}
                </SelectItem>
              ))}
            </SelectContent>
            </Select> */}
            {/* <ChevronDown size={20} className="text-gray-500" /> */}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <StatsCard 
            title="Total Watch Time" 
            value={dashboardStats?.totalWatchtime ? `${dashboardStats.totalWatchtime.toLocaleString()} Min` : '0 Min'}
            growth={dashboardStats?.totalCourses.toString() || '0'}
            period="Total Courses" 
          />
          <StatsCard 
            title="Total Revenue" 
            value={`₹${dashboardStats?.totalRevenue.toLocaleString() || '0'}`}
            growth={dashboardStats?.currentMonthRevenue.toLocaleString() || '0'}
            period="This Month" 
          />
          <StatsCard 
            title="Total Enrollment" 
            value={dashboardStats?.totalEnrollments.toLocaleString() || '0'}
            growth={dashboardStats?.currentMonthEnrollments.toLocaleString() || '0'}
            period="This Month" 
          />
          <StatsCard 
            title="Total Students" 
            value={dashboardStats?.totalStudents.toLocaleString() || '0'}
            growth={dashboardStats?.totalCourses.toString() || '0'}
            period="Total Courses" 
          />
        </div>
        <RevenueChart data={revenueStats} onClick={() => setShowMonthWiseReport((prev) => !prev)}/>
        {showmonthWiseReport&&
            <MonthWiseReports data={revenueMonthly}/>
        }
      </div>
    )
}

interface StatsCardProps {
  title: string;
  value: string;
  growth: string;
  period: string;
}

const StatsCard = ({ title, value, growth, period }: StatsCardProps) => {
    return (
      <div className="p-4 bg-white rounded-lg shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] shadow-md flex-1">
        <h3 className="text-black text-xl font-normal font-['Inter'] leading-[30px] mb-2">{title}</h3>
        <div className="flex justify-between items-start">
          <div>
            
            <p className=" text-primary text-[27px] font-semibold font-['Inter'] leading-10">{value}</p>
          </div>
          {/* <div className="text-right">
            <p className="text-primary text-[15px] font-semibold font-['Inter'] leading-snug">{growth}</p>
            <p className="text-black text-[10px] font-semibold font-['Inter'] leading-[15px]">{period}</p>
          </div> */}
        </div>
      </div>
    );
  };


  interface RevenueChartProps {
      onClick: () => void;
      data: RevenueData[];
    }

  const RevenueChart = ({ onClick, data }: RevenueChartProps) => {
    const chartData = data.map(item => ({
      month: item.month,
      value: item.revenue
    }));
  
    return (
      <div className="p-4 bg-white rounded-lg shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] mt-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-gray-700 font-medium">Revenue Statistics</h2>
          <div className="flex items-center border border-gray-300 rounded-md px-2 py-1">
          <Calendar size={16} className="text-gray-500  mr-2" />
            <span className="text-sm text-gray-600">Monthly</span>
            
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={25} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis
              dataKey="revenue"
                axisLine={false}
                tickLine={false}
                ticks={[0, 2500, 5000, 7500, 10000]}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <CartesianGrid vertical={false} color="#bbb" strokeDasharray="0" />
              <Bar dataKey="value" fill="#FF6B00" width={0.20} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-left mt-4">
          <Button className=" text-sm font-medium" onClick={onClick}>
            Check Revenue Report
          </Button>
        </div>
      </div>
    );
  };


  const MonthWiseReports = ({data}:any) =>{

    console.log("Monthly Revenue Data in Report Component:", data);

    if (!data || data.length === 0) {
      return (
        <div className="p-4 mt-4">
          <h1 className="py-2 text-[#414d55] text-base font-medium font-['Poppins'] leading-tight tracking-tight">Month Wise Report</h1>
          <div className="text-center py-8 text-gray-500">
            No revenue data available for the selected period.
          </div>
        </div>
      );
    }

    const tableData = data.map((row:any) => {
      const [year, month] = row?.month?.split("-");
      const monthName = new Date(Number(year), Number(month) - 1).toLocaleString("default", {
        month: "long",
      });

      return {
        month: `${monthName} ${year}`,
        preTax: row.totalRevenue || 0,         // Pre-Tax Amount
        withoutHolding: row.subscriptionRevenue || 0,        // Without Holding Tax
        netEarning: row.totalInstructorShare || 0,   // Net Earning
        watchTime: row.totalWatchTime || 0,    // Total Watch Time
        payoutDate: row.processedDate
          ? format(row.processedDate.toDate(), "dd MMM yyyy")
          : "N/A",
      };
    });

    // Calculate totals
    const totals = tableData.reduce((acc: any, row: any) => ({
      preTax: acc.preTax + row.preTax,
      withoutHolding: acc.withoutHolding + row.withoutHolding,
      netEarning: acc.netEarning + row.netEarning,
      watchTime: acc.watchTime + row.watchTime,
    }), { preTax: 0, withoutHolding: 0, netEarning: 0, watchTime: 0 });
   
    return(
        <div className="p-4 mt-4">
            <h1 className="py-2 text-[#414d55] text-base font-medium font-['Poppins'] leading-tight tracking-tight">Month Wise Report</h1>
            <Table>
          <TableHeader className="ins-table-header">
          <TableRow className="table-head-text">
            <TableHead>Time Period</TableHead>
            <TableHead>Pre Tax Amount</TableHead>
            <TableHead>Without Holding Tax</TableHead>
            <TableHead>Net Earning</TableHead>
            <TableHead>Watch Time (Min)</TableHead>
            <TableHead>Expected Payout Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row:any, index:number) => (
            <TableRow
              key={index}
              className="ins-table-row cursor-pointer"
              onClick={() => {
                window.location.hash = "#/instructor/monthly-revenue";
              }}
            >
              <TableCell className="table-body-text">{row.month}</TableCell>
              <TableCell className="table-body-text">₹{row.preTax.toLocaleString()}</TableCell>
              <TableCell className="table-body-text">₹{row.withoutHolding.toLocaleString()}</TableCell>
              <TableCell className="table-body-text">₹{row.netEarning.toLocaleString()}</TableCell>
              <TableCell className="table-body-text">{row.watchTime.toLocaleString()}</TableCell>
              <TableCell className="table-body-text">{row.payoutDate}</TableCell>
            </TableRow>
          ))}
          {/* Totals Row */}
          <TableRow className="ins-table-row font-semibold bg-gray-50">
            <TableCell className="table-body-text">Total</TableCell>
            <TableCell className="table-body-text">₹{totals.preTax.toLocaleString()}</TableCell>
            <TableCell className="table-body-text">₹{totals.withoutHolding.toLocaleString()}</TableCell>
            <TableCell className="table-body-text">₹{totals.netEarning.toLocaleString()}</TableCell>
            <TableCell className="table-body-text">{totals.watchTime.toLocaleString()}</TableCell>
            <TableCell className="table-body-text">-</TableCell>
          </TableRow>
        </TableBody>
        </Table>
        </div>
    )
  }