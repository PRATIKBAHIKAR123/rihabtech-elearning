import { BarChart2, Calendar, ChevronDown } from "lucide-react"
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
import { Badge } from "../../../components/ui/badge";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { dashboardService, StudentData, CourseData } from "../../../utils/dashboardService";

export const Students = () =>{
    const [students, setStudents] = useState<StudentData[]>([]);
    const [courses, setCourses] = useState<CourseData[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const loadStudentsData = async () => {
            if (!user?.UserName) return;
            
            try {
                setLoading(true);
                const [studentsData, coursesData] = await Promise.all([
                    dashboardService.getStudentsData(user.UserName),
                    dashboardService.getCoursesData(user.UserName)
                ]);
                setStudents(studentsData);
                setCourses(coursesData);
            } catch (error) {
                console.error('Error loading data:', error);
                // Fallback to mock data
                setStudents(dashboardService.getMockStudentsData());
                setCourses(dashboardService.getMockCoursesData());
            } finally {
                setLoading(false);
            }
        };

        loadStudentsData();
    }, [user?.UserName]);

    // Filter students based on selected course
    const filteredStudents = selectedCourse === "all" 
        ? students 
        : students.filter(student => {
            // For now, we'll show all students since we don't have course-specific enrollment data
            // In a real implementation, you'd filter by actual course enrollments
            return true;
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return(
        <div>
             <h1 className="form-title mr-2">Students</h1>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="rounded-none text-primary border border-primary">
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
          
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <StatsCard 
            title="Total Students Enrolled" 
            value={filteredStudents.length.toString()}
            growth={filteredStudents.filter(s => s.status === 'active').length.toString()}
            period="Active Students" 
          />
          <StatsCard 
            title="Total Students Enrolled" 
            value={filteredStudents.filter(s => s.status === 'completed').length.toString()}
            growth={filteredStudents.filter(s => s.status === 'inactive').length.toString()}
            period="Completed/Inactive" 
          />
          <StatsCard 
            title="Total Students Enrolled" 
            value={filteredStudents.reduce((sum, s) => sum + s.numberOfCourses, 0).toString()}
            growth={filteredStudents.reduce((sum, s) => sum + s.progress, 0).toString()}
            period="Avg Progress %" 
          />
        </div>
        
            <MonthWiseReports students={filteredStudents}/>
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
      <div className="p-4 bg-white rounded-lg shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] shadow-sm flex-1">
        <h3 className="text-black text-xl font-normal font-['Inter'] leading-[30px] mb-2">{title}</h3>
        <div className="flex justify-between items-start">
          <div>
            
            <p className=" text-primary text-[27px] font-semibold font-['Inter'] leading-10">{value}</p>
          </div>
          <div className="text-right">
            <p className="text-primary text-[15px] font-semibold font-['Inter'] leading-snug">₹{growth}</p>
            <p className="text-black text-[10px] font-semibold font-['Inter'] leading-[15px]">{period}</p>
          </div>
        </div>
      </div>
    );
  };


  const MonthWiseReports = ({ students }: { students: StudentData[] }) =>{
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        }).replace(/\//g, ' / ');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
            case 'completed':
                return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-100 text-gray-800">Non Active</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };
    return(
        <div className="p-4 mt-4">
            <Table>
          <TableHeader className="ins-table-header">
            <TableRow className="table-head-text">
              <TableHead>Student Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Enrolled Date</TableHead>
              <TableHead>No. Of Courses</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, index) => (
              <TableRow key={student.id} className="ins-table-row cursor-pointer">
                <TableCell className="table-body-text" onClick={()=>{window.location.hash='#/instructor/learner-profile'}}>{student.name}</TableCell>
                <TableCell className="table-body-text">{student.location}</TableCell>
                <TableCell className="table-body-text">{formatDate(student.enrolledDate)}</TableCell>
                <TableCell className="table-body-text">{student.numberOfCourses.toString().padStart(2, '0')}</TableCell>
                <TableCell className="table-body-text">{getStatusBadge(student.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
    )
  }