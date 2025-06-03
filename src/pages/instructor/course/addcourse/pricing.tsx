import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";

export function CoursePricing({onSubmit}:any){
    return(
         <div>
            <div className="mb-3">
                <div className="border-[#cfcfcf] border rounded-md flex items-center justify-left gap-2 p-4 mb-2">
                <div className="py-1 px-3 bg-[#9a0000] text-white" >New</div>
                <span className="text-[#9a0000] text-md font-semibold font-['Raleway']">Please finish your premium application</span>
                </div>
        <h3 className="course-sectional-question mb-2">Set a price for your course</h3>
        <p className="course-sectional-descrption mb-4">
        Please select the currency and the price tier for your course. If you’d like to offer your course for free, it must have a total video length of less than 2 hours. Also, courses with practice tests can not be free.
        </p>
        <div className="mt-8 gap-2 flex items-center">
                <div className="gap-2 flex flex-col">
                    <label className="ins-label">Currency</label>
                    
                        <Select defaultValue="usd">
                            <SelectTrigger className="ins-control-border rounded-none">
                                <SelectValue placeholder="Choose a Currency" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="usd">USD</SelectItem>
                                <SelectItem value="r">RUPEES</SelectItem>

                            </SelectContent>
                        </Select>
                
                </div>
                <div className="gap-2 flex flex-col">
                    <label className="ins-label">Price Tier</label>
                    
                    <Select defaultValue="usd">
                            <SelectTrigger className="ins-control-border rounded-none">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="usd">Tier</SelectItem>
                                <SelectItem value="r">Tier</SelectItem>

                            </SelectContent>
                        </Select>
                </div>
                
                </div>
                <div className="flex justify-end items-end mt-2">
                        <Button className="rounded-none" onClick={onSubmit}>Save</Button>
                    </div>
      </div>
         </div>
    )
}