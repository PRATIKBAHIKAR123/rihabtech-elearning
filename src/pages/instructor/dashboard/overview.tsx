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
import { MouseEventHandler, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../../components/ui/select";

export const Overview = () =>{
    const [showmonthWiseReport, setShowMonthWiseReport] = useState(false);
    return(
        <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Select>
            <SelectTrigger className="form-title mr-2 border-none shadow-none outline-none">All Courses</SelectTrigger>
            <SelectContent>
                <SelectItem value={"dev"}>Development</SelectItem>
            </SelectContent>
            </Select>
            {/* <ChevronDown size={20} className="text-gray-500" /> */}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <StatsCard 
            title="Total Revenue" 
            value="$99,999,99" 
            growth="40,000" 
            period="This Month" 
          />
          <StatsCard 
            title="Total Enrollment" 
            value="99,999,99" 
            growth="99,999" 
            period="This Month" 
          />
          <StatsCard 
            title="Total Revenue" 
            value="$99,999,99" 
            growth="40,000" 
            period="This Month" 
          />
        </div>
        <RevenueChart onClick={() => setShowMonthWiseReport((prev) => !prev)}/>
        {showmonthWiseReport&&
            <MonthWiseReports/>
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


  interface RevenueChartProps {
      onClick: () => void;
    }

  const RevenueChart = ({ onClick }: RevenueChartProps) => {
    const data = [
      { month: 'May', value: 80 },
      { month: 'Jun', value: 65 },
      { month: 'Jul', value: 80 },
      { month: 'Aug', value: 50 },
      { month: 'Sep', value: 100 },
      { month: 'Oct', value: 75 },
      { month: 'Nov', value: 75 },
      { month: 'Dec', value: 75 },
      { month: 'Jan', value: 80 },
      { month: 'Feb', value: 80 },
    ];
  
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
            <BarChart data={data} barSize={25} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(value) => `${value}%`}
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


  const MonthWiseReports = () =>{
    const data = [
        {
          timePeriod: "April 2025",
          preTax: "$99,999.99",
          withoutHolding: "$99,999.99",
          netEarning: "$99,999.99",
          payoutDate: "December 31, 2025",
        },
        {
          timePeriod: "April 2025",
          preTax: "$99,999.99",
          withoutHolding: "$99,999.99",
          netEarning: "$99,999.99",
          payoutDate: "December 31, 2025",
        },
        {
          timePeriod: "April 2025",
          preTax: "$99,999.99",
          withoutHolding: "$99,999.99",
          netEarning: "$99,999.99",
          payoutDate: "December 31, 2025",
        },
        {
          timePeriod: "April 2025",
          preTax: "$99,999.99",
          withoutHolding: "$99,999.99",
          netEarning: "$99,999.99",
          payoutDate: "December 31, 2025",
        },
      ];
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
              <TableHead>Expected Payout Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} className="ins-table-row cursor-pointer" onClick={()=>{window.location.hash='#/instructor/monthly-revenue'}}>
                <TableCell className="table-body-text">{row.timePeriod}</TableCell>
                <TableCell className="table-body-text">{row.preTax}</TableCell>
                <TableCell className="table-body-text">{row.withoutHolding}</TableCell>
                <TableCell className="table-body-text">{row.netEarning}</TableCell>
                <TableCell className="table-body-text">{row.payoutDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
    )
  }