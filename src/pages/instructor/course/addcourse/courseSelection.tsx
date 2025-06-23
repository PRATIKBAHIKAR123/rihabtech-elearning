
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { BookOpen, Edit3, MoreHorizontal, Trash2 } from "lucide-react";

const mockDrafts = [
  {
    id: 1,
    title: 'Photoshop',
    status: 'DRAFT',
    visibility: 'Public',
    progress: 85,
    thumbnail: null,
    lastModified: '2 days ago',
    description: 'Complete guide to Adobe Photoshop for beginners'
  },
  {
    id: 2,
    title: 'Photoshop',
    status: 'DRAFT',
    visibility: 'Public',
    progress: 25,
    thumbnail: null,
    lastModified: '1 week ago',
    description: 'Advanced Photoshop techniques and workflows'
  },
  {
    id: 3,
    title: 'React Development Masterclass',
    status: 'DRAFT',
    visibility: 'Private',
    progress: 60,
    thumbnail: null,
    lastModified: '3 days ago',
    description: 'Learn React from basics to advanced concepts'
  }
];

const CourseSelection = () => {
    const [drafts, setDrafts] = useState(mockDrafts);

  const handleAddNewCourse = () => {
    console.log('Add new course clicked');
    // Add your navigation logic here
  };

  const handleEditCourse = (course:any) => {
    console.log('Edit course:', course);
    // Add your edit navigation logic here
  };

  const handleDeleteCourse = (course:any) => {
    if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      setDrafts(drafts.filter((draft:any) => draft.id !== course.id));
    }
  };
    return (
      <div className="p-8">
        <h1 className="ins-heading mb-6">Add New Course</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <CourseCard 
            title="Course"
            icon={'Images/icons/Display 1.png'}
            buttonText="Create Course"
          />
          {/* <CourseCard 
            title="Practice Test"
            icon={'Images/icons/Document Align Left 8.png'}
            buttonText="Create Test"
          /> */}
        </div>
              <div className="space-y-4 mt-2">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Drafts</h2>
        
        {drafts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No course drafts yet</h3>
            <p className="text-gray-600 mb-4">Start creating your first course to see it here.</p>
            <button
              onClick={handleAddNewCourse}
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Create Your First Course
            </button>
          </div>
        ) : (
          <>
            {drafts.map((course) => (
              <DraftCourseCard
                key={course.id}
                course={course}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
              />
            ))}
            
            {drafts.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Based on your experience, we think these resources will be helpful.
                </p>
                <button className="text-primary font-medium hover:text-purple-700 transition-colors">
                  View More Resources
                </button>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    );
  };

  const DraftCourseCard = ({ course, onEdit, onDelete }:any) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 flex-1">
        {/* Course Thumbnail */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <BookOpen className="w-8 h-8 text-gray-400" />
          )}
        </div>

        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{course.title}</h3>
            <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
              {course.status}
            </span>
            <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded">
              {course.visibility}
            </span>
          </div>
          {course.description && (
            <p className="text-sm text-gray-600 truncate mb-2">{course.description}</p>
          )}
          <p className="text-xs text-gray-500">Last modified {course.lastModified}</p>
        </div>
      </div>

      {/* Progress and Actions */}
      <div className="flex items-center space-x-6 ml-4">
        {/* Progress Section */}
        <div className="text-right min-w-[120px]">
          <div className="text-sm font-medium text-gray-900 mb-1">Finish your course</div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 font-medium">{course.progress}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(course)}
            className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded hover:bg-purple-50 transition-colors"
          >
            Edit / manage course
          </button>
          
          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    onEdit(course);
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Course
                </button>
                <button
                  onClick={() => {
                    onDelete(course);
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Course
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

  interface CourseCardProps {
    title: string;
    icon: string;
    buttonText: string;
  }

  const CourseCard = ({ title, icon, buttonText }: CourseCardProps) => {

    const handleCoursetestSelection =(type:string)=> {
        if(type=='Practice Test'){
            localStorage.setItem('addcourseType','practiceTest')
        }else{
            localStorage.removeItem('addcourseType')
        }
        window.location.hash='#/instructor/course-title';
    }
    return (
      <div className="bg-white p-4 md:p-6 border border-gray-200 flex flex-col items-center text-center justify-center">
        <img src={icon} className="h-6"/>
        <h2 className="text-[#393939] text-[14px] md:text-[22px] font-semibold font-['Raleway'] leading-snug mt-4 mb-2">{title}</h2>
        <p className="text-[#1e1e1e] text-[10px] md:text-sm font-medium font-['Nunito'] mb-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse laoreet, nulla vitae ultrices iaculis, tortor lorem maximus sem, eu luctus orci dui id sem.
        </p>
        <Button className="rounded-none transition-colors" onClick={()=>{handleCoursetestSelection(title)}}>
          {buttonText}
        </Button>
      </div>
    );
  };

  export default CourseSelection