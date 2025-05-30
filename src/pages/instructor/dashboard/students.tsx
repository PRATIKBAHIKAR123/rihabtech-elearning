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

export const Students = () =>{
    return(
        <div>
             <h1 className="form-title mr-2">Students</h1>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
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
        
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <StatsCard 
            title="Total Students Enrolled" 
            value="$99,999,99" 
            growth="40,000" 
            period="This Month" 
          />
          <StatsCard 
            title="Total Students Enrolled" 
            value="99,999,99" 
            growth="99,999" 
            period="This Month" 
          />
          <StatsCard 
            title="Total Students Enrolled" 
            value="$99,999,99" 
            growth="40,000" 
            period="This Month" 
          />
        </div>
        
            <MonthWiseReports/>
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
            <p className="text-primary text-[15px] font-semibold font-['Inter'] leading-snug">${growth}</p>
            <p className="text-black text-[10px] font-semibold font-['Inter'] leading-[15px]">{period}</p>
          </div>
        </div>
      </div>
    );
  };


  const MonthWiseReports = () =>{
    const data = [
        {
          timePeriod: "Rajesh Kumar Singh",
          preTax: "India",
          withoutHolding: "31 / 12 / 12",
          netEarning: "01",
          payoutDate: "Active",
        },
        {
          timePeriod: "Rajesh Kumar Singh",
          preTax: "India",
          withoutHolding: "31 / 12 / 12",
          netEarning: "01",
          payoutDate: "Active",
        },
        {
          timePeriod: "Rajesh Kumar Singh",
          preTax: "India",
          withoutHolding: "31 / 12 / 12",
          netEarning: "01",
          payoutDate: "Non Active",
        },
        {
          timePeriod: "Rajesh Kumar Singh",
          preTax: "India",
          withoutHolding: "31 / 12 / 12",
          netEarning: "01",
          payoutDate: "Completed",
        },
      ];
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
            {data.map((row, index) => (
              <TableRow key={index} className="ins-table-row cursor-pointer">
                <TableCell className="table-body-text" onClick={()=>{window.location.hash='#/instructor/learner-profile'}}>{row.timePeriod}</TableCell>
                <TableCell className="table-body-text">{row.preTax}</TableCell>
                <TableCell className="table-body-text">{row.withoutHolding}</TableCell>
                <TableCell className="table-body-text">{row.netEarning}</TableCell>
                <TableCell className="table-body-text"><Badge variant={'outline'} className="bg-[#e8f1fd] rounded-2xl text-[#448df2] text-xs font-normal font-['Inter'] leading-[18px]">{row.payoutDate}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
    )
  }