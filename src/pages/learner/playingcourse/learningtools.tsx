import { Play, Plus } from "lucide-react";
import { useState } from "react";

export default function LearningTools() {
     const [notes] = useState([
            {
              id: 1,
              heading: "12th Aug 2025",
              content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui."
            }
          ]);
    return (
        <div className="container mx-auto px-2 py-2">
      <div className="mb-6">
              <button className="border border-primary text-primary text- text-primary px-4 py-2 rounded flex items-center">
              <Plus size={16} className="mr-2" />
                <span>Add a learning Reminder</span>
                
              </button>
            </div>
            <div className="space-y-6">
              {notes.map((note) => (
                <div key={note.id} className=" pl-4">
                  <div className="items-start mb-2">
                    <h3 className="text-[15px] text-[#000927] mb-3 font-semibold font-['Poppins'] leading-relaxed">{note.heading}</h3>
                    <p className="text-[#181818] text-base font-normal font-['Kumbh_Sans'] leading-relaxed">{note.content}</p>
                  </div>
                  
                </div>
              ))}
            </div>
    </div>
    )
}