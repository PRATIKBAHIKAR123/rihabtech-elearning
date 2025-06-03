import { Play, Plus } from "lucide-react";
import { useState } from "react";
import { CreateNoteDialog } from "./createNoteModal";


export default function Notes() {
  

        const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState([
    {
          id: 1,
          heading: "Note Heading Here",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui."
        },
        {
          id: 2,
          heading: "Note Heading Here",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui."
        },
        {
          id: 3,
          heading: "Note Heading Here",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui."
        }
  ]);

        const handleCreateNote = (note: { heading: string; content: string }) => {
    setNotes(prev => [
      ...prev,
      {
        id: Date.now(),
        heading: note.heading,
        content: note.content
      }
    ]);
  };
  return (
    <div className="container mx-auto px-2 py-2">
      <div className="mb-6">
              <button onClick={() => setIsDialogOpen(true)} className="border border-primary text-primary text- text-primary px-4 py-2 rounded flex items-center">
                <span>Create A Note</span>
                <Plus size={16} className="ml-2" />
              </button>
            </div>
            <div className="space-y-6">
              {notes.map((note) => (
                <div key={note.id} className=" pl-4">
                  <div className="flex items-start mb-2">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                      <Play size={14} className="text- text-primary" />
                    </div>
                    <div className="flex-1">
                    <h3 className="text-[15px] text-[#000927] font-semibold font-['Poppins'] leading-relaxed">{note.heading}</h3>
                    <p className="text-[#181818] text-base font-normal font-['Kumbh_Sans'] leading-relaxed">{note.content}</p>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
            <CreateNoteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateNote}
      />
    </div>
  );
}