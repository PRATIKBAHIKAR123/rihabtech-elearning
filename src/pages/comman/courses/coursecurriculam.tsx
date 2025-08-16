import { useState } from 'react';
import { ChevronDown, ChevronUp, Video, FileText } from 'lucide-react';
import { Course } from '../../../utils/firebaseCourses';

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

interface CurriculumProps {
  course: Course;
}

export default function Curriculum({ course }: CurriculumProps) {
  const [openSections, setOpenSections] = useState<number[]>([0]);

  const toggleSection = (index: number) => {
    setOpenSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Transform Firebase curriculum data to match the expected format
  const transformCurriculumData = (): Section[] => {
    if (!course.curriculum?.sections || course.curriculum.sections.length === 0) {
      // Return default sections if no curriculum data
      return [
        {
          title: 'Course Content',
          totalDuration: '0min',
          lectures: [
            { title: 'No curriculum available yet', type: 'file' as const, duration: '00:00' }
          ],
        }
      ];
    }

    return course.curriculum.sections.map((section, index) => {
      // Calculate total duration for this section
      let totalDurationSeconds = 0;
      if (section.items) {
        section.items.forEach(item => {
          if (item.contentFiles && item.contentFiles[0]?.duration) {
            totalDurationSeconds += Math.round(item.contentFiles[0].duration); // Round each duration
          }
        });
      }
      
      const totalDuration = totalDurationSeconds > 0 
        ? Math.round(totalDurationSeconds / 60) + 'min'
        : '0min';

      // Transform items to lectures
      const lectures: Lecture[] = section.items ? section.items.map(item => {
        const contentType = item.contentType === 'video' ? 'video' : 'file';
        let duration = '00:00';
        
        if (item.contentFiles && item.contentFiles[0]?.duration) {
          const totalSeconds = Math.round(item.contentFiles[0].duration); // Round to nearest second
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          duration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        return {
          title: item.lectureName || 'Untitled Lecture',
          type: contentType,
          duration: duration,
          preview: item.published || false
        };
      }) : [];

      return {
        title: section.name || `Section ${index + 1}`,
        lectures: lectures,
        totalDuration: totalDuration
      };
    });
  };

  const courseSections = transformCurriculumData();

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
