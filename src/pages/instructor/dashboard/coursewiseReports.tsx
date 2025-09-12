import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "../../../components/ui/table";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useAuth } from "../../../context/AuthContext";
import { getInstructorCourses, InstructorCourse } from "../../../utils/firebaseInstructorCourses";
import { CourseDisplayData } from "../course/courseList";

export const CourseWiseReports = () =>{
    const data = [
        {
          timePeriod: "31 April 2025",
          custName: "Rajesh Kumar Singh",
          courseName: "Introduction To Digital Design Part 1",
          channel: "Promotion",
          coupenCode: "25BBPMXPLOYTRMT",
          netEarning: "$99,999.99",
          pricePaid: "150",
        },
        {
          timePeriod: "31 April 2025",
          custName: "Rajesh Kumar Singh",
          courseName: "Introduction To Digital Design Part 1",
          channel: "Promotion",
          coupenCode: "25BBPMXPLOYTRMT",
          netEarning: "$99,999.99",
          pricePaid: "60",
        },
        {
          timePeriod: "31 April 2025",
          custName: "Rajesh Kumar Singh",
          courseName: "Introduction To Digital Design Part 1",
          channel: "Promotion",
          coupenCode: "25BBPMXPLOYTRMT",
          netEarning: "$99,999.99",
          pricePaid: "200",
        },
        {
          timePeriod: "31 April 2025",
          custName: "Rajesh Kumar Singh",
          courseName: "Introduction To Digital Design Part 1",
          channel: "Promotion",
          coupenCode: "25BBPMXPLOYTRMT",
          netEarning: "$99,999.99",
          pricePaid: "60",
        },
      ];
    return(
        <div className="p-6">
        <div className="flex items-center">
          <h1 className="form-title mr-6">Revenue Report</h1>
          </div>

          <div className="bg-gray-50 p-6 flex flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-6">
      <div className="flex-1">
        <RevenueCard 
          title="All Courses" 
          data={DATA.lifetimeRevenue} 
          showDropdown={true}
          showLegend={true}
        />
      </div>
      
      {/* <div className="flex-1">
        <RevenueCard 
          title="All Courses" 
          data={DATA.promotionActivity} 
        />
      </div>
      
      <div className="flex-1">
        <RevenueCard 
          title="All Courses" 
          data={DATA.courseEarnings} 
        />
      </div> */}
    </div>
        
        <div className="p-4 mt-4">
            <h1 className="py-2 text-[#414d55] text-base font-medium font-['Poppins'] leading-tight tracking-tight">Revenue List</h1>
            <Table className="border">
          <TableHeader className="ins-table-header">
            <TableRow className="table-head-text">
              <TableHead>Sr. No.</TableHead>
              {/* <TableHead>Pre Tax Amount</TableHead> */}
              <TableHead>Course Name</TableHead>
              <TableHead>Tax Amount</TableHead>
              <TableHead>Platform Charges</TableHead>
              <TableHead>Net Earning</TableHead>
              <TableHead>Total Watch time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} className="ins-table-row">
                <TableCell className="table-body-text">{index+1}</TableCell>
                {/* <TableCell className="table-body-text">{row.custName}</TableCell> */}
                <TableCell className="table-body-text">{row.courseName}</TableCell>
                <TableCell className="table-body-text">{row.netEarning}</TableCell>
                <TableCell className="table-body-text">{row.pricePaid} Min</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
        </div>
    )
  }

  const DATA = {
    lifetimeRevenue: [
      { name: 'Platform Charges', value: 60, color: '#FFD700' },
      
      //{ name: 'Your Promotions', value: 15, color: '#00b318ff' },
      { name: 'Tax', value: 10, color: '#DC2626' },
      { name: 'Net Earning', value: 15, color: '#3B82F6' },
    ],
    promotionActivity: [
      { name: 'Platform Charges', value: 55, color: '#FF8C00' },
     
      //{ name: 'Your Promotions', value: 15, color: '#00b318ff' },
      { name: 'Tax', value: 15, color: '#F3F4F6' },
       { name: 'Net Earning', value: 15, color: '#3B82F6' },
    ],
    courseEarnings: [
      { name: 'Platform Charges', value: 55, color: '#FF8C00' },
      
      //{ name: 'Your Promotions', value: 15, color: '#00b318ff' },
      { name: 'Tax', value: 15, color: '#F3F4F6' },
      { name: 'Net Earning', value: 15, color: '#3B82F6' },
    ]
  };


  // Revenue card component that displays a donut chart with details
interface RevenueCardProps {
  title: string;
  data: { name: string; value: number; color: string }[];
  showDropdown?: boolean;
  showLegend?: boolean;
}

const RevenueCard = ({ title, data, showDropdown = false, showLegend = false }: RevenueCardProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [courses, setCourses] = useState<InstructorCourse[]>([]);
        const [loading, setLoading] = useState(true);
        const { user } = useAuth();
        const [selectedCourse, setSelectedCourse] = useState<string>("all");

        useEffect(() => {
            fetchInstructorCourses();
        }, [user?.UserName]);


const fetchInstructorCourses = async () => {
                try {
                    setLoading(true);
                    
                    if (!user?.UserName) {
                        console.log("No user email found");
                        return;
                    }
        
                    console.log("Fetching courses for user:", user.UserName);
                    const instructorCourses = await getInstructorCourses(user.UserName);
                    setCourses(instructorCourses);
        
                } catch (err) {
                    console.error("Error fetching courses:", err);
                    
                } finally {
                    setLoading(false);
                }
            };
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 h-full">
        <div className="w-64 mb-4">
      {/* Header with dropdown */}
      <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a Course" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

    </div>
        
        <div className="flex flex-col items-center justify-center flex-grow">
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  cornerRadius={40}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} radius={20} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-3xl font-bold">₹99,999</p>
              <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                {title === "All Courses" ? "Life Time Revenue" : 
                 title === "All Courses" && data === DATA.promotionActivity ? "Your Promotion Activity" : 
                 "Your Earning By Courses"}
              </p>
            </div>
          </div>
          
          {showLegend && (
            <div className="mt-6 w-full">
              {data.filter(item => item.name !== 'Empty').map((item, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[#787878] text-xs font-medium font-['Inter']">{item.name}</span>
                  </div>
                  <span className={`text-sm font-medium ${item.name === 'Refunds' ? 'text-red-600' : 'text-gray-900'}`}>
                    ₹99,999
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };