import { useState } from 'react';
import { ChevronDown, ChevronUp, Video, FileText } from 'lucide-react';

interface Lecture {
  title: string;
  type: 'video' | 'file';
  duration: string;
  preview?: boolean;
}

interface Section {
  title: string;
  lectures: Lecture[];
  totalDuration: string;
}

const courseSections: Section[] = [
  {
    title: 'Front-End Web Development',
    totalDuration: '37min',
    lectures: [
      { title: "What You'll Get in This Course", type: 'video', duration: '03:08', preview: true },
      { title: 'Download the Course Syllabus', type: 'file', duration: '00:12', preview: true },
      { title: 'Download the 12 Rules to Learn to Code eBook [Latest Edition]', type: 'file', duration: '00:42' },
      { title: 'Download the Required Software', type: 'file', duration: '00:43' },
      { title: 'How Does the Internet Actually Work?', type: 'video', duration: '05:27', preview: true },
      { title: 'How Do Websites Actually Work?', type: 'video', duration: '08:22', preview: true },
      { title: 'How to Get the Most Out of the Course', type: 'video', duration: '09:33' },
      { title: "How to Get Help When You're Stuck", type: 'video', duration: '06:39' },
      { title: 'Pathfinder', type: 'file', duration: '02:23' },
    ],
  },
  {
    title: 'Introduction to HTML',
    totalDuration: '49min',
    lectures: Array(8).fill({ title: 'Sample Lecture', type: 'video', duration: '06:00' }),
  },
  {
    title: 'Intermediate HTML',
    totalDuration: '52min',
    lectures: Array(7).fill({ title: 'Sample Lecture', type: 'video', duration: '07:00' }),
  },
  {
    title: 'Multi-Page Websites',
    totalDuration: '1hr 10min',
    lectures: Array(7).fill({ title: 'Sample Lecture', type: 'video', duration: '10:00' }),
  },
];

export default function Curriculum() {
  const [openSections, setOpenSections] = useState<number[]>([0]);

  const toggleSection = (index: number) => {
    setOpenSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-sm">
      {courseSections.map((section, index) => {
        const isOpen = openSections.includes(index);
        return (
          <div key={index} className="border-b border-gray-200">
            <button
              onClick={() => toggleSection(index)}
              className="w-full flex items-center justify-between bg-primary/10 text-primary px-4 py-3 font-semibold text-left hover:bg-primary/20 transition-all"
            >
              <div>
                {section.title} <span className="ml-2 text-xs font-normal text-gray-500">{section.lectures.length} lectures • {section.totalDuration}</span>
              </div>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isOpen && (
              <ul className="bg-white divide-y">
                {section.lectures.map((lecture, i) => (
                  <li key={i} className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-2">
                      {lecture.type === 'video' ? <Video size={16} /> : <FileText size={16} />}
                      <span className="text-gray-800 hover:underline cursor-pointer">
                        {lecture.title}
                      </span>
                      {lecture.preview && (
                        <span className="ml-2 text-xs text-primary font-medium">Preview</span>
                      )}
                    </div>
                    <span className="text-gray-500 text-xs font-medium">{lecture.duration}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
