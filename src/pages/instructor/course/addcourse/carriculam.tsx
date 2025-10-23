import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Pencil, Trash2, UploadCloud, ChevronDown, ChevronUp, File, ExternalLink, GripVertical, Video, FileText, Link, PenLine, Download, CheckCircle, XCircle, Clock, RefreshCw, Eye, FileImage, FileVideo, FileText as FileTextIcon, FileSpreadsheet, FileIcon } from "lucide-react";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";

import { Textarea } from "../../../../components/ui/textarea";
import { Checkbox } from "../../../../components/ui/checkbox";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../../../../components/ui/hover-card";
// @ts-ignore
import * as XLSX from 'xlsx';

import { getCourseDraft } from "../../../../fakeAPI/course";
import { uploadToCloudinary, deleteFromCloudinary } from "../../../../lib/cloudinary";
import { courseApiService, UpdateCourseMessageResponse } from "../../../../utils/courseApiService";
import { useAuth } from "../../../../context/AuthContext";
import { useCourseData } from "../../../../hooks/useCourseData";
import { toast } from "sonner";

// File type detection and icon mapping
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
    return <FileVideo size={16} className="text-blue-600" />;
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
    return <FileImage size={16} className="text-green-600" />;
  } else if (['pdf'].includes(extension || '')) {
    return <FileTextIcon size={16} className="text-red-600" />;
  } else if (['doc', 'docx'].includes(extension || '')) {
    return <FileTextIcon size={16} className="text-blue-600" />;
  } else if (['xls', 'xlsx'].includes(extension || '')) {
    return <FileSpreadsheet size={16} className="text-green-600" />;
  } else {
    return <FileIcon size={16} className="text-gray-600" />;
  }
};

// Helper function to determine MIME type for preview
const getMimeTypeFromName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'mp4': case 'avi': case 'mov': case 'wmv': case 'flv': case 'webm':
      return 'video/' + (extension === 'mp4' ? 'mp4' : 'webm'); // Simplified
    case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp':
      return 'image/' + (extension === 'jpg' ? 'jpeg' : extension); // Simplified
    case 'pdf':
      return 'application/pdf';
    case 'doc': case 'docx':
      return 'application/msword';
    case 'xls': case 'xlsx':
      return 'application/vnd.ms-excel';
    default:
      return 'application/octet-stream'; // Generic binary file
  }
};

// File preview component
const FilePreview = ({ file, onRemove }: { file: any; onRemove: () => void }) => {
  const [showPreview, setShowPreview] = useState(false);
  
  const isVideo = file.type?.startsWith('video/') || file.name?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i);
  const isImage = file.type?.startsWith('image/') || file.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPDF = file.type === 'application/pdf' || file.name?.endsWith('.pdf');
  const isDocument = file.type?.includes('document') || file.name?.match(/\.(doc|docx)$/i);
  const isSpreadsheet = file.type?.includes('spreadsheet') || file.name?.match(/\.(xls|xlsx)$/i);
  
  const handlePreview = () => {
    if (isVideo || isImage || isPDF) {
      setShowPreview(true);
    } else if (isDocument || isSpreadsheet) {
      // For documents and spreadsheets, open in new tab or download
      window.open(file.url, '_blank');
    }
  };
  
  return (
    <>
      <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
        {getFileIcon(file.name)}
        <span className="text-sm flex-1">{file.name}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="p-1 h-6 w-6"
          onClick={handlePreview}
          title="Preview file"
        >
          <Eye size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="p-1 h-6 w-6 text-red-600"
          onClick={onRemove}
          title="Remove file"
        >
          <Trash2 size={14} />
        </Button>
      </div>
      
      {/* Preview Modal */}
      {showPreview && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{file.name}</DialogTitle>
            </DialogHeader>
            
            <div className="mt-4">
              {isVideo && (
                <video controls className="w-full max-h-[70vh]">
                  <source src={file.url} type={file.type} />
                  Your browser does not support the video tag.
                </video>
              )}
              
              {isImage && (
                <img src={file.url} alt={file.name} className="w-full max-h-[70vh] object-contain" />
              )}
              
              {isPDF && (
                <iframe
                  src={file.url}
                  className="w-full h-[70vh] border-0"
                  title={file.name}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export interface Question {
  question: string;
  options: string[];
  correctOption: number[];
}

export interface QuizItem {
  type: 'quiz';
  quizTitle: string;
  quizDescription: string;
  questions: Question[];
  duration: number; // in minutes
  seqNo: number;
  resources?: {
    name: string;
    file: File;
    url?: string;
    cloudinaryUrl?: string;
    cloudinaryPublicId?: string;
    type: string;
  }[];
}

type VideoStatus = 'uploaded' | 'uploading' | 'failed';

interface VideoContent {
  file: File;
  url: string; // This will now store Cloudinary URL instead of blob URL
  cloudinaryUrl?: string; // Permanent Cloudinary URL
  cloudinaryPublicId?: string; // Cloudinary public ID for management
  name: string;
  duration?: number;
  status: VideoStatus;
  uploadedAt: Date;
  uploadProgress?: number;
}

export interface AssignmentQuestion {
  question: string;
  marks: number;
  answer: string; // Add this field
  maxWordLimit?: number; // Optional word limit
}

export interface Assignment {
  type: 'assignment';
  title: string;
  description: string;
  duration: number; // in minutes
  totalMarks: number;
  questions: AssignmentQuestion[];
  seqNo: number;
  resources?: {
    name: string;
    file: File;
    url?: string;
    cloudinaryUrl?: string;
    cloudinaryPublicId?: string;
    type: string;
  }[];
}

interface LectureItem {
  type: 'lecture';
  lectureName: string;
  contentType: '' | 'video' | 'article';
  videoSource?: 'upload' | 'link'; // Add this line
  contentFiles: VideoContent[];
  contentUrl: string;
  contentText: string;
  articleSource: 'upload' | 'link' | 'write';
  resources: {
    name: string;
    file: File;
    url?: string;
    cloudinaryUrl?: string;
    cloudinaryPublicId?: string;
    type: string;
  }[];
  published: boolean; // Add published property
  description?: string; // Add description field
  isPromotional?: boolean; // Add promotional property for free videos
  duration?: number; // Duration in seconds for external videos
  seqNo: number;
}

export interface Section {
  name: string;
  items: (LectureItem | QuizItem | Assignment)[];
  published: boolean; // Add published property
  seqNo: number;
}

export interface CurriculumFormValues {
  sections: Section[];
}

// Helper for quiz question initial structure
const CONTENT_TYPES = [
  { value: "video", label: "Video" },
  { value: "article", label: "Article" },
] as const;

interface ViewItemState {
  sectionIdx: number;
  itemIdx: number;
}

interface ViewSectionState {
  sectionIdx: number;
}

interface AddTypeState {
  sectionIdx: number;
}

const getInitialAssignment = (seqNo: number = 1): Assignment => ({
  type: "assignment",
  title: "",
  description: "",
  duration: 30,
  totalMarks: 0,
  questions: [
    {
      question: "",
      marks: 0,
      answer: "",
      maxWordLimit: 500 // Default word limit
    }
  ],
  seqNo: seqNo,
});

const getInitialQuiz = (seqNo: number = 1): QuizItem => ({
  type: "quiz",
  quizTitle: "",
  quizDescription: "",
  questions: [
    {
      question: "",
      options: ["", ""],
      correctOption: [], // Start with no correct options selected
    },
  ],
  duration: 15, // Default duration of 15 minutes
  seqNo: seqNo,
});
const getInitialLecture = (index: number): LectureItem => ({
  type: "lecture",
  lectureName: `Lecture ${index}`,
  contentType: "",
  videoSource: "upload", // Add this line
  articleSource: "upload",
  contentFiles: [],
  contentText: "",
  resources: [],
  contentUrl: "",
  published: false, // Default to unpublished
  description: "", // Add description field
  isPromotional: true, // Default to non-promotional
  duration: 0, // Default duration for external videos
  seqNo: index,
});



const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Add this helper function for moving items between sections
const move = <T,>(
  source: T[],
  destination: T[],
  droppableSource: { index: number; droppableId: string },
  droppableDestination: { index: number; droppableId: string }
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: { [key: string]: T[] } = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

// Helper function to update seqNo for sections
const updateSectionSeqNo = (sections: any[]) => {
  return sections.map((section, index) => ({
    ...section,
    seqNo: index + 1
  }));
};

// Helper function to update seqNo for items within a section
const updateItemSeqNo = (items: any[]) => {
  return items.map((item, index) => ({
    ...item,
    seqNo: index + 1
  }));
};

// Add this function near the top of the file
const downloadQuizSampleExcel = () => {
  // Create sample quiz data
  const sampleData = [
    ['Quiz Title', 'Quiz Description', 'Question', 'Options', 'Correct Option'],
    ['Sample Quiz', 'This is a sample quiz description', 'What is 2+2?', '3,4,5,6', '2'],
    ['', '', 'What color is the sky?', 'Red,Blue,Green,Yellow', '2'],
    ['', '', 'Which planet is closest to the sun?', 'Venus,Mars,Mercury,Jupiter', '3']
  ];

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sampleData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Quiz Template');

  // Generate Excel file
  XLSX.writeFile(wb, 'quiz_template.xlsx');
};

// Helper to recursively remove File objects and undefined values from curriculum data
function stripFilesFromCurriculum(curriculum: any): any {
  if (!curriculum) return curriculum;
  
  console.log('Original curriculum before stripping:', curriculum);
  
  // Deep clone to avoid mutating original
  const clone = JSON.parse(JSON.stringify(curriculum));
  
  function clean(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(clean).filter(v => v !== undefined);
    } else if (obj && typeof obj === 'object') {
      const newObj: any = {};
      for (const key in obj) {
        if (obj[key] !== undefined) {
          // Special handling for contentFiles
          if (key === 'contentFiles' && Array.isArray(obj[key])) {
            newObj[key] = obj[key].map((cf: any) => {
              if (!cf) return null;
              
              const { 
                name, 
                url, 
                cloudinaryUrl, 
                cloudinaryPublicId,
                duration, 
                status, 
                uploadedAt,
                type
              } = cf;
              
              // Only add defined fields, prioritizing Cloudinary URLs
              const result: any = {};
              if (name !== undefined) result.name = name;
              if (cloudinaryUrl !== undefined) result.url = cloudinaryUrl; // Use Cloudinary URL as primary URL
              else if (url !== undefined) result.url = url;
              if (cloudinaryPublicId !== undefined) result.cloudinaryPublicId = cloudinaryPublicId;
              if (duration !== undefined) result.duration = duration;
              if (status !== undefined) result.status = status;
              if (uploadedAt !== undefined) result.uploadedAt = uploadedAt;
              if (type !== undefined) result.type = type;
              
              return result;
            }).filter(Boolean); // Remove null entries
          } else if (key === 'resources' && Array.isArray(obj[key])) {
            newObj[key] = obj[key].map((res: any) => {
              if (!res) return null;
              
              const { 
                name, 
                url, 
                cloudinaryUrl, 
                cloudinaryPublicId,
                type 
              } = res;
              
              const result: any = {};
              if (name !== undefined) result.name = name;
              if (cloudinaryUrl !== undefined) result.url = cloudinaryUrl;
              else if (url !== undefined) result.url = url;
              if (cloudinaryPublicId !== undefined) result.cloudinaryPublicId = cloudinaryPublicId;
              if (type !== undefined) result.type = type;
              
              return result;
            }).filter(Boolean);
          } else {
            newObj[key] = clean(obj[key]);
          }
        }
      }
      return newObj;
    }
    return obj;
  }
  
  const cleaned = clean(clone);
  console.log('Cleaned curriculum after stripping:', cleaned);
  return cleaned;
}

// Validation function to check if curriculum is ready for submission
const validateCurriculumForSubmission = (curriculum: CurriculumFormValues): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!curriculum.sections || curriculum.sections.length === 0) {
    errors.push('At least one section is required');
  }
  
  curriculum.sections.forEach((section, sectionIndex) => {
    if (!section.name || section.name.trim() === '') {
      errors.push(`Section ${sectionIndex + 1} must have a name`);
    }
    
    if (!section.items || section.items.length === 0) {
      errors.push(`Section "${section.name}" must have at least one item`);
    }
    
    section.items.forEach((item, itemIndex) => {
      if (item.type === 'lecture') {
        const lecture = item as LectureItem;
        if (!lecture.lectureName || lecture.lectureName.trim() === '') {
          errors.push(`Lecture ${itemIndex + 1} in section "${section.name}" must have a name`);
        }

        if (lecture.contentType === "video") {
  const hasFile = lecture.contentFiles && lecture.contentFiles.length > 0;
  const hasUrl = lecture.contentUrl && lecture.contentUrl.trim() !== "";

  if (!hasFile && !hasUrl) {
    errors.push(`Video lecture "${lecture.lectureName}" must have a video file or a valid URL`);
  }
}
        
        // Check for failed uploads
        if (lecture.contentFiles) {
          const failedUploads = lecture.contentFiles.filter(file => file.status === 'failed');
          if (failedUploads.length > 0) {
            errors.push(`Video "${lecture.lectureName}" has failed uploads. Please retry or remove them.`);
          }
          
          const uploadingFiles = lecture.contentFiles.filter(file => file.status === 'uploading');
          if (uploadingFiles.length > 0) {
            errors.push(`Video "${lecture.lectureName}" is still uploading. Please wait for upload to complete.`);
          }
        }
      } else if (item.type === 'quiz') {
        const quiz = item as QuizItem;
        if (!quiz.quizTitle || quiz.quizTitle.trim() === '') {
          errors.push(`Quiz ${itemIndex + 1} in section "${section.name}" must have a title`);
        }
        
        if (!quiz.questions || quiz.questions.length === 0) {
          errors.push(`Quiz "${quiz.quizTitle}" must have at least one question`);
        }
      } else if (item.type === 'assignment') {
        const assignment = item as Assignment;
        if (!assignment.title || assignment.title.trim() === '') {
          errors.push(`Assignment ${itemIndex + 1} in section "${section.name}" must have a title`);
        }
        
        if (!assignment.questions || assignment.questions.length === 0) {
          errors.push(`Assignment "${assignment.title}" must have at least one question`);
        }
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Debug function to log curriculum data
const debugCurriculumData = (curriculum: CurriculumFormValues, label: string) => {
  console.log(`=== ${label} ===`);
  console.log('Draft ID:', localStorage.getItem("draftId"));
  console.log('Sections count:', curriculum.sections?.length || 0);
  
  curriculum.sections?.forEach((section, sectionIndex) => {
    console.log(`Section ${sectionIndex + 1}:`, {
      name: section.name,
      published: section.published,
      itemsCount: section.items?.length || 0
    });
    
    section.items?.forEach((item, itemIndex) => {
      if (item.type === 'lecture') {
        const lecture = item as LectureItem;
        console.log(`  Lecture ${itemIndex + 1}:`, {
          name: lecture.lectureName,
          contentType: lecture.contentType,
          videoSource: lecture.videoSource,
          contentFilesCount: lecture.contentFiles?.length || 0,
          contentUrl: lecture.contentUrl,
          published: lecture.published,
          isPromotional: lecture.isPromotional
        });
        
        lecture.contentFiles?.forEach((file, fileIndex) => {
          console.log(`    File ${fileIndex + 1}:`, {
            name: file.name,
            url: file.url,
            cloudinaryUrl: file.cloudinaryUrl,
            cloudinaryPublicId: file.cloudinaryPublicId,
            status: file.status,
            duration: file.duration
          });
        });
      } else if (item.type === 'quiz') {
        const quiz = item as QuizItem;
        console.log(`  Quiz ${itemIndex + 1}:`, {
          title: quiz.quizTitle,
          description: quiz.quizDescription,
          questionsCount: quiz.questions?.length || 0,
          duration: quiz.duration
        });
      } else if (item.type === 'assignment') {
        const assignment = item as Assignment;
        console.log(`  Assignment ${itemIndex + 1}:`, {
          title: assignment.title,
          description: assignment.description,
          questionsCount: assignment.questions?.length || 0,
          totalMarks: assignment.totalMarks,
          duration: assignment.duration
        });
      }
    });
  });
  console.log(`=== End ${label} ===`);
};

export function CourseCarriculam({ onSubmit }: any) {
  const draftId = useRef<string>(localStorage.getItem("draftId") || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { courseData, isLoading, isNewCourse, updateCourseData, refreshCourseData } = useCourseData();
  const isUpdatingRef = useRef(false);

  const [showContentType, setShowContentType] = useState<ViewItemState | null>(null);
  const [editLecture, setEditLecture] = useState<ViewItemState | null>(null);
  const [addType, setAddType] = useState<AddTypeState | null>(null);
  const [viewItem, setViewItem] = useState<ViewItemState | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [editQuiz, setEditQuiz] = useState<ViewItemState | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<{ [key: string]: boolean }>({});
  const [isAssignmentSubmitted, setIsAssignmentSubmitted] = useState<{ [key: string]: boolean }>({});
  const [editAssignment, setEditAssignment] = useState<ViewItemState | null>(null);
  const [uploadModal, setUploadModal] = useState<{ open: boolean; sectionIdx: number | null }>({ open: false, sectionIdx: null });
  const [uploadType, setUploadType] = useState<'video' | 'document' | 'url' | 'write' | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [sectionIdx, setSectionIdx] = useState<number | null>(null);
  const [articleContent, setArticleContent] = useState('');
  const [coursePublished, setCoursePublished] = useState(false);
  const [durationFetching, setDurationFetching] = useState<{ [key: string]: boolean }>({});
  const [durationError, setDurationError] = useState<{ [key: string]: boolean }>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState<{ url: string; name: string; type: string } | null>(null);

  const initialValues: CurriculumFormValues = {
    sections: [
      {
        name: "Introduction",
        items: [getInitialLecture(1)],
        published: false, // Default to unpublished
        seqNo: 1
      },
    ],
  };

  const [formInitialValues, setFormInitialValues] = useState(initialValues);
  const [curriculumKey, setCurriculumKey] = useState(0);
  const lastSavedCurriculumRef = useRef<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Function to store curriculum data in global state when navigating
  const storeCurriculumData = useCallback((formValues?: any) => {
    if (courseData?.id && formValues && !isUpdatingRef.current) {
      isUpdatingRef.current = true;
      
      const serializableCurriculum = stripFilesFromCurriculum(formValues);
      
      // Store curriculum data in localStorage as backup
      localStorage.setItem(`curriculum_${courseData.id}`, JSON.stringify(serializableCurriculum));
      
      // Update course data with current curriculum (without saving to API)
      updateCourseData({
        ...courseData,
        curriculum: serializableCurriculum,
        isCurriculumFinal: false // Mark as not final since user didn't explicitly save
      });
      
      console.log('Curriculum data stored in global state and localStorage:', serializableCurriculum);
      
      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  }, [courseData, updateCourseData]);

  useEffect(() => {
    async function fetchDraft() {
      setLoading(true);
      
      // Check if user is logged in
      if (!user) {
        toast.error("Please login to access curriculum");
        setLoading(false);
        return;
      }
      
      // Check if we have course data
      if (!courseData?.id) {
        toast.error("Please create a course first");
        setLoading(false);
        return;
      }
      
      try {
        // Check localStorage first for unsaved curriculum data
        const savedCurriculum = localStorage.getItem(`curriculum_${courseData.id}`);
        
        if (savedCurriculum) {
          console.log("Loading curriculum from localStorage (unsaved changes):", JSON.parse(savedCurriculum));
          const curriculumData = JSON.parse(savedCurriculum);
          setFormInitialValues(curriculumData as unknown as CurriculumFormValues);
          lastSavedCurriculumRef.current = savedCurriculum;
        } else if (courseData.curriculum) {
          console.log("Loading curriculum from API:", courseData.curriculum);
          setFormInitialValues(courseData.curriculum as unknown as CurriculumFormValues);
          // Initialize the last saved ref with current curriculum
          lastSavedCurriculumRef.current = JSON.stringify(courseData.curriculum);
        } else {
          console.log("No curriculum data from API or localStorage, checking Firebase fallback");
          // Fallback to Firebase if no API data
          if (draftId.current) {
            const draft = await getCourseDraft(draftId.current);
            if (draft && draft.curriculum) {
              console.log("Loading curriculum from Firebase:", draft.curriculum);
              setFormInitialValues(draft.curriculum);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load curriculum:", error);
        toast.error("Failed to load curriculum data");
      }
      
      setLoading(false);
    }
    
    if (!isLoading) {
      fetchDraft();
    }
  }, [user, courseData, isLoading]);

  // Watch for changes in courseData.curriculum and update form
  useEffect(() => {
    if (courseData?.curriculum && !loading) {
      console.log("Course curriculum data changed, updating form:", courseData.curriculum);
      setFormInitialValues(courseData.curriculum as unknown as CurriculumFormValues);
      setCurriculumKey(prev => prev + 1); // Force formik reinitialization
    }
  }, [courseData?.curriculum, loading]);

  const validationSchema = Yup.object({
    sections: Yup.array().of(
      Yup.object({
        name: Yup.string().required("Section name is required"),
        items: Yup.array()
          .of(
            Yup.lazy((item) => {
              if (item.type === "lecture") {
                return Yup.object({
                  type: Yup.string().oneOf(["lecture"]).required(),
                  lectureName: Yup.string().required("Lecture name is required"),
                  description: Yup.string().required("Description is required"), // Add validation
                  contentText: Yup.string().when(["contentType", "articleSource"], {
                    is: (contentType: string, articleSource: string) =>
                      contentType === "article" && articleSource === "write",
                    then: (schema) => schema.required("Article content is required"),
                    otherwise: (schema) => schema.notRequired(),
                  }),
                  contentUrl: Yup.string().when(["contentType", "videoSource", "articleSource"], {
                    is: (contentType: string, videoSource: string, articleSource: string) =>
                      contentType === "article" && articleSource === "link",
                    then: (schema) => schema.url("Please enter a valid URL").required("Article URL is required"),
                    otherwise: (schema) => schema.when("contentType", {
                      is: (val: string) => val === "video",
                      then: (schema) => schema.when("videoSource", {
                        is: (source: string) => source === "link",
                        then: (schema) => schema.url("Please enter a valid URL").required("Video URL is required for video links"),
                        otherwise: (schema) => schema.notRequired(),
                      }),
                      otherwise: (schema) => schema.notRequired(),
                    }),
                  }),
                  contentFiles: Yup.array().when(["contentType", "videoSource", "articleSource"], {
                    is: (contentType: string, videoSource: string, articleSource: string) =>
                      contentType === "article" && articleSource === "upload",
                    then: (schema) => schema.min(1, "Please upload at least one document"),
                    otherwise: (schema) => schema.when("contentType", {
                      is: (val: string) => val === "video",
                      then: (schema) => schema.when("videoSource", {
                        is: (source: string) => source === "upload",
                        then: (schema) => schema.min(1, "Please upload at least one video file"),
                        otherwise: (schema) => schema.notRequired(), // For video links, no file upload required
                      }),
                      otherwise: (schema) => schema.notRequired(),
                    }),
                  }),
                });
              } else if (item.type === "quiz") {
                return Yup.object({
                  type: Yup.string().oneOf(["quiz"]).required(),
                  quizTitle: Yup.string().required("Quiz title is required"),
                  quizDescription: Yup.string().required("Quiz description is required"),
                  duration: Yup.number()
                    .min(1, "Duration must be at least 1 minute")
                    .required("Duration is required"),
                  questions: Yup.array()
                    .of(
                      Yup.object({
                        question: Yup.string().required("Question is required"),
                        options: Yup.array()
                          .of(Yup.string().required("Option is required"))
                          .min(2, "At least 2 options are required"),
                        correctOption: Yup.number()
                          .min(0, "Select correct option")
                          .required("Correct option is required"),
                      })
                    )
                    .min(1, "At least one question is required"),
                });
              }
              else if (item.type === "assignment") {
                return Yup.object({
                  type: Yup.string().oneOf(["assignment"]).required(),
                  title: Yup.string().required("Assignment title is required"),
                  description: Yup.string().required("Assignment description is required"),
                  duration: Yup.number()
                    .min(1, "Duration must be at least 1 minute")
                    .required("Duration is required"),
                  totalMarks: Yup.number()
                    .min(1, "Total marks must be at least 1")
                    .required("Total marks are required"),
                  questions: Yup.array()
                    .of(
                      Yup.object({
                        question: Yup.string().required("Question is required"),
                        marks: Yup.number()
                          .min(1, "Marks must be at least 1")
                          .required("Marks are required"),
                        answer: Yup.string(),
                        maxWordLimit: Yup.number()
                          .min(1, "Word limit must be at least 1")
                          .nullable()
                      })
                    )
                    .min(1, "At least one question is required"),
                });
              }
              return Yup.mixed();
            })
          )
          .min(1, "At least one curriculum item is required"),
      })
    ),
  });

  const formik = useFormik<CurriculumFormValues>({
    enableReinitialize: true,
    initialValues: formInitialValues,
    validationSchema,
    onSubmit: async (values) => {
      setSaving(true);
      
      // Check if user is logged in
      if (!user) {
        toast.error("Please login to save curriculum");
        setSaving(false);
        return;
      }
      
      // Check if we have course data
      if (!courseData?.id) {
        toast.error("Please create a course first");
        setSaving(false);
        return;
      }
      
      try {
        console.log('Curriculum submission started:', { courseId: courseData.id, values });
        
        // Debug: Log original curriculum data
        debugCurriculumData(values, 'Original Curriculum Data');

        // Validate curriculum before submission
        const validation = validateCurriculumForSubmission(values);
        if (!validation.isValid) {
          console.error('Curriculum validation failed:', validation.errors);
          toast.error(`Please fix the following issues:\n${validation.errors.join('\n')}`);
          setSaving(false);
          return;
        }

        // Serialize curriculum data properly
        const serializableCurriculum = stripFilesFromCurriculum(values);
        console.log('Serialized curriculum:', serializableCurriculum);
        
        // Debug: Log serialized curriculum data
        debugCurriculumData(serializableCurriculum, 'Serialized Curriculum Data');

        // Prepare course update data with curriculum
        const courseUpdateData = {
          id: courseData.id,
          title: courseData.title,
          subtitle: courseData.subtitle ?? null,
          description: courseData.description ?? null,
          category: courseData.category ?? null,
          subCategory: courseData.subCategory ?? null,
          level: courseData.level ?? null,
          language: courseData.language ?? null,
          pricing: courseData.pricing ?? null,
          thumbnailUrl: courseData.thumbnailUrl ?? null,
          promoVideoUrl: courseData.promoVideoUrl ?? null,
          welcomeMessage: courseData.welcomeMessage ?? null,
          congratulationsMessage: courseData.congratulationsMessage ?? null,
          learn: courseData.learn ?? [],
          requirements: courseData.requirements ?? [],
          target: courseData.target ?? [],
          curriculum: serializableCurriculum
        };
        
        // Save curriculum to API using updateCourse
        const response: UpdateCourseMessageResponse = await courseApiService.updateCourse(courseUpdateData);
        
        console.log('Curriculum saved successfully to API:', response);
        
        // Update course data with new curriculum
        updateCourseData({
          ...courseData,
          curriculum: serializableCurriculum,
          isCurriculumFinal: true
        });
        
        // Clear localStorage since data is now saved to API
        localStorage.removeItem(`curriculum_${courseData.id}`);
        
        // Refresh course data from API to ensure all pages have the latest data
        await refreshCourseData();
        
        toast.success(response.message || "Curriculum saved successfully!");
        
        setSaving(false);
        
        // Ensure curriculum data is stored in global state before navigation
        storeCurriculumData(values);
        
        onSubmit(values);
      } catch (error: any) {
        console.error('Error saving curriculum:', error);
        
        // Handle specific error messages
        if (error.message?.includes('Authentication failed')) {
          toast.error("Authentication failed. Please login again.");
        } else if (error.message?.includes('Access forbidden')) {
          toast.error("You don't have permission to perform this action.");
        } else if (error.message?.includes('Server error')) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("Failed to save curriculum. Please try again.");
        }
        
        setSaving(false);
        throw error;
      }
    },
  });

  // Debug form initialization
  useEffect(() => {
    console.log("Form initial values updated:", formInitialValues);
    console.log("Formik values:", formik.values);
  }, [formInitialValues, formik.values]);

  // Autosave on change (debounced) - Only save meaningful changes
  useEffect(() => {
    if (!loading && courseData?.id && user) {
      const timeout = setTimeout(async () => {
        try {
          const serializableCurriculum = stripFilesFromCurriculum(formik.values);
          const currentCurriculum = courseData.curriculum;
          
          // Only autosave if there are meaningful changes (not just text content)
          const currentCurriculumString = JSON.stringify(serializableCurriculum);
          const hasStructuralChanges = currentCurriculumString !== lastSavedCurriculumRef.current;
          
          if (hasStructuralChanges) {
            lastSavedCurriculumRef.current = currentCurriculumString;
            setIsAutoSaving(true);
            console.log('Autosaving curriculum (structural changes detected):', { courseId: courseData.id, curriculum: serializableCurriculum });
            
            // Prepare course update data with curriculum
            const courseUpdateData = {
              id: courseData.id,
              title: courseData.title,
              subtitle: courseData.subtitle ?? null,
              description: courseData.description ?? null,
              category: courseData.category ?? null,
              subCategory: courseData.subCategory ?? null,
              level: courseData.level ?? null,
              language: courseData.language ?? null,
              pricing: courseData.pricing ?? null,
              thumbnailUrl: courseData.thumbnailUrl ?? null,
              promoVideoUrl: courseData.promoVideoUrl ?? null,
              welcomeMessage: courseData.welcomeMessage ?? null,
              congratulationsMessage: courseData.congratulationsMessage ?? null,
              learn: courseData.learn ?? [],
              requirements: courseData.requirements ?? [],
              target: courseData.target ?? [],
              curriculum: serializableCurriculum
            };
            
            // Save curriculum to API using updateCourse
            await courseApiService.updateCourse(courseUpdateData);
            
            // Clear localStorage since data is now saved to API
            localStorage.removeItem(`curriculum_${courseData.id}`);
            
            console.log('Curriculum autosaved successfully to API');
            setIsAutoSaving(false);
          } else {
            console.log('No structural changes detected, skipping autosave');
          }
        } catch (error) {
          console.error('Error during autosave:', error);
          setIsAutoSaving(false);
          // Don't throw error for autosave failures, just log them
        }
      }, 3000); // Increased debounce to 3 seconds
      return () => clearTimeout(timeout);
    }
  }, [formik.values, loading, courseData, user]);

  // Store curriculum data in global state whenever form values change (less aggressive)
  useEffect(() => {
    if (!loading && courseData?.id && formik.values) {
      const timeout = setTimeout(() => {
        // Only store if the data has actually changed
        const serializableCurriculum = stripFilesFromCurriculum(formik.values);
        const currentCurriculum = courseData.curriculum;
        
        // Compare the serialized data to avoid unnecessary updates
        if (JSON.stringify(serializableCurriculum) !== JSON.stringify(currentCurriculum)) {
          storeCurriculumData(formik.values);
        }
      }, 2000); // Increased debounce to 2 seconds for global state updates
      
      return () => clearTimeout(timeout);
    }
  }, [formik.values, loading, courseData]);

  // Store curriculum data when component unmounts (user navigates away)
  useEffect(() => {
    const handleBeforeUnload = () => {
      storeCurriculumData(formik.values);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also store data when component unmounts
      storeCurriculumData(formik.values);
    };
  }, []);

  // Cleanup localStorage when course changes
  useEffect(() => {
    const currentCourseId = courseData?.id;
    
    return () => {
      // Clear localStorage for other courses when switching courses
      if (currentCourseId) {
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
          if (key.startsWith('curriculum_') && !key.includes(`curriculum_${currentCourseId}`)) {
            localStorage.removeItem(key);
          }
        });
      }
    };
  }, [courseData?.id]);

  const handleQuizExcelUpload = async (file: File, sectionIdx: number, itemIdx: number) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Skip header row
      const rows = (json as any[][]).slice(1);

      // Get quiz title and description from first row
      const quizTitle = rows[0][0] || 'New Quiz';
      const quizDescription = rows[0][1] || '';

      // Process questions
      const questions: Question[] = [];
      let currentQuestion: Partial<Question> = {};

      rows.forEach((row, index) => {
        if (row[2]) { // If there's a question
          if (Object.keys(currentQuestion).length > 0) {
            questions.push(currentQuestion as Question);
          }
          currentQuestion = {
            question: row[2],
            options: row[3] ? row[3].split(',') : [],
            correctOption: row[4] ? [parseInt(row[4]) - 1] : [0]
          };
        }
      });

      // Add the last question
      if (Object.keys(currentQuestion).length > 0) {
        questions.push(currentQuestion as Question);
      }

      // Update formik with the new quiz data
      formik.setFieldValue(`sections[${sectionIdx}].items[${itemIdx}]`, {
        type: 'quiz',
        quizTitle,
        quizDescription,
        questions,
        duration: 15, // Default duration of 15 minutes
        seqNo: formik.values.sections[sectionIdx].items[itemIdx]?.seqNo || itemIdx + 1
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAssignmentSave = (sectionIdx: number, itemIdx: number) => {
    const currentAssignment = formik.values.sections[sectionIdx].items[itemIdx];
    if (currentAssignment.type === "assignment") {
      const hasValidQuestions = currentAssignment.questions.every(q =>
        q.question &&
        q.marks > 0
      );

      if (currentAssignment.title && currentAssignment.description && hasValidQuestions) {
        setEditAssignment(null);
        setIsAssignmentSubmitted({ ...isAssignmentSubmitted, [`${sectionIdx}-${itemIdx}`]: true });
      } else {
        formik.validateForm();
      }
    }
  };

  const handleQuizSave = (sectionIdx: number, itemIdx: number) => {
    const currentQuiz = formik.values.sections[sectionIdx].items[itemIdx];
    console.log('Attempting to save quiz:', { sectionIdx, itemIdx, currentQuiz });
    
    if (currentQuiz.type === "quiz") {
      const hasValidQuestions = currentQuiz.questions.every(q => {
        const isValid = q.question && q.question.trim() !== '' &&
          q.options.length >= 2 &&
          q.options.every(opt => opt && opt.trim() !== '') &&
          Array.isArray(q.correctOption) && q.correctOption.length > 0;
        
        console.log('Question validation:', { question: q.question, options: q.options, correctOption: q.correctOption, isValid });
        return isValid;
      });

      const hasTitle = currentQuiz.quizTitle && currentQuiz.quizTitle.trim() !== '';
      const hasDescription = currentQuiz.quizDescription && currentQuiz.quizDescription.trim() !== '';
      
      console.log('Quiz validation:', { 
        hasTitle, 
        hasDescription, 
        hasValidQuestions, 
        quizTitle: currentQuiz.quizTitle,
        quizDescription: currentQuiz.quizDescription
      });

      if (hasTitle && hasDescription && hasValidQuestions) {
        console.log('Quiz validation passed, saving...');
        setEditQuiz(null);
        setIsQuizSubmitted({ ...isQuizSubmitted, [`${sectionIdx}-${itemIdx}`]: true });
      } else {
        console.log('Quiz validation failed, running form validation...');
        formik.validateForm();
      }
    } else {
      console.log('Item is not a quiz:', currentQuiz.type);
    }
  };


  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle section reordering
    if (type === 'SECTION') {
      const newSections = reorder(
        formik.values.sections,
        source.index,
        destination.index
      );
      // Update seqNo for all sections after reordering
      const updatedSections = updateSectionSeqNo(newSections);
      formik.setFieldValue('sections', updatedSections);
      return;
    }

    // Handle item reordering within sections or between sections
    if (type === 'ITEM') {
      const sourceSectionIndex = parseInt(source.droppableId.split('-')[1]);
      const destSectionIndex = parseInt(destination.droppableId.split('-')[1]);

      if (sourceSectionIndex === destSectionIndex) {
        // Reordering within the same section
        const section = formik.values.sections[sourceSectionIndex];
        const newItems = reorder(section.items, source.index, destination.index);
        // Update seqNo for items in this section
        const updatedItems = updateItemSeqNo(newItems);
        formik.setFieldValue(`sections[${sourceSectionIndex}].items`, updatedItems);
      } else {
        // Moving between different sections
        const sourceSection = formik.values.sections[sourceSectionIndex];
        const destSection = formik.values.sections[destSectionIndex];

        const result = move(
          sourceSection.items,
          destSection.items,
          { index: source.index, droppableId: source.droppableId },
          { index: destination.index, droppableId: destination.droppableId }
        );

        // Update seqNo for items in both sections
        const updatedSourceItems = updateItemSeqNo(result[source.droppableId]);
        const updatedDestItems = updateItemSeqNo(result[destination.droppableId]);

        formik.setFieldValue(`sections[${sourceSectionIndex}].items`, updatedSourceItems);
        formik.setFieldValue(`sections[${destSectionIndex}].items`, updatedDestItems);
      }
    }
  };

  const handleAddQuiz = (sectionIdx: number) => {
    const newQuiz: QuizItem = {
      type: "quiz",
      quizTitle: "",
      quizDescription: "",
      questions: [
        {
          question: "",
          options: ["", ""],
          correctOption: [],
        },
      ],
      duration: 15, // Default duration of 15 minutes
      seqNo: formik.values.sections[sectionIdx].items.length + 1,
    };

    const newItemIdx = formik.values.sections[sectionIdx].items.length;

    formik.setFieldValue(`sections.${sectionIdx}.items`, [
      ...formik.values.sections[sectionIdx].items,
      newQuiz,
    ]);

    // Set initial state for new quiz
    setEditQuiz({ sectionIdx, itemIdx: newItemIdx });
    setViewItem({ sectionIdx, itemIdx: newItemIdx });
    setIsQuizSubmitted(prev => ({ ...prev, [`${sectionIdx}-${newItemIdx}`]: false }));
  };

  const handleAssignmentExcelUpload = (sectionIdx: number, itemIdx: number, rows: any[][]) => {
    if (rows.length > 0) {
      const [title, description, duration, questionsText, totalMarksExcel, wordLimitExcel, modelAnswerText] = rows[0];
      formik.setFieldValue(`sections[${sectionIdx}].items[${itemIdx}]`, {
        type: 'assignment',
        title: title || 'New Assignment',
        description: description || '',
        duration: parseInt(duration) || 0,
        questions: [{
          question: questionsText || '',
          marks: totalMarksExcel || 0, // Default for individual question marks, as not explicitly in Excel template
          answer: modelAnswerText || '',
          maxWordLimit: parseInt(wordLimitExcel) || 0
        }],
        totalMarks: parseFloat(totalMarksExcel) || 0,
        seqNo: formik.values.sections[sectionIdx].items[itemIdx]?.seqNo || itemIdx + 1
      });
    }
  };

  // 1. At the top of the curriculum (above FieldArray):
  const getLectureDuration = (lecture: LectureItem): number => {
    if (lecture.type === 'lecture' && lecture.contentType === 'video') {
      // Check for uploaded video files first
      if (Array.isArray(lecture.contentFiles) && lecture.contentFiles.length > 0) {
        return lecture.contentFiles.reduce((sum: number, file: VideoContent) => sum + (file.duration || 0), 0);
      }
      // Check for external video URL duration
      if (lecture.contentUrl && lecture.contentUrl.includes('youtube.com')) {
        // Extract video ID from YouTube URL
        const videoId = extractYouTubeVideoId(lecture.contentUrl);
        if (videoId) {
          // Return stored duration if available, otherwise 0
          return lecture.duration || 0;
        }
      }
      // Check for other external video URLs
      if (lecture.contentUrl && !lecture.contentUrl.includes('youtube.com')) {
        return lecture.duration || 0;
      }
    }
    return 0;
  };

  // Helper function to extract YouTube video ID from URL
  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Function to fetch video duration from YouTube
  const fetchYouTubeDuration = async (videoId: string): Promise<number> => {
    try {
      console.log(`Fetching duration for YouTube video: ${videoId}`);
      
      // Method 1: Try to get duration from video page metadata
      const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
      if (!videoPageResponse.ok) {
        throw new Error(`Failed to fetch YouTube page: ${videoPageResponse.status}`);
      }
      
      const videoPageHtml = await videoPageResponse.text();
      
      // Look for duration in the page metadata - multiple patterns
      const durationPatterns = [
        /"lengthSeconds":"(\d+)"/,
        /"approxDurationMs":"(\d+)"/,
        /"duration":"PT(\d+)M(\d+)S"/,
        /"duration":"PT(\d+)H(\d+)M(\d+)S"/,
        /"duration":"PT(\d+)H(\d+)M"/,
        /"duration":"PT(\d+)M"/
      ];
      
      for (const pattern of durationPatterns) {
        const match = videoPageHtml.match(pattern);
        if (match) {
          let duration = 0;
          
          if (pattern.toString().includes('lengthSeconds')) {
            duration = parseInt(match[1]);
          } else if (pattern.toString().includes('approxDurationMs')) {
            duration = Math.round(parseInt(match[1]) / 1000);
          } else if (pattern.toString().includes('duration')) {
            // Parse ISO 8601 duration format
            const durationStr = match[0];
            if (durationStr.includes('H')) {
              const hours = parseInt(durationStr.match(/(\d+)H/)?.[1] || '0');
              const minutes = parseInt(durationStr.match(/(\d+)M/)?.[1] || '0');
              const seconds = parseInt(durationStr.match(/(\d+)S/)?.[1] || '0');
              duration = hours * 3600 + minutes * 60 + seconds;
            } else if (durationStr.includes('M')) {
              const minutes = parseInt(durationStr.match(/(\d+)M/)?.[1] || '0');
              const seconds = parseInt(durationStr.match(/(\d+)S/)?.[1] || '0');
              duration = minutes * 60 + seconds;
            }
          }
          
          if (duration > 0) {
            console.log(`Found duration for YouTube video ${videoId}: ${duration} seconds`);
            return duration;
          }
        }
      }
      
      // Method 2: Try alternative approach - look for more patterns
      const alternativePatterns = [
        /"lengthSeconds":(\d+)/,
        /"duration":"(\d+)"/,
        /"videoDuration":"(\d+)"/
      ];
      
      for (const pattern of alternativePatterns) {
        const match = videoPageHtml.match(pattern);
        if (match && match[1]) {
          const duration = parseInt(match[1]);
          if (duration > 0) {
            console.log(`Found duration (alternative) for YouTube video ${videoId}: ${duration} seconds`);
            return duration;
          }
        }
      }
      
      console.log(`Could not extract duration for YouTube video ${videoId}, using fallback`);
      return 0;
      
    } catch (error) {
      console.error('Error fetching YouTube duration:', error);
      return 0;
    }
  };

  // Function to fetch video duration from Vimeo
  const fetchVimeoDuration = async (videoId: string): Promise<number> => {
    try {
      const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Vimeo video info');
      }
      
      const data = await response.json();
      
      // Vimeo oEmbed provides duration in seconds
      if (data.duration) {
        console.log(`Found duration for Vimeo video ${videoId}: ${data.duration} seconds`);
        return data.duration;
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching Vimeo duration:', error);
      return 0;
    }
  };

  // Main function to fetch video duration from any supported platform
  const fetchVideoDuration = async (url: string): Promise<number> => {
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = extractYouTubeVideoId(url);
        if (videoId) {
          return await fetchYouTubeDuration(videoId);
        }
      } else if (url.includes('vimeo.com')) {
        const videoId = url.split('/').pop();
        if (videoId) {
          return await fetchVimeoDuration(videoId);
        }
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching video duration:', error);
      return 0;
    }
  };

  // Helper function to handle file preview
  const handlePreviewFile = (url: string, name: string) => {
    const mimeType = getMimeTypeFromName(name);
    setPreviewContent({ url, name, type: mimeType });
    setShowPreviewModal(true);
  };

  // Helper function to handle file deletion
  const handleDeleteFile = async (sectionIdx: number, itemIdx: number, fileIdx: number) => {
    const item = formik.values.sections[sectionIdx].items[itemIdx];
    if (item.type === 'lecture' && item.contentFiles) {
      const currentFiles = item.contentFiles;
      const fileToDelete = currentFiles[fileIdx];
      if (fileToDelete.cloudinaryPublicId) {
        const extension = fileToDelete.name.split('.').pop()?.toLowerCase();
        let resourceType: 'video' | 'image' | 'raw' = 'raw';
        if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
          resourceType = 'video';
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
          resourceType = 'image';
        }
        await deleteFromCloudinary(fileToDelete.cloudinaryPublicId, resourceType);
      }
      const updatedFiles = currentFiles.filter((_: any, i: number) => i !== fileIdx);
      formik.setFieldValue(`sections[${sectionIdx}].items[${itemIdx}].contentFiles`, updatedFiles);
    }
  };

  const getAssignmentDuration = (item: Assignment | LectureItem | QuizItem): number => {
    if ((item as Assignment).type === 'assignment') {
      return ((item as Assignment).duration || 0) * 60; // convert minutes to seconds
    }
    return 0;
  };

  const getQuizDuration = (item: QuizItem): number => {
    if (item.type === 'quiz') {
      return (item.duration || 0) * 60; // convert minutes to seconds
    }
    return 0;
  };

  const getSectionDuration = (section: Section): number => {
    return section.items.reduce((sum: number, item: LectureItem | QuizItem | Assignment) => {
      if (item.type === 'lecture') return sum + getLectureDuration(item as LectureItem);
      if (item.type === 'assignment') return sum + getAssignmentDuration(item as Assignment);
      if (item.type === 'quiz') return sum + getQuizDuration(item as QuizItem);
      return sum;
    }, 0);
  };

  const totalCourseDuration = formik.values.sections.reduce((sum: number, section: Section) => sum + getSectionDuration(section), 0);

  // Helper to find and open the first error, scroll, and focus
  useEffect(() => {
    if (formik.submitCount > 0 && Object.keys(formik.errors).length > 0) {
      if (formik.errors.sections && Array.isArray(formik.errors.sections)) {
        for (let sectionIdx = 0; sectionIdx < formik.errors.sections.length; sectionIdx++) {
          const sectionError = formik.errors.sections[sectionIdx];
          if (sectionError && typeof sectionError === 'object' && sectionError.items && Array.isArray(sectionError.items)) {
            for (let itemIdx = 0; itemIdx < sectionError.items.length; itemIdx++) {
              const itemError = sectionError.items[itemIdx];
              if (itemError && typeof itemError === 'object') {
                const item = formik.values.sections[sectionIdx]?.items[itemIdx];
                if (item) {
                  if (item.type === 'lecture') {
                    setEditLecture({ sectionIdx, itemIdx });
                    setShowContentType({ sectionIdx, itemIdx }); // Open Edit Content form for lecture errors
                  }
                  else if (item.type === 'quiz') setEditQuiz({ sectionIdx, itemIdx });
                  else if (item.type === 'assignment') setEditAssignment({ sectionIdx, itemIdx });
                }
                setViewItem({ sectionIdx, itemIdx });
                // Scroll and focus first invalid input
                setTimeout(() => {
                  const el = document.getElementById(`section-${sectionIdx}-item-${itemIdx}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Try to focus the first input with error
                  if ('description' in itemError && itemError.description) {
                    const input = document.querySelector(`#section-${sectionIdx}-item-${itemIdx} input[name*='description'], #section-${sectionIdx}-item-${itemIdx} textarea[name*='description']`);
                    if (input) (input as HTMLElement).focus();
                  }
                  // Add more fields as needed
                }, 300);
                return;
              }
            }
          }
        }
      }
    }
  }, [formik.submitCount, formik.errors]);

  // Helper to render user-friendly error summary
  function renderErrorSummary(errors: any) {
    if (!errors.sections || !Array.isArray(errors.sections)) return null;
    const messages: string[] = [];
    errors.sections.forEach((sectionErr: any, sectionIdx: number) => {
      if (sectionErr && sectionErr.items && Array.isArray(sectionErr.items)) {
        sectionErr.items.forEach((itemErr: any, itemIdx: number) => {
          if (itemErr && typeof itemErr === 'object') {
            Object.entries(itemErr).forEach(([field, msg]) => {
              if (typeof msg === 'string') {
                messages.push(`Section ${sectionIdx + 1}, Item ${itemIdx + 1}: ${msg}`);
              }
            });
          }
        });
      }
    });
    return (
      <ul className="list-disc ml-6 mt-2 text-sm">
        {messages.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    );
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading curriculum data...</p>
        </div>
      </div>
    );
  }

  return (
    
    <FormikProvider key={curriculumKey} value={formik}>
      <form onSubmit={formik.handleSubmit}>
        {/* Error summary */}
        {formik.submitCount > 0 && Object.keys(formik.errors).length > 0 && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <b>Please fix the following errors:</b>
            {renderErrorSummary(formik.errors) || (
              <ul className="list-disc ml-6 mt-2 text-sm">
                {Object.entries(formik.errors).map(([key, value]) => (
                  <li key={key}>{typeof value === 'string' ? value : JSON.stringify(value)}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div>
          <div className="mb-3">
            {/* <div className="border-[#cfcfcf] border rounded-md flex items-center justify-between gap-2 p-4 mb-2">
              <div className="py-1 px-3 bg-primary text-white">New</div>
              <span className="text-[#393939] text-md font-semibold font-['Raleway']">
                Check out the latest creation flow improvements, new question types, and AI-assisted features in practice tests.
              </span>
            </div> */}
            {/* <h3 className="course-sectional-question mb-2">What will students learn in your course?</h3>
            <p className="course-sectional-descrption mb-4">
              The following descriptions will be publicly visible on your Course Landing Page and will have a direct impact on your course performance. These descriptions will help learners decide if your course is right for them.
            </p> */}

            <div className="flex items-center gap-2 mb-6">
              <Clock className="text-primary" size={22} />
              <span className="font-bold text-xl">Total Course Duration:</span>
              <span className="font-bold text-primary text-xl">{formatDuration(totalCourseDuration)}</span>
              {isAutoSaving && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Auto-saving...</span>
                </div>
              )}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    className="ml-2 p-1 rounded-full border border-gray-200 bg-white hover:bg-gray-100"
                    onClick={() => setCoursePublished((prev) => !prev)}
                    aria-label={coursePublished ? "Unpublish Course" : "Publish Course"}
                  >
                    {coursePublished ? (
                      <CheckCircle className="text-green-500" size={22} />
                    ) : (
                      <XCircle className="text-red-500" size={22} />
                    )}
                  </button>
                </HoverCardTrigger>
                <HoverCardContent side="top" className="p-2 text-xs">
                  {coursePublished ? "Unpublish Course" : "Publish Course"}
                </HoverCardContent>
              </HoverCard>
            </div>

            <FieldArray name="sections">
              {({ push: pushSection, remove: removeSection }) => (
                <div className="mt-4 gap-4 flex flex-col">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="sections" type="SECTION" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                        >
                          {formik.values.sections.map((section, sectionIdx) => (
                            <Draggable
                              key={`section-${sectionIdx}`}
                              draggableId={`section-${sectionIdx.toString()}`}
                              index={sectionIdx}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`mb-8 border rounded p-4 bg-white ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}
                                >
                                  <div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                                      <div className="cursor-grab active:cursor-grabbing flex items-center gap-2 flex-1 hover:bg-gray-100 rounded" {...provided.dragHandleProps}>
                                        <GripVertical size={20} className="text-gray-400" />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 p-0"
                                          onClick={() => {
                                            const newExpandedState = !expandedSections[sectionIdx];
                                            setExpandedSections(prev => ({
                                              ...prev,
                                              [sectionIdx]: newExpandedState
                                            }));
                                            
                                            // If expanding the section, collapse all items inside it
                                            if (newExpandedState) {
                                              setViewItem(null);
                                            }
                                          }}
                                        >
                                          {expandedSections[sectionIdx] ? (
                                            <ChevronUp size={16} />
                                          ) : (
                                            <ChevronDown size={16} />
                                          )}
                                        </Button>
                                        <label className="text-primary text-md font-bold whitespace-nowrap" style={{ width: 'auto' }}>
                                          Section {sectionIdx + 1}:
                                        </label>
                                        <Input
                                          className="ins-control-border"
                                          name={`sections[${sectionIdx}].name`}
                                          value={section.name}
                                          onChange={formik.handleChange}
                                          onBlur={formik.handleBlur}
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className="px-2 py-1 rounded-none"
                                          onClick={() => setUploadModal({ open: true, sectionIdx })}
                                        >
                                          <UploadCloud size={18} />
                                        </Button>
                                        <HoverCard>
                                          <HoverCardTrigger asChild>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => formik.setFieldValue(`sections[${sectionIdx}].published`, !section.published)}
                                              aria-label={section.published ? "Unpublish Section" : "Publish Section"}
                                            >
                                              {section.published ? (
                                                <CheckCircle className="text-green-500" />
                                              ) : (
                                                <XCircle className="text-red-500" />
                                              )}
                                            </Button>
                                          </HoverCardTrigger>
                                          <HoverCardContent side="top" className="p-2 text-xs">
                                            {section.published ? "Unpublish Section" : "Publish Section"}
                                          </HoverCardContent>
                                        </HoverCard>
                                        {formik.values.sections.length > 1 && (
                                          <Button
                                            type="button"
                                            variant="outline"
                                            className="px-2 py-1 rounded-none"
                                            onClick={() => removeSection(sectionIdx)}
                                            title="Delete Section"
                                          >
                                            <Trash2 size={18} className="text-red-500" />
                                          </Button>
                                        )}
                                      </div>
                                      {formik.touched.sections &&
                                        formik.touched.sections[sectionIdx] &&
                                        formik.errors.sections &&
                                        (formik.errors.sections as any)[sectionIdx]?.name && (
                                          <div className="text-red-500 text-xs ml-2">
                                            {(formik.errors.sections as any)[sectionIdx]?.name}
                                          </div>
                                        )}
                                      <span className="ml-2 flex items-center text-xs font-bold text-gray-700">
                                        <Clock className="mr-1" size={16} />
                                        {formatDuration(getSectionDuration(section))}
                                      </span>
                                    </div>
                                    
                                    {/* Section Content - Only show when expanded */}
                                    {expandedSections[sectionIdx] && (
                                      <FieldArray name={`sections[${sectionIdx}].items`}>
                                      {({ push, remove, replace }) => (
                                        <div className="flex flex-col gap-4">
                                          <Droppable droppableId={`items-${sectionIdx}`} type="ITEM" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                                            {(provided, snapshot) => (
                                              <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`space-y-2 min-h-[100px] ${snapshot.isDraggingOver ? 'bg-green-50 border-2 border-green-200 border-dashed rounded' : ''
                                                  }`}
                                              >
                                                {/* Defensive filter for undefined/null items */}
                                                {Array.isArray(section.items) && section.items.filter(Boolean).map((item, itemIdx) => (
                                                  <Draggable
                                                    key={`item-${sectionIdx}-${itemIdx}`}
                                                    draggableId={`item-${sectionIdx}-${itemIdx}`}
                                                    index={itemIdx}
                                                  >
                                                    {(provided, snapshot) => (
                                                      <div
                                                        id={`section-${sectionIdx}-item-${itemIdx}`}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`border rounded p-3 mb-2 bg-gray-50 ${snapshot.isDragging ? 'shadow-lg bg-white' : ''}`}
                                                      >
                                                        {/* Drag Handle for all item types */}
                                                        <div className="cursor-grab active:cursor-grabbing flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded" {...provided.dragHandleProps}>
                                                          <GripVertical size={16} className="text-gray-400" />
                                                          <span className="text-sm text-gray-600">Drag to reorder</span>
                                                        </div>
                                                        
                                                        <div>
                                                          {/* LECTURE */}
                                                          {item.type === "lecture" && (
                                                            <div className={`flex  justify-between ${showContentType && showContentType.sectionIdx === sectionIdx && showContentType.itemIdx === itemIdx ? 'gap-2 flex-col' : ' flex-col md:flex-row'}`}>
                                                              <div className="flex w-full items-center gap-2 mb-2">
                                                                {editLecture && editLecture.sectionIdx === sectionIdx && editLecture.itemIdx === itemIdx ? (
                                                                  <>
                                                                    <div className="w-full flex-2">
                                                                      <Input
                                                                        className="ins-control-border w-full"
                                                                        //style={{ maxWidth: 300 }}
                                                                        name={`sections[${sectionIdx}].items[${itemIdx}].lectureName`}
                                                                        value={item.lectureName}
                                                                        onChange={formik.handleChange}
                                                                        onBlur={() => setEditLecture(null)}
                                                                        autoFocus
                                                                      />
                                                                    </div>
                                                                    <Button
                                                                      type="button"
                                                                      //variant="ghost"
                                                                      className="px-2 py-1 rounded-none"
                                                                      onClick={() => setEditLecture(null)}
                                                                      title="Save"
                                                                    >
                                                                      Save
                                                                    </Button>
                                                                    <Button
                                                                      type="button"
                                                                      variant="outline"
                                                                      className="px-2 py-1 rounded-none"
                                                                      onClick={() => remove(itemIdx)}
                                                                      title="Cancel"
                                                                    >
                                                                      Cancel
                                                                    </Button>
                                                                  </>
                                                                ) : (
                                                                  <div className="flex gap-2 items-center">
                                                                    <span className="font-semibold">{item.lectureName}</span>
                                                                    <Button
                                                                      type="button"
                                                                      variant="outline"
                                                                      className="px-2 py-1 rounded-none"
                                                                      onClick={() => setEditLecture({ sectionIdx, itemIdx })}
                                                                      title="Edit Lecture Name"
                                                                    >
                                                                      <Pencil size={16} />
                                                                    </Button>

                                                                    <Button
                                                                      type="button"
                                                                      variant="outline"
                                                                      className="px-2 py-1 rounded-none"
                                                                      onClick={() => remove(itemIdx)}
                                                                      title="Cancel"
                                                                    >
                                                                      <Trash2 size={16} className="text-red-500" />
                                                                    </Button>
                                                                  </div>
                                                                )}

                                                                {/* Publish/Unpublish HoverCard for lecture */}
                                                                <HoverCard>
                                                                  <HoverCardTrigger asChild>
                                                                    <Button
                                                                      type="button"
                                                                      variant="ghost"
                                                                      size="icon"
                                                                      onClick={() => formik.setFieldValue(`sections[${sectionIdx}].items[${itemIdx}].published`, !item.published)}
                                                                      aria-label={item.published ? "Unpublish Lecture" : "Publish Lecture"}
                                                                    >
                                                                      {item.published ? (
                                                                        <CheckCircle className="text-green-500" />
                                                                      ) : (
                                                                        <XCircle className="text-red-500" />
                                                                      )}
                                                                    </Button>
                                                                  </HoverCardTrigger>
                                                                  <HoverCardContent side="top" className="p-2 text-xs">
                                                                    {item.published ? "Unpublish Lecture" : "Publish Lecture"}
                                                                  </HoverCardContent>
                                                                </HoverCard>
                                                                
                                                                {/* Promotional Video Toggle for Video Lectures */}
                                                                {item.type === 'lecture' && item.contentType === 'video' && (
                                                                  <HoverCard>
                                                                    <HoverCardTrigger asChild>
                                                                      <div className="flex items-center gap-2">
                                                                        <Checkbox
                                                                          id={`promotional-${sectionIdx}-${itemIdx}`}
                                                                          checked={item.isPromotional || false}
                                                                          onCheckedChange={(checked) => 
                                                                            formik.setFieldValue(
                                                                              `sections[${sectionIdx}].items[${itemIdx}].isPromotional`, 
                                                                              checked === true
                                                                            )
                                                                          }
                                                                        />
                                                                        <label 
                                                                          htmlFor={`promotional-${sectionIdx}-${itemIdx}`}
                                                                          className="text-xs font-medium text-gray-700 cursor-pointer"
                                                                        >
                                                                          Free Preview
                                                                        </label>
                                                                      </div>
                                                                    </HoverCardTrigger>
                                                                    <HoverCardContent side="top" className="p-2 text-xs">
                                                                      Mark this video as a free promotional preview that students can watch without purchasing the course
                                                                    </HoverCardContent>
                                                                  </HoverCard>
                                                                )}
                                                                
                                                                {item.type === 'lecture' && item.contentType === 'video' && (
                                                                  <div className="flex items-center gap-2 mb-2">
                                                                    <Clock size={16} />
                                                                    <span className="font-bold">{formatDuration(getLectureDuration(item))}</span>
                                                                  </div>
                                                                )}
                                                              </div>
                                                              {/* Content Type and Upload */}
                                                              {showContentType &&
                                                                showContentType.sectionIdx === sectionIdx &&
                                                                showContentType.itemIdx === itemIdx ? (
                                                                <div className="flex flex-col gap-2 mt-2 w-auto px-4 md:px-12">
                                                                  {/* Move Content Type above Description */}
                                                                  <label className="ins-label">Content Type</label>
                                                                  <Select
                                                                    value={item.contentType}
                                                                    onValueChange={value => {
                                                                      formik.setFieldValue(
                                                                        `sections[${sectionIdx}].items[${itemIdx}].contentType`,
                                                                        value
                                                                      );
                                                                    }}
                                                                  >
                                                                    <SelectTrigger className="ins-control-border">
                                                                      <SelectValue placeholder="Select Content Type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                      {CONTENT_TYPES.map(type => (
                                                                        <SelectItem key={type.value} value={type.value}>
                                                                          {type.label}
                                                                        </SelectItem>
                                                                      ))}
                                                                    </SelectContent>
                                                                  </Select>
                                                                  {/* Description below Content Type */}
                                                                  <label className="ins-label font-bold">Description</label>
                                                                  {(() => {
                                                                    // Extract itemError for this item
                                                                    const itemError = (
                                                                      formik.errors.sections &&
                                                                      Array.isArray(formik.errors.sections) &&
                                                                      formik.errors.sections[sectionIdx] &&
                                                                      (formik.errors.sections[sectionIdx] as any).items &&
                                                                      Array.isArray((formik.errors.sections[sectionIdx] as any).items) &&
                                                                      (formik.errors.sections[sectionIdx] as any).items[itemIdx]
                                                                    ) ? (formik.errors.sections[sectionIdx] as any).items[itemIdx] : {};
                                                                    return (
                                                                      <>
                                                                        <Input
                                                                          className={`ins-control-border w-full${itemError && itemError.description ? ' border-red-500 ring-2 ring-red-300' : ''}`}
                                                                          name={`sections[${sectionIdx}].items[${itemIdx}].description`}
                                                                          value={item.description}
                                                                          onChange={formik.handleChange}
                                                                          onBlur={formik.handleBlur}
                                                                          placeholder="Enter lecture description"
                                                                          autoFocus={!!(itemError && itemError.description)}
                                                                        />
                                                                        {itemError && itemError.description && (
                                                                          <div className="text-red-500 text-xs mt-1">{itemError.description}</div>
                                                                        )}
                                                                      </>
                                                                    );
                                                                  })()}
                                                                  {/* Article: Plain textarea for React 19 */}
                                                                  {item.contentType === "article" && (
                                                                    <div className="flex flex-col gap-2">
                                                                      {/* Article Source Option */}
                                                                      <div className="flex flex-col items-start gap-4 mb-2">
                                                                        <label className="ins-label">Article Source:</label>
                                                                        <div className="flex items-center gap-4">
                                                                          <div className="flex items-center gap-2">
                                                                            <input
                                                                              type="radio"
                                                                              className="w-4 h-4"
                                                                              id={`article-upload-${sectionIdx}-${itemIdx}`}
                                                                              name={`sections[${sectionIdx}].items[${itemIdx}].articleSource`}
                                                                              checked={item.articleSource === 'upload'}
                                                                              onChange={() => {
                                                                                formik.setFieldValue(
                                                                                  `sections[${sectionIdx}].items[${itemIdx}].articleSource`,
                                                                                  'upload'
                                                                                );
                                                                                // Clear other sources when switching
                                                                                formik.setFieldValue(
                                                                                  `sections[${sectionIdx}].items[${itemIdx}].contentUrl`,
                                                                                  ''
                                                                                );
                                                                                formik.setFieldValue(
                                                                                  `sections[${sectionIdx}].items[${itemIdx}].contentText`,
                                                                                  ''
                                                                                );
                                                                              }}
                                                                            />
                                                                            <label className="font-bold" htmlFor={`article-upload-${sectionIdx}-${itemIdx}`}>
                                                                              Document Upload
                                                                            </label>
                                                                          </div>

                                                                          <div className="flex items-center gap-2">
                                                                            <input
                                                                              type="radio"
                                                                              id={`article-link-${sectionIdx}-${itemIdx}`}
                                                                              name={`sections[${sectionIdx}].items[${itemIdx}].articleSource`}
                                                                              checked={item.articleSource === 'link'}
                                                                              className="w-4 h-4"
                                                                              onChange={() => {
                                                                                formik.setFieldValue(
                                                                                  `sections[${sectionIdx}].items[${itemIdx}].articleSource`,
                                                                                  'link'
                                                                                );
                                                                                // Clear other sources when switching
                                                                                formik.setFieldValue(
                                                                                  `sections[${sectionIdx}].items[${itemIdx}].contentFiles`,
                                                                                  []
                                                                                );
                                                                                formik.setFieldValue(
                                                                                  `sections[${sectionIdx}].items[${itemIdx}].contentText`,
                                                                                  ''
                                                                                );
                                                                              }}
                                                                            />
                                                                            <label className="font-bold" htmlFor={`article-link-${sectionIdx}-${itemIdx}`}>
                                                                              Via URL Link
                                                                            </label>
                                                                          </div>

                                                                          <div className="flex items-center gap-2">
                                                                            <input
                                                                              type="radio"
                                                                              id={`article-write-${sectionIdx}-${itemIdx}`}
                                                                              name={`sections[${sectionIdx}].items[${itemIdx}].articleSource`}
                                                                              checked={item.articleSource === 'write'}
                                                                              className="w-4 h-4"
                                                                              onChange={() => {
                                                                                formik.setFieldValue(
                                                                                  `sections[${sectionIdx}].items[${itemIdx}].articleSource`,
                                                                                  'write'
                                                                                );
                                                                                // Clear other sources when switching
                                                                                formik.setFieldValue(
                                                                                  `sections[${sectionIdx}].items[${itemIdx}].contentFiles`,
                                                                                  []
                                                                                );
                                                                                formik.setFieldValue(
                                                                                  `sections[${sectionIdx}].items[${itemIdx}].contentUrl`,
                                                                                  ''
                                                                                );
                                                                              }}
                                                                            />
                                                                            <label className="font-bold" htmlFor={`article-write-${sectionIdx}-${itemIdx}`}>
                                                                              Write
                                                                            </label>
                                                                          </div>
                                                                        </div>
                                                                      </div>

                                                                      {/* Document Upload option */}
                                                                      {item.articleSource === 'upload' && (
                                                                        <div className="flex flex-col gap-2 mb-2">
                                                                          <Input
                                                                            className="ins-control-border"
                                                                            type="file"
                                                                            accept=".pdf,.doc,.docx,.txt,.md"
                                                                            onChange={async (e) => {
                                                                              const files = Array.from(e.target.files || []);
                                                                              if (files.length === 0) return;

                                                                              const fileObjects = files.map((file) => ({
                                                                                file,
                                                                                url: URL.createObjectURL(file),
                                                                                name: file.name,
                                                                                status: 'uploaded' as VideoStatus,
                                                                                uploadedAt: new Date()
                                                                              }));

                                                                              // Set lecture name to the first file's name (without extension)
                                                                              const fileNameWithoutExt = files[0].name.replace(/\.[^/.]+$/, "");
                                                                              formik.setFieldValue(
                                                                                `sections[${sectionIdx}].items[${itemIdx}].lectureName`,
                                                                                fileNameWithoutExt
                                                                              );
                                                                              formik.setFieldValue(
                                                                                `sections[${sectionIdx}].items[${itemIdx}].contentFiles`,
                                                                                fileObjects
                                                                              );
                                                                            }}
                                                                          />

                                                                          {/* Display uploaded files */}
                                                                          {item.contentFiles?.length > 0 && (
                                                                            <div className="border rounded p-2 bg-white">
                                                                              <h5 className="font-medium text-sm mb-2">Uploaded Documents:</h5>
                                                                              {item.contentFiles.map((content, idx) => (
                                                                                <div key={idx} className="flex items-center justify-between py-1">
                                                                                  <div className="flex items-center gap-2">
                                                                                    <File size={14} />
                                                                                    <span className="text-sm">{content.name}</span>
                                                                                  </div>
                                                                                  <Button
                                                                                    type="button"
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="px-2 py-1 rounded-none"
                                                                                    onClick={() => {
                                                                                      const newFiles = [...item.contentFiles];
                                                                                      URL.revokeObjectURL(newFiles[idx].url);
                                                                                      newFiles.splice(idx, 1);
                                                                                      formik.setFieldValue(
                                                                                        `sections[${sectionIdx}].items[${itemIdx}].contentFiles`,
                                                                                        newFiles
                                                                                      );
                                                                                    }}
                                                                                  >
                                                                                    <Trash2 size={14} className="text-red-500" />
                                                                                  </Button>
                                                                                </div>
                                                                              ))}
                                                                            </div>
                                                                          )}
                                                                        </div>
                                                                      )}

                                                                      {/* URL Link option */}
                                                                      {item.articleSource === 'link' && (
                                                                        <div className="flex flex-col gap-2 mb-2">
                                                                          <Input
                                                                            className="ins-control-border"
                                                                            type="url"
                                                                            placeholder="Enter article URL (Medium, blog, etc.)"
                                                                            name={`sections[${sectionIdx}].items[${itemIdx}].contentUrl`}
                                                                            value={item.contentUrl}
                                                                            onChange={formik.handleChange}
                                                                          />
                                                                          {formik.touched.sections &&
                                                                            Array.isArray(formik.touched.sections) &&
                                                                            formik.touched.sections[sectionIdx] &&
                                                                            formik.touched.sections[sectionIdx]?.items &&
                                                                            Array.isArray(formik.touched.sections[sectionIdx]?.items) &&
                                                                            formik.touched.sections[sectionIdx]?.items?.[itemIdx] &&
                                                                            (formik.values.sections[sectionIdx]?.items?.[itemIdx] as any)?.type === "lecture" &&
                                                                            formik.touched.sections[sectionIdx]?.items?.[itemIdx] &&
                                                                            (formik.touched.sections[sectionIdx]?.items?.[itemIdx] as any)?.contentUrl &&
                                                                            formik.errors.sections &&
                                                                            Array.isArray(formik.errors.sections) &&
                                                                            (formik.errors.sections as any)[sectionIdx]?.items &&
                                                                            Array.isArray((formik.errors.sections as any)[sectionIdx]?.items) &&
                                                                            (formik.errors.sections as any)[sectionIdx]?.items?.[itemIdx]?.contentUrl && (
                                                                              <div className="text-red-500 text-xs">
                                                                                {(formik.errors.sections as any)[sectionIdx]?.items?.[itemIdx]?.contentUrl}
                                                                              </div>
                                                                            )}
                                                                        </div>
                                                                      )}

                                                                      {/* Write option - ArticleEditor */}
                                                                      {item.articleSource === 'write' && (
                                                                        <div className="border rounded-md overflow-hidden bg-white">
                                                                          <ArticleEditor
                                                                            sectionIdx={sectionIdx}
                                                                            itemIdx={itemIdx}
                                                                            content={item.contentText || ''}
                                                                            onChange={(html) => {
                                                                              formik.setFieldValue(
                                                                                `sections[${sectionIdx}].items[${itemIdx}].contentText`,
                                                                                html
                                                                              );
                                                                            }}
                                                                          />
                                                                        </div>
                                                                      )}
                                                                    </div>
                                                                  )}
                                                                  {/* Video: Upload & Info */}
                                                                  {item.contentType === "video" && (
                                                                    <div className="flex flex-col gap-2">
                                                                      {/* Video Source Option */}
                                                                      <div className="flex items-center gap-4 mb-2">
                                                                        <label className="ins-label">Video Source:</label>
                                                                        <div className="flex items-center gap-2">
                                                                          <input
                                                                            type="radio"
                                                                            className="w-4 h-4"
                                                                            id={`video-upload-${sectionIdx}-${itemIdx}`}
                                                                            name={`sections[${sectionIdx}].items[${itemIdx}].videoSource`}
                                                                            checked={item.videoSource !== 'link'}
                                                                            onChange={() => {
                                                                              formik.setFieldValue(
                                                                                `sections[${sectionIdx}].items[${itemIdx}].videoSource`,
                                                                                'upload'
                                                                              );
                                                                              // Clear link if switching
                                                                              formik.setFieldValue(
                                                                                `sections[${sectionIdx}].items[${itemIdx}].contentUrl`,
                                                                                ''
                                                                              );
                                                                            }}
                                                                          />
                                                                          <label className="font-bold" htmlFor={`video-upload-${sectionIdx}-${itemIdx}`}>Upload file</label>
                                                                          <input
                                                                            type="radio"
                                                                            id={`video-link-${sectionIdx}-${itemIdx}`}
                                                                            name={`sections[${sectionIdx}].items[${itemIdx}].videoSource`}
                                                                            checked={item.videoSource === 'link'}
                                                                            className="w-4 h-4"
                                                                            onChange={() => {
                                                                              formik.setFieldValue(
                                                                                `sections[${sectionIdx}].items[${itemIdx}].videoSource`,
                                                                                'link'
                                                                              );
                                                                              // Clear files if switching
                                                                              formik.setFieldValue(
                                                                                `sections[${sectionIdx}].items[${itemIdx}].contentFiles`,
                                                                                []
                                                                              );
                                                                            }}
                                                                          />
                                                                          <label className="font-bold" htmlFor={`video-link-${sectionIdx}-${itemIdx}`}>Video link</label>
                                                                        </div>
                                                                      </div>
                                                                      {/* Upload file option */}
                                                                      {(!item.videoSource || item.videoSource === 'upload') && (
                                                                        <div className="flex items-center justify-between mb-2">
                                                                          <Input
                                                                            className="ins-control-border flex-1 mr-2"
                                                                            type="file"
                                                                            accept="video/*"
                                                                            multiple
                                                                            onChange={async (e) => {
                                                                              const files = Array.from(e.target.files || []);
                                                                              if (files.length === 0) return;

                                                                              // Insert placeholder entries with 'uploading' status so UI shows progress
                                                                              const placeholders = files.map((file) => ({
                                                                                file,
                                                                                name: file.name,
                                                                                url: '',
                                                                                cloudinaryUrl: '',
                                                                                cloudinaryPublicId: '',
                                                                                duration: 0,
                                                                                status: 'uploading' as VideoStatus,
                                                                                uploadProgress: 0,
                                                                                uploadedAt: null
                                                                              }));

                                                                              const currentFiles = item.contentFiles || [];
                                                                              const newFilesWithPlaceholders = [...currentFiles, ...placeholders];
                                                                              formik.setFieldValue(
                                                                                `sections[${sectionIdx}].items[${itemIdx}].contentFiles`,
                                                                                newFilesWithPlaceholders
                                                                              );

                                                                              // Upload sequentially to allow progress updates per-file
                                                                              for (let i = 0; i < files.length; i++) {
                                                                                const file = files[i];
                                                                                const placeholderIndex = currentFiles.length + i;
                                                                                const fileKey = `${sectionIdx}-${itemIdx}-${placeholderIndex}`;

                                                                                try {
                                                                                  console.log('Uploading individual video to Cloudinary:', file.name);

                                                                                  const uploadResult = await uploadToCloudinary(file, 'video', (percent) => {
                                                                                    // Update progress on the placeholder entry
                                                                                    const updated = [...(((formik.values as any).sections?.[sectionIdx].items?.[itemIdx]?.contentFiles) || [])];
                                                                                    if (updated[placeholderIndex]) {
                                                                                      updated[placeholderIndex] = {
                                                                                        ...updated[placeholderIndex],
                                                                                        uploadProgress: percent,
                                                                                        status: 'uploading'
                                                                                      };
                                                                                      formik.setFieldValue(
                                                                                        `sections[${sectionIdx}].items[${itemIdx}].contentFiles`,
                                                                                        updated
                                                                                      );
                                                                                    }
                                                                                  });

                                                                                  const cloudinaryUrl = uploadResult.url;
                                                                                  const cloudinaryPublicId = uploadResult.publicId;
                                                                                  const duration = uploadResult.duration || 0;

                                                                                  // Replace placeholder with final uploaded metadata
                                                                                  const updatedFiles = [...(((formik.values as any).sections?.[sectionIdx].items?.[itemIdx]?.contentFiles) || [])];
                                                                                  if (updatedFiles[placeholderIndex]) {
                                                                                    updatedFiles[placeholderIndex] = {
                                                                                      file,
                                                                                      url: cloudinaryUrl,
                                                                                      cloudinaryUrl,
                                                                                      cloudinaryPublicId,
                                                                                      name: file.name,
                                                                                      duration,
                                                                                      status: 'uploaded' as VideoStatus,
                                                                                      uploadProgress: 100,
                                                                                      uploadedAt: new Date()
                                                                                    };
                                                                                  } else {
                                                                                    updatedFiles.push({
                                                                                      file,
                                                                                      url: cloudinaryUrl,
                                                                                      cloudinaryUrl,
                                                                                      cloudinaryPublicId,
                                                                                      name: file.name,
                                                                                      duration,
                                                                                      status: 'uploaded' as VideoStatus,
                                                                                      uploadProgress: 100,
                                                                                      uploadedAt: new Date()
                                                                                    });
                                                                                  }

                                                                                  formik.setFieldValue(
                                                                                    `sections[${sectionIdx}].items[${itemIdx}].contentFiles`,
                                                                                    updatedFiles
                                                                                  );

                                                                                } catch (error) {
                                                                                  console.error('Failed to upload individual video to Cloudinary:', error);
                                                                                  // Mark placeholder as failed
                                                                                  const updated = [...(((formik.values as any).sections?.[sectionIdx].items?.[itemIdx]?.contentFiles) || [])];
                                                                                  if (updated[placeholderIndex]) {
                                                                                    updated[placeholderIndex] = {
                                                                                      ...updated[placeholderIndex],
                                                                                      status: 'failed',
                                                                                      uploadProgress: 0
                                                                                    };
                                                                                    formik.setFieldValue(
                                                                                      `sections[${sectionIdx}].items[${itemIdx}].contentFiles`,
                                                                                      updated
                                                                                    );
                                                                                  }
                                                                                  // Optionally notify the user
                                                                                  alert(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                                                                }
                                                                              }

                                                                              // Set lecture name to the first file's name (without extension)
                                                                              const fileNameWithoutExt = files[0].name.replace(/\.[^/.]+$/, "");
                                                                              formik.setFieldValue(
                                                                                `sections[${sectionIdx}].items[${itemIdx}].lectureName`,
                                                                                fileNameWithoutExt
                                                                              );
                                                                            }}
                                                                          />
                                                                        </div>
                                                                      )}
                                                                      {/* Video link option */}
                                                                      {item.videoSource === 'link' && (
                                                                        <div className="flex flex-col gap-2 mb-2">
                                                                          <Input
                                                                            className="ins-control-border"
                                                                            type="url"
                                                                            placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                                                                            name={`sections[${sectionIdx}].items[${itemIdx}].contentUrl`}
                                                                            value={item.contentUrl}
                                                                            onChange={async (e) => {
                                                                              const url = e.target.value;
                                                                              const key = `${sectionIdx}-${itemIdx}`;
                                                                              
                                                                              formik.setFieldValue(
                                                                                `sections[${sectionIdx}].items[${itemIdx}].contentUrl`,
                                                                                url
                                                                              );
                                                                              
                                                                              // Auto-fetch duration when URL is entered
                                                                              if (url && (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com'))) {
                                                                                setDurationFetching(prev => ({ ...prev, [key]: true }));
                                                                                setDurationError(prev => ({ ...prev, [key]: false }));
                                                                                
                                                                                try {
                                                                                  const duration = await fetchVideoDuration(url);
                                                                                  if (duration > 0) {
                                                                                    formik.setFieldValue(
                                                                                      `sections[${sectionIdx}].items[${itemIdx}].duration`,
                                                                                      duration
                                                                                    );
                                                                                  }
                                                                                  setDurationFetching(prev => ({ ...prev, [key]: false }));
                                                                                } catch (error) {
                                                                                  console.error('Failed to fetch video duration:', error);
                                                                                  setDurationFetching(prev => ({ ...prev, [key]: false }));
                                                                                  setDurationError(prev => ({ ...prev, [key]: true }));
                                                                                }
                                                                              } else {
                                                                                setDurationFetching(prev => ({ ...prev, [key]: false }));
                                                                                setDurationError(prev => ({ ...prev, [key]: false }));
                                                                              }
                                                                            }}
                                                                            onPaste={async (e) => {
                                                                              const pastedText = e.clipboardData.getData('text');
                                                                              if (pastedText && (pastedText.includes('youtube.com') || pastedText.includes('youtu.be') || pastedText.includes('vimeo.com'))) {
                                                                                // Small delay to ensure the URL is set first
                                                                                setTimeout(async () => {
                                                                                  try {
                                                                                    const duration = await fetchVideoDuration(pastedText);
                                                                                    if (duration > 0) {
                                                                                      formik.setFieldValue(
                                                                                        `sections[${sectionIdx}].items[${itemIdx}].duration`,
                                                                                        duration
                                                                                      );
                                                                                    }
                                                                                  } catch (error) {
                                                                                    console.error('Failed to fetch video duration:', error);
                                                                                  }
                                                                                }, 100);
                                                                              }
                                                                            }}
                                                                          />
                                                                          {/* Auto-fetched duration display */}
                                                                          {item.duration && item.duration > 0 && (
                                                                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                                                                              <Clock size={16} className="text-green-600" />
                                                                              <span className="text-sm text-green-700">
                                                                                Auto-detected duration: {formatDuration(item.duration || item.contentFiles?.[0]?.duration || 0)}
                                                                              </span>
                                                                              <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="ml-auto p-1 h-6 w-6"
                                                                                onClick={async () => {
                                                                                  const key = `${sectionIdx}-${itemIdx}`;
                                                                                  if (item.contentUrl) {
                                                                                    setDurationFetching(prev => ({ ...prev, [key]: true }));
                                                                                    setDurationError(prev => ({ ...prev, [key]: false }));
                                                                                    try {
                                                                                      const duration = await fetchVideoDuration(item.contentUrl);
                                                                                      if (duration > 0) {
                                                                                        formik.setFieldValue(
                                                                                          `sections[${sectionIdx}].items[${itemIdx}].duration`,
                                                                                          duration
                                                                                        );
                                                                                      }
                                                                                      setDurationFetching(prev => ({ ...prev, [key]: false }));
                                                                                    } catch (error) {
                                                                                      console.error('Failed to refresh video duration:', error);
                                                                                      setDurationFetching(prev => ({ ...prev, [key]: false }));
                                                                                      setDurationError(prev => ({ ...prev, [key]: true }));
                                                                                    }
                                                                                  }
                                                                                }}
                                                                                title="Refresh duration"
                                                                              >
                                                                                <RefreshCw size={14} />
                                                                              </Button>
                                                                            </div>
                                                                          )}
                                                                          
                                                                          {/* Manual duration input when auto-detection fails */}
                                                                          {(!item.duration || item.duration === 0) && 
                                                                           (!item.contentFiles?.[0]?.duration || item.contentFiles[0].duration === 0) && (
                                                                            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                                                              <Clock size={16} className="text-yellow-600" />
                                                                              <span className="text-sm text-yellow-700">
                                                                                Duration not detected automatically
                                                                              </span>
                                                                              <Input
                                                                                type="number"
                                                                                placeholder="Enter duration in seconds"
                                                                                className="w-24 h-8 text-sm"
                                                                                value={item.duration || item.contentFiles?.[0]?.duration || ''}
                                                                                onChange={(e) => {
                                                                                  const value = parseInt(e.target.value) || 0;
                                                                                  // Update both item.duration and contentFiles[0].duration
                                                                                  formik.setFieldValue(
                                                                                    `sections[${sectionIdx}].items[${itemIdx}].duration`,
                                                                                    value
                                                                                  );
                                                                                  if (item.contentFiles?.[0]) {
                                                                                    formik.setFieldValue(
                                                                                      `sections[${sectionIdx}].items[${itemIdx}].contentFiles.0.duration`,
                                                                                      value
                                                                                    );
                                                                                  }
                                                                                }}
                                                                              />
                                                                              <span className="text-xs text-gray-600">seconds</span>
                                                                              <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="ml-auto p-1 h-6 w-6"
                                                                                onClick={async () => {
                                                                                  const key = `${sectionIdx}-${itemIdx}`;
                                                                                  if (item.contentUrl) {
                                                                                    setDurationFetching(prev => ({ ...prev, [key]: true }));
                                                                                    setDurationError(prev => ({ ...prev, [key]: false }));
                                                                                    try {
                                                                                      const duration = await fetchVideoDuration(item.contentUrl);
                                                                                      if (duration > 0) {
                                                                                        formik.setFieldValue(
                                                                                          `sections[${sectionIdx}].items[${itemIdx}].duration`,
                                                                                          duration
                                                                                        );
                                                                                      }
                                                                                      setDurationFetching(prev => ({ ...prev, [key]: false }));
                                                                                    } catch (error) {
                                                                                      console.error('Failed to retry video duration fetch:', error);
                                                                                      setDurationFetching(prev => ({ ...prev, [key]: false }));
                                                                                      setDurationError(prev => ({ ...prev, [key]: true }));
                                                                                    }
                                                                                  }
                                                                                }}
                                                                                title="Retry duration fetch"
                                                                              >
                                                                                <RefreshCw size={14} />
                                                                              </Button>
                                                                            </div>
                                                                          )}
                                                                          {/* Loading indicator while fetching duration */}
                                                                          {durationFetching[`${sectionIdx}-${itemIdx}`] && (
                                                                            <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                                                                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                                              <span className="text-sm text-blue-700">
                                                                                Fetching video duration...
                                                                              </span>
                                                                            </div>
                                                                          )}
                                                                          {/* Error state when duration fetching fails */}
                                                                          {durationError[`${sectionIdx}-${itemIdx}`] && !durationFetching[`${sectionIdx}-${itemIdx}`] && (
                                                                            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                                                                              <Clock size={16} className="text-red-600" />
                                                                              <span className="text-sm text-red-700">
                                                                                Could not fetch video duration automatically
                                                                              </span>
                                                                              <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="ml-auto p-1 h-6 w-6"
                                                                                onClick={async () => {
                                                                                  const key = `${sectionIdx}-${itemIdx}`;
                                                                                  if (item.contentUrl) {
                                                                                    setDurationFetching(prev => ({ ...prev, [key]: true }));
                                                                                    setDurationError(prev => ({ ...prev, [key]: false }));
                                                                                    try {
                                                                                      const duration = await fetchVideoDuration(item.contentUrl);
                                                                                      if (duration > 0) {
                                                                                        formik.setFieldValue(
                                                                                          `sections[${sectionIdx}].items[${itemIdx}].duration`,
                                                                                          duration
                                                                                        );
                                                                                      }
                                                                                      setDurationFetching(prev => ({ ...prev, [key]: false }));
                                                                                    } catch (error) {
                                                                                      console.error('Failed to retry video duration fetch:', error);
                                                                                      setDurationFetching(prev => ({ ...prev, [key]: false }));
                                                                                      setDurationError(prev => ({ ...prev, [key]: true }));
                                                                                    }
                                                                                  }
                                                                                }}
                                                                                title="Retry duration fetch"
                                                                              >
                                                                                <RefreshCw size={14} />
                                                                              </Button>
                                                                            </div>
                                                                          )}
                                                                        </div>
                                                                      )}
                                                                      {item.contentFiles?.length > 0 && (
                                                                        <div className="overflow-x-auto">
                                                                          <table className="w-full border-collapse">
                                                                            <thead>
                                                                              <tr className="bg-gray-50 border-b">
                                                                                <th className="text-left p-2 text-sm font-medium text-gray-600">File Name</th>
                                                                                <th className="text-left p-2 text-sm font-medium text-gray-600">Type</th>
                                                                                <th className="text-left p-2 text-sm font-medium text-gray-600">Duration</th>
                                                                                <th className="text-left p-2 text-sm font-medium text-gray-600">Status</th>
                                                                                <th className="text-left p-2 text-sm font-medium text-gray-600">Upload Date</th>
                                                                                <th className="text-left p-2 text-sm font-medium text-gray-600">Actions</th>
                                                                              </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                              {item.contentFiles.map((content, idx) => (
                                                                                <tr key={idx} className="border-b hover:bg-gray-50">
                                                                                  <td className="p-2">
                                                                                    <div className="flex items-center gap-2">
                                                                                      <UploadCloud size={14} />
                                                                                      <span className="text-sm">{content.name}</span>
                                                                                    </div>
                                                                                  </td>
                                                                                  <td className="p-2">
                                                                                    <span className="text-sm">{content.file && content.file.type ? content.file.type : 'N/A'}</span>
                                                                                  </td>
                                                                                  <td className="p-2">
                                                                                    <span className="text-sm">{formatDuration(content.duration || 0)}</span>
                                                                                  </td>
                                                                                  <td className="p-2">
                                                                                    {content.status === 'uploading' ? (
                                                                                      <div className="flex items-center gap-2">
                                                                                        <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                                                                                          <div
                                                                                            className="h-full bg-primary"
                                                                                            style={{ width: `${content.uploadProgress}%` }}
                                                                                          />
                                                                                        </div>
                                                                                        <span className="text-sm">{content.uploadProgress}%</span>
                                                                                      </div>
                                                                                    ) : (
                                                                                      <span className={`text-sm px-2 py-1 rounded-full ${content.status === 'uploaded' ? 'bg-green-100 text-green-800' :
                                                                                        'bg-red-100 text-red-800'
                                                                                        }`}>
                                                                                        {content.status}
                                                                                      </span>
                                                                                    )}
                                                                                  </td>
                                                                                  <td className="p-2">
                                                                                    <span className="text-sm">
                                                                                      {content.uploadedAt ? new Date(content.uploadedAt).toLocaleDateString() : 'N/A'}
                                                                                    </span>
                                                                                  </td>
                                                                                  <td className="p-2">
                                                                                    <div className="flex items-center gap-2">
                                                                                      <Button
                                                                                        type="button"
                                                                                        size="sm"
                                                                                        variant="ghost"
                                                                                        className="p-1"
                                                                                        onClick={() => handlePreviewFile(content.url, content.name)}
                                                                                        title="Preview File"
                                                                                      >
                                                                                        <Eye size={14} />
                                                                                      </Button>
                                                                                      <Button
                                                                                        type="button"
                                                                                        size="sm"
                                                                                        variant="ghost"
                                                                                        className="p-1"
                                                                                        onClick={() => {
                                                                                          if (content.url) {
                                                                                            navigator.clipboard.writeText(content.url);
                                                                                          }
                                                                                        }}
                                                                                        title="Copy URL"
                                                                                      >
                                                                                        <Link size={14} />
                                                                                      </Button>
                                                                                      <Button
                                                                                        type="button"
                                                                                        size="sm"
                                                                                        variant="ghost"
                                                                                        className="p-1"
                                                                                        onClick={() => {
                                                                                          setShowContentType({ sectionIdx, itemIdx });
                                                                                          setViewItem(null);
                                                                                        }}
                                                                                      >
                                                                                        <Pencil size={14} />
                                                                                      </Button>
                                                                                      <Button
                                                                                        type="button"
                                                                                        size="sm"
                                                                                        variant="ghost"
                                                                                        className="p-1"
                                                                                        onClick={() => handleDeleteFile(sectionIdx, itemIdx, idx)}
                                                                                      >
                                                                                        <Trash2 size={14} className="text-red-500" />
                                                                                      </Button>
                                                                                    </div>
                                                                                  </td>
                                                                                </tr>
                                                                              ))}
                                                                            </tbody>
                                                                          </table>
                                                                        </div>
                                                                      )}
                                                                      
                                                                      {/* Manual duration input for uploaded videos */}
                                                                      {item.contentType === 'video' && item.videoSource === 'upload' && item.contentFiles?.length > 0 && (
                                                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                                                          <div className="flex items-center gap-2 mb-2">
                                                                            <Clock size={16} className="text-blue-600" />
                                                                            <span className="text-sm font-medium text-blue-800">
                                                                              Set Video Duration
                                                                            </span>
                                                                          </div>
                                                                          <div className="flex items-center gap-2">
                                                                            <Input
                                                                              type="number"
                                                                              placeholder="Duration in seconds"
                                                                              className="w-32 h-8 text-sm"
                                                                              value={item.duration || ''}
                                                                              onChange={(e) => {
                                                                                const value = parseInt(e.target.value) || 0;
                                                                                formik.setFieldValue(
                                                                                  `sections[${sectionIdx}].items[${itemIdx}].duration`,
                                                                                  value
                                                                                );
                                                                              }}
                                                                            />
                                                                            <span className="text-xs text-gray-600">seconds</span>
                                                                            <span className="text-sm text-gray-700">
                                                                              ({formatDuration(item.duration || item.contentFiles?.[0]?.duration || 0)})
                                                                            </span>
                                                                          </div>
                                                                          <p className="text-xs text-blue-600 mt-1">
                                                                            Use this if automatic duration detection fails
                                                                          </p>
                                                                        </div>
                                                                      )}
                                                                    </div>
                                                                  )}
                                                                  
                                                                  {/* Resources Section */}
                                                                  <div className="mt-4">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                      <h4 className="font-medium text-sm">Resources</h4>
                                                                      <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                          const fileInput = document.createElement('input');
                                                                          fileInput.type = 'file';
                                                                          fileInput.accept = '.pdf,.doc,.docx,.zip,.rar,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.xls,.xlsx';
                                                                          fileInput.multiple = true;

                                                                          fileInput.onchange = async (e) => {
                                                                            const files = (e.target as HTMLInputElement).files;
                                                                            if (files) {
                                                                              const currentResources = item.resources || [];
                                                                              const newResources = await Promise.all(
                                                                                Array.from(files).map(async (file) => {
                                                                                  // Upload to Cloudinary
                                                                                  let cloudinaryUrl = '';
                                                                                  let cloudinaryPublicId = '';
                                                                                  
                                                                                  try {
                                                                                    const uploadResult = await uploadToCloudinary(file, 'raw');
                                                                                    cloudinaryUrl = uploadResult.url;
                                                                                    cloudinaryPublicId = uploadResult.publicId;
                                                                                  } catch (error) {
                                                                                    console.error('Failed to upload resource to Cloudinary:', error);
                                                                                    // Fallback to local file
                                                                                    cloudinaryUrl = URL.createObjectURL(file);
                                                                                  }

                                                                                  return {
                                                                                    name: file.name,
                                                                                    file: file,
                                                                                    url: cloudinaryUrl,
                                                                                    cloudinaryUrl: cloudinaryUrl,
                                                                                    cloudinaryPublicId: cloudinaryPublicId,
                                                                                    type: 'lecture'
                                                                                  };
                                                                                })
                                                                              );

                                                                              formik.setFieldValue(
                                                                                `sections[${sectionIdx}].items[${itemIdx}].resources`,
                                                                                [...currentResources, ...newResources]
                                                                              );
                                                                            }
                                                                          };

                                                                          fileInput.click();
                                                                        }}
                                                                      >
                                                                        + Add Resources
                                                                      </Button>
                                                                    </div>

                                                                    {item.resources?.length > 0 && (
                                                                      <div className="border rounded p-2 bg-white">
                                                                        {item.resources.map((resource, resourceIdx) => (
                                                                          <div key={resourceIdx} className="flex items-center justify-between py-1">
                                                                            <div className="flex items-center gap-2">
                                                                              {getFileIcon(resource.name)}
                                                                              <span className="text-sm">{resource.name}</span>
                                                                              {resource.cloudinaryUrl && resource.cloudinaryUrl !== resource.url && (
                                                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                                  Cloudinary
                                                                                </span>
                                                                              )}
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                              <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="p-1 h-6 w-6"
                                                                                onClick={() => {
                                                                                  if (resource.cloudinaryUrl) {
                                                                                    window.open(resource.cloudinaryUrl, '_blank');
                                                                                  } else if (resource.url) {
                                                                                    window.open(resource.url, '_blank');
                                                                                  }
                                                                                }}
                                                                                title="Open resource"
                                                                              >
                                                                                <Eye size={14} />
                                                                              </Button>
                                                                              <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="px-2 py-1 rounded-none text-red-600"
                                                                                onClick={() => {
                                                                                  const newResources = [...item.resources];
                                                                                  const resourceUrl = newResources[resourceIdx]?.url;
                                                                                  if (resourceUrl && resourceUrl.startsWith('blob:')) {
                                                                                    URL.revokeObjectURL(resourceUrl);
                                                                                  }
                                                                                  newResources.splice(resourceIdx, 1);
                                                                                  formik.setFieldValue(
                                                                                    `sections[${sectionIdx}].items[${itemIdx}].resources`,
                                                                                    newResources
                                                                                  );
                                                                                }}
                                                                              >
                                                                                <Trash2 size={12} />
                                                                              </Button>
                                                                            </div>
                                                                          </div>
                                                                        ))}
                                                                      </div>
                                                                    )}
                                                                  </div>
                                                                  
                                                                  <Button
                                                                    type="button"
                                                                    className="rounded-none mt-2"
                                                                    onClick={() => setShowContentType(null)}
                                                                  >
                                                                    Done
                                                                  </Button>
                                                                </div>
                                                              ) : (
                                                                <div className="flex items-center ml-2 mb-2 gap-2">
                                                                  {!editLecture && <Button
                                                                    className="h-[10] rounded-none text-sm"
                                                                    type="button"
                                                                    onClick={() => setShowContentType({ sectionIdx, itemIdx })}
                                                                  >
                                                                    {(
                                                                      item.contentType && (
                                                                        (item.contentType === "video" && (item.contentFiles?.length > 0 || item.contentUrl)) ||
                                                                        (item.contentType === "article" && (
                                                                          (item.articleSource === "upload" && item.contentFiles?.length > 0) ||
                                                                          (item.articleSource === "link" && item.contentUrl) ||
                                                                          (item.articleSource === "write" && item.contentText)
                                                                        ))
                                                                      )
                                                                    ) ? "Edit Content" : "Add Content"}
                                                                  </Button>}
                                                                  <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    className="px-2 py-1 rounded-none"
                                                                    onClick={() => setViewItem(
                                                                      viewItem?.sectionIdx === sectionIdx && viewItem?.itemIdx === itemIdx
                                                                        ? null
                                                                        : { sectionIdx, itemIdx }
                                                                    )}
                                                                  >
                                                                    {viewItem?.sectionIdx === sectionIdx && viewItem?.itemIdx === itemIdx
                                                                      ? <ChevronUp size={16} />
                                                                      : <ChevronDown size={16} />}
                                                                  </Button>
                                                                </div>
                                                              )}
                                                            </div>
                                                          )}
                                                          {/* QUIZ */}
                                                          {item.type === 'quiz' && (
                                                            <div className="flex flex-col gap-2">
                                                              <div className="flex items-center justify-between gap-2 mb-2">
                                                                <div className="flex items-center gap-2">
                                                                  <span className="font-semibold">
                                                                    {item.quizTitle || "New Quiz"}
                                                                  </span>
                                                                  {/* Quiz Duration Display */}
                                                                  <div className="flex items-center gap-2 ml-2">
                                                                    <Clock size={16} className="text-primary" />
                                                                    <span className="font-bold text-primary">
                                                                      {formatDuration(getQuizDuration(item))}
                                                                    </span>
                                                                  </div>
                                                                  <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => {
                                                                      const sampleData = [
                                                                        ['Quiz Title', 'Quiz Description', 'Duration (minutes)', 'Question', 'Options', 'Correct Options'],
                                                                        ['Sample Quiz', 'This is a sample quiz description', '15', 'What is 2+2?', '3,4,5,6', '2'],
                                                                        ['', '', '', 'What colors are in rainbow?', 'Red,Blue,Green,Yellow,Purple,Orange', '1,2,3,4,5,6'],
                                                                        ['', '', '', 'Which planets are in our solar system?', 'Mercury,Venus,Earth,Mars,Jupiter,Saturn,Uranus,Neptune', '1,2,3,4,5,6,7,8']
                                                                      ];
                                                                      const wb = XLSX.utils.book_new();
                                                                      const ws = XLSX.utils.aoa_to_sheet(sampleData);
                                                                      XLSX.utils.book_append_sheet(wb, ws, 'Quiz Template');
                                                                      XLSX.writeFile(wb, 'quiz_template.xlsx');
                                                                    }}
                                                                    title="Download Quiz Template"
                                                                  >
                                                                    <Download size={16} />
                                                                  </Button>
                                                                  <div className="relative">
                                                                    <input
                                                                      type="file"
                                                                      accept=".xlsx,.xls"
                                                                      onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                          const reader = new FileReader();
                                                                          reader.onload = (e) => {
                                                                            const data = new Uint8Array(e.target?.result as ArrayBuffer);
                                                                            const workbook = XLSX.read(data, { type: 'array' });
                                                                            const sheet = workbook.Sheets[workbook.SheetNames[0]];
                                                                            const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                                                                            const rows = (json as any[][]).slice(1);
                                                                            const quizTitle = rows[0][0] || 'New Quiz';
                                                                            const quizDescription = rows[0][1] || '';
                                                                            const quizDuration = parseInt(rows[0][2]) || 15; // Parse duration from column 2
                                                                            const questions: Question[] = [];
                                                                            let currentQuestion: Partial<Question> = {};
                                                                            rows.forEach((row, index) => {
                                                                              if (row[3]) { // Question is now in column 3
                                                                                if (Object.keys(currentQuestion).length > 0) {
                                                                                  questions.push(currentQuestion as Question);
                                                                                }
                                                                                currentQuestion = {
                                                                                  question: row[3],
                                                                                  options: row[4] ? row[4].split(',') : [], // Options in column 4
                                                                                  correctOption: row[5] ? row[5].split(',').map((opt: string) => parseInt(opt) - 1) : [0] // Correct options in column 5
                                                                                };
                                                                              }
                                                                            });
                                                                            if (Object.keys(currentQuestion).length > 0) {
                                                                              questions.push(currentQuestion as Question);
                                                                            }
                                                                            formik.setFieldValue(`sections[${sectionIdx}].items[${itemIdx}]`, {
                                                                              type: 'quiz',
                                                                              quizTitle,
                                                                              quizDescription,
                                                                              questions,
                                                                              duration: quizDuration,
                                                                              seqNo: formik.values.sections[sectionIdx].items[itemIdx]?.seqNo || itemIdx + 1
                                                                            });
                                                                          };
                                                                          reader.readAsArrayBuffer(file);
                                                                        }
                                                                      }}
                                                                      className="hidden"
                                                                      id={`quiz-excel-upload-${sectionIdx}-${itemIdx}`}
                                                                    />
                                                                    <Button
                                                                      type="button"
                                                                      variant="outline"
                                                                      size="icon"
                                                                      className="h-8 w-8"
                                                                      onClick={() => document.getElementById(`quiz-excel-upload-${sectionIdx}-${itemIdx}`)?.click()}
                                                                      title="Upload Quiz from Excel"
                                                                    >
                                                                      <UploadCloud size={16} />
                                                                    </Button>
                                                                  </div>
                                                                  <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => remove(itemIdx)}
                                                                    title="Delete"
                                                                  >
                                                                    <Trash2 size={16} className="text-red-500" />
                                                                  </Button>
                                                                  {isQuizSubmitted[`${sectionIdx}-${itemIdx}`] && (
                                                                    <Button
                                                                      type="button"
                                                                      variant="outline"
                                                                      size="icon"
                                                                      className="h-8 w-8"
                                                                      onClick={() => setEditQuiz({ sectionIdx, itemIdx })}
                                                                      title="Edit"
                                                                    >
                                                                      <Pencil size={16} />
                                                                    </Button>
                                                                  )}
                                                                </div>
                                                                {isQuizSubmitted[`${sectionIdx}-${itemIdx}`] && (
                                                                  <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    className="px-2 py-1 rounded-none"
                                                                    onClick={() => setViewItem(
                                                                      viewItem?.sectionIdx === sectionIdx && viewItem?.itemIdx === itemIdx
                                                                        ? null
                                                                        : { sectionIdx, itemIdx }
                                                                    )}
                                                                  >
                                                                    {viewItem?.sectionIdx === sectionIdx && viewItem?.itemIdx === itemIdx
                                                                      ? <ChevronUp size={16} />
                                                                      : <ChevronDown size={16} />}
                                                                  </Button>
                                                                )}
                                                              </div>

                                                              {/* Quiz Edit Form - Shows automatically for new quiz or when edit clicked */}
                                                              {(!isQuizSubmitted[`${sectionIdx}-${itemIdx}`] ||
                                                                editQuiz?.sectionIdx === sectionIdx && editQuiz?.itemIdx === itemIdx) && (
                                                                  <div className="border p-4 rounded bg-gray-50">
                                                                    {/* Quiz Title */}
                                                                    <div className="mb-4">
                                                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Quiz Title
                                                                      </label>
                                                                      <input
                                                                        type="text"
                                                                        name={`sections[${sectionIdx}].items[${itemIdx}].quizTitle`}
                                                                        value={item.quizTitle || ''}
                                                                        onChange={formik.handleChange}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        placeholder="Enter quiz title"
                                                                      />
                                                                    </div>

                                                                    <Input
                                                                      className="ins-control-border mb-2"
                                                                      placeholder="Quiz Description"
                                                                      name={`sections[${sectionIdx}].items[${itemIdx}].quizDescription`}
                                                                      value={item.quizDescription}
                                                                      onChange={formik.handleChange}
                                                                    />

                                                                    {/* Quiz Duration */}
                                                                    <div className="mb-4">
                                                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Quiz Duration (minutes)
                                                                      </label>
                                                                      <Input
                                                                        type="number"
                                                                        min="1"
                                                                        name={`sections[${sectionIdx}].items[${itemIdx}].duration`}
                                                                        value={item.duration || 0}
                                                                        onChange={formik.handleChange}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        placeholder="Enter quiz duration in minutes"
                                                                      />
                                                                    </div>

                                                                    <div className="mt-4 mb-2">
                                                                      <h4 className="font-semibold mb-2">Questions</h4>
                                                                      <FieldArray
                                                                        name={`sections[${sectionIdx}].items[${itemIdx}].questions`}
                                                                        render={arrayHelpers => (
                                                                          <div className="space-y-4">
                                                                            {item.questions.map((question, qIdx) => (
                                                                              <div key={qIdx} className="border p-3 rounded bg-white">
                                                                                <div className="flex justify-between items-start mb-2">
                                                                                  <Input
                                                                                    className="ins-control-border"
                                                                                    placeholder="Question"
                                                                                    name={`sections[${sectionIdx}].items[${itemIdx}].questions[${qIdx}].question`}
                                                                                    value={question.question}
                                                                                    onChange={formik.handleChange}
                                                                                  />
                                                                                  {item.questions.length > 1 && (
                                                                                    <Button
                                                                                      type="button"
                                                                                      variant="outline"
                                                                                      size="icon"
                                                                                      className="h-8 w-8 ml-2"
                                                                                      onClick={() => arrayHelpers.remove(qIdx)}
                                                                                      title="Remove Question"
                                                                                    >
                                                                                      <Trash2 size={16} className="text-red-500" />
                                                                                    </Button>
                                                                                  )}
                                                                                </div>

                                                                                <div className="space-y-2">
                                                                                  {question.options.map((option, optIdx) => (
                                                                                    <div key={optIdx} className="flex items-center gap-2">
                                                                                      <Checkbox
                                                                                        checked={Array.isArray(question.correctOption) && question.correctOption.includes(optIdx)}
                                                                                        onCheckedChange={(checked: boolean) => {
                                                                                          const currentOptions = Array.isArray(question.correctOption)
                                                                                            ? [...question.correctOption]
                                                                                            : [];

                                                                                          const updatedOptions = checked
                                                                                            ? [...currentOptions, optIdx]
                                                                                            : currentOptions.filter(idx => idx !== optIdx);

                                                                                          formik.setFieldValue(
                                                                                            `sections[${sectionIdx}].items[${itemIdx}].questions[${qIdx}].correctOption`,
                                                                                            updatedOptions
                                                                                          );
                                                                                        }}
                                                                                        className="mt-1"
                                                                                      />
                                                                                      <Input
                                                                                        className="ins-control-border flex-1"
                                                                                        placeholder={`Option ${optIdx + 1}`}
                                                                                        name={`sections[${sectionIdx}].items[${itemIdx}].questions[${qIdx}].options[${optIdx}]`}
                                                                                        value={option}
                                                                                        onChange={formik.handleChange}
                                                                                      />
                                                                                      {question.options.length > 2 && (
                                                                                        <Button
                                                                                          type="button"
                                                                                          variant="outline"
                                                                                          size="icon"
                                                                                          className="h-8 w-8"
                                                                                          onClick={() => {
                                                                                            const newOptions = [...question.options];
                                                                                            newOptions.splice(optIdx, 1);
                                                                                            formik.setFieldValue(
                                                                                              `sections[${sectionIdx}].items[${itemIdx}].questions[${qIdx}].options`,
                                                                                              newOptions
                                                                                            );
                                                                                            // Also update correctOption indices if needed
                                                                                            const currentCorrectOptions = Array.isArray(question.correctOption)
                                                                                              ? question.correctOption.filter(idx => idx !== optIdx).map(idx => idx > optIdx ? idx - 1 : idx)
                                                                                              : [];
                                                                                            formik.setFieldValue(
                                                                                              `sections[${sectionIdx}].items[${itemIdx}].questions[${qIdx}].correctOption`,
                                                                                              currentCorrectOptions
                                                                                            );
                                                                                          }}
                                                                                          title="Remove Option"
                                                                                        >
                                                                                          <Trash2 size={16} className="text-red-500" />
                                                                                        </Button>
                                                                                      )}
                                                                                    </div>
                                                                                  ))}
                                                                                </div>

                                                                                <Button
                                                                                  type="button"
                                                                                  variant="outline"
                                                                                  className="mt-2"
                                                                                  onClick={() => {
                                                                                    formik.setFieldValue(
                                                                                      `sections[${sectionIdx}].items[${itemIdx}].questions[${qIdx}].options`,
                                                                                      [...question.options, '']
                                                                                    );
                                                                                  }}
                                                                                >
                                                                                  Add Option
                                                                                </Button>
                                                                              </div>
                                                                            ))}

                                                                            <Button
                                                                              type="button"
                                                                              variant="outline"
                                                                              onClick={() => arrayHelpers.push({
                                                                                question: '',
                                                                                options: ['', ''],
                                                                                correctOption: []
                                                                              })}
                                                                            >
                                                                              Add Question
                                                                            </Button>
                                                                          </div>
                                                                        )}
                                                                      />

                                                                      <div className="flex justify-end gap-2 mt-4">
                                                                        {isQuizSubmitted[`${sectionIdx}-${itemIdx}`] && (
                                                                          <Button
                                                                            type="button"
                                                                            className="rounded-none"
                                                                            variant="outline"
                                                                            onClick={() => setEditQuiz(null)}
                                                                          >
                                                                            Cancel
                                                                          </Button>
                                                                        )}
                                                                        <Button
                                                                          type="button"
                                                                          className="rounded-none"
                                                                          onClick={() => handleQuizSave(sectionIdx, itemIdx)}
                                                                        >
                                                                          {isQuizSubmitted[`${sectionIdx}-${itemIdx}`] ? 'Update Quiz' : 'Save Quiz'}
                                                                        </Button>
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                )}

                                                              {/* Quiz View/Preview - Only show when quiz is submitted and expanded */}
                                                              {isQuizSubmitted[`${sectionIdx}-${itemIdx}`] &&
                                                                viewItem?.sectionIdx === sectionIdx &&
                                                                viewItem?.itemIdx === itemIdx &&
                                                                !editQuiz && (
                                                                  <div className="border-t mt-3 pt-3">
                                                                    <div className="mb-2">
                                                                      <b>Description:</b> {item.quizDescription}
                                                                    </div>
                                                                    <div>
                                                                      <b>Questions:</b>
                                                                      <ol className="list-decimal ml-5 mt-2">
                                                                        {item.questions.map((q, qIdx) => (
                                                                          <li key={qIdx} className="mb-3">
                                                                            <div className="font-medium mb-1">{q.question}</div>
                                                                            <ul className="list-disc ml-5">
                                                                              {q.options.map((opt, optIdx) => (
                                                                                <li key={optIdx} className={
                                                                                  Array.isArray(q.correctOption) && q.correctOption.includes(optIdx) ? "text-green-600 font-medium" : ""
                                                                                }>
                                                                                  {opt}
                                                                                </li>
                                                                              ))}
                                                                            </ul>
                                                                          </li>
                                                                        ))}
                                                                      </ol>
                                                                    </div>
                                                                  </div>
                                                                )}
                                                            </div>
                                                          )}
                                                          {/* ASSIGNMENT */}
                                                          {item.type === "assignment" && (
                                                            <div className="flex flex-col gap-2">
                                                              <div className="flex items-center justify-between gap-2 mb-2">
                                                                <div className="flex items-center gap-2">
                                                                  <span className="font-semibold">
                                                                    {item.title || "New Assignment"}
                                                                  </span>
                                                                  {/* Assignment Duration Display */}
                                                                  <div className="flex items-center gap-2 ml-2">
                                                                    <Clock size={16} className="text-primary" />
                                                                    <span className="font-bold text-primary">
                                                                      {formatDuration(getAssignmentDuration(item))}
                                                                    </span>
                                                                  </div>
                                                                  <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => {
                                                                      const sampleData = [
                                                                        ['Title', 'Description', 'Duration', 'Questions', 'Marks', 'Word Limit', 'Model Answer'],
                                                                        ['Sample Assignment', 'dd', '30 minutes', 'dd', '100', '500 words', 'vmvmmv']
                                                                      ];
                                                                      const wb = XLSX.utils.book_new();
                                                                      const ws = XLSX.utils.aoa_to_sheet(sampleData);
                                                                      XLSX.utils.book_append_sheet(wb, ws, 'Assignment Template');
                                                                      XLSX.writeFile(wb, 'assignment_template.xlsx');
                                                                    }}
                                                                    title="Download Assignment Template"
                                                                  >
                                                                    <Download size={16} />
                                                                  </Button>
                                                                  <div className="relative">
                                                                    <input
                                                                      type="file"
                                                                      accept=".xlsx,.xls"
                                                                      onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                          const reader = new FileReader();
                                                                          reader.onload = (e) => {
                                                                            const data = new Uint8Array(e.target?.result as ArrayBuffer);
                                                                            const workbook = XLSX.read(data, { type: 'array' });
                                                                            const sheet = workbook.Sheets[workbook.SheetNames[0]];
                                                                            const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                                                                            const rows = (json as any[][]).slice(1);
                                                                            handleAssignmentExcelUpload(sectionIdx, itemIdx, rows);
                                                                          };
                                                                          reader.readAsArrayBuffer(file);
                                                                        }
                                                                      }}
                                                                      className="hidden"
                                                                      id={`assignment-excel-upload-${sectionIdx}-${itemIdx}`}
                                                                    />
                                                                    <Button
                                                                      type="button"
                                                                      variant="outline"
                                                                      size="icon"
                                                                      className="h-8 w-8"
                                                                      onClick={() => document.getElementById(`assignment-excel-upload-${sectionIdx}-${itemIdx}`)?.click()}
                                                                      title="Upload Assignment from Excel"
                                                                    >
                                                                      <UploadCloud size={16} />
                                                                    </Button>
                                                                  </div>
                                                                  <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => remove(itemIdx)}
                                                                    title="Delete"
                                                                  >
                                                                    <Trash2 size={16} className="text-red-500" />
                                                                  </Button>
                                                                  {isAssignmentSubmitted[`${sectionIdx}-${itemIdx}`] && (
                                                                    <Button
                                                                      type="button"
                                                                      variant="outline"
                                                                      size="icon"
                                                                      className="h-8 w-8"
                                                                      onClick={() => setEditAssignment({ sectionIdx, itemIdx })}
                                                                      title="Edit"
                                                                    >
                                                                      <Pencil size={16} />
                                                                    </Button>
                                                                  )}
                                                                </div>
                                                                {isAssignmentSubmitted[`${sectionIdx}-${itemIdx}`] && (
                                                                  <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => setViewItem(
                                                                      viewItem?.sectionIdx === sectionIdx && viewItem?.itemIdx === itemIdx
                                                                        ? null
                                                                        : { sectionIdx, itemIdx }
                                                                    )}
                                                                  >
                                                                    {viewItem?.sectionIdx === sectionIdx && viewItem?.itemIdx === itemIdx
                                                                      ? <ChevronUp size={16} />
                                                                      : <ChevronDown size={16} />}
                                                                  </Button>
                                                                )}
                                                              </div>

                                                              {/* Assignment Edit Form */}
                                                              {(!isAssignmentSubmitted[`${sectionIdx}-${itemIdx}`] ||
                                                                editAssignment?.sectionIdx === sectionIdx && editAssignment?.itemIdx === itemIdx) && (
                                                                  <div className="border p-4 rounded bg-gray-50">
                                                                    <div>
                                                                      <label className="block text-sm font-medium mb-1">Assignment Title</label>
                                                                      <Input
                                                                        className="ins-control-border mb-2"
                                                                        placeholder="Assignment Title"
                                                                        name={`sections[${sectionIdx}].items[${itemIdx}].title`}
                                                                        value={item.title}
                                                                        onChange={formik.handleChange}
                                                                      />
                                                                    </div>
                                                                    <div>
                                                                      <label className="block text-sm font-medium mb-1">Assignment Description</label>
                                                                      <Input
                                                                        className="ins-control-border mb-2"
                                                                        placeholder="Assignment Description"
                                                                        name={`sections[${sectionIdx}].items[${itemIdx}].description`}
                                                                        value={item.description}
                                                                        onChange={formik.handleChange}
                                                                      />
                                                                    </div>
                                                                    <div>
                                                                      <label className="block text-sm font-medium mb-1">
                                                                        Duration in minutes
                                                                      </label>
                                                                      <Input
                                                                        className="ins-control-border w-20"
                                                                        type="number"
                                                                        placeholder="Duration (minutes)"
                                                                        name={`sections[${sectionIdx}].items[${itemIdx}].duration`}
                                                                        value={item.duration}
                                                                        onChange={formik.handleChange}
                                                                        min={1}
                                                                      />
                                                                    </div>

                                                                    {/* Replace the existing question section in the assignment edit form */}
                                                                    <div className="mt-4 mb-2">
                                                                      <h4 className="font-semibold mb-2">Questions</h4>
                                                                      <FieldArray name={`sections[${sectionIdx}].items[${itemIdx}].questions`}>
                                                                        {({ push: pushQuestion, remove: removeQuestion }) => (
                                                                          <div className="flex flex-col gap-4">
                                                                            {item.questions.map((question, qIdx) => (
                                                                              <div key={qIdx} className="border p-3 rounded">
                                                                                <div className="flex justify-between mb-2">
                                                                                  <span className="font-medium">Question {qIdx + 1}</span>
                                                                                  {item.questions.length > 1 && (
                                                                                    <Button
                                                                                      type="button"
                                                                                      variant="ghost"
                                                                                      size="sm"
                                                                                      onClick={() => removeQuestion(qIdx)}
                                                                                    >
                                                                                      <Trash2 size={14} />
                                                                                    </Button>
                                                                                  )}
                                                                                </div>

                                                                                <Input
                                                                                  className="ins-control-border mb-2"
                                                                                  placeholder="Enter question"
                                                                                  name={`sections[${sectionIdx}].items[${itemIdx}].questions.${qIdx}.question`}
                                                                                  value={question.question}
                                                                                  onChange={formik.handleChange}
                                                                                />

                                                                                <div className="flex gap-4 mb-2">
                                                                                  <div className="flex-1">
                                                                                    <label className="block text-sm font-medium mb-1">Marks</label>
                                                                                    <Input
                                                                                      className="ins-control-border w-24"
                                                                                      type="number"
                                                                                      placeholder="Marks"
                                                                                      name={`sections[${sectionIdx}].items[${itemIdx}].questions.${qIdx}.marks`}
                                                                                      value={question.marks}
                                                                                      onChange={formik.handleChange}
                                                                                      min={1}
                                                                                    />
                                                                                  </div>
                                                                                  <div className="flex-1">
                                                                                    <label className="block text-sm font-medium mb-1">Word Limit</label>
                                                                                    <Input
                                                                                      className="ins-control-border w-32"
                                                                                      type="number"
                                                                                      placeholder="Max words"
                                                                                      name={`sections[${sectionIdx}].items[${itemIdx}].questions.${qIdx}.maxWordLimit`}
                                                                                      value={question.maxWordLimit}
                                                                                      onChange={formik.handleChange}
                                                                                      min={1}
                                                                                    />
                                                                                  </div>
                                                                                </div>

                                                                                <div>
                                                                                  <label className="block text-sm font-medium mb-1">Model Answer (Optional)</label>
                                                                                  <Textarea
                                                                                    className="ins-control-border w-full min-h-[100px]"
                                                                                    placeholder="Enter a model answer for grading reference"
                                                                                    name={`sections[${sectionIdx}].items[${itemIdx}].questions.${qIdx}.answer`}
                                                                                    value={question.answer}
                                                                                    onChange={formik.handleChange}
                                                                                  />
                                                                                </div>
                                                                              </div>
                                                                            ))}
                                                                            <Button
                                                                              type="button"
                                                                              variant="outline"
                                                                              onClick={() =>
                                                                                pushQuestion({
                                                                                  question: "",
                                                                                  marks: 0,
                                                                                  answer: "",
                                                                                  maxWordLimit: 500
                                                                                })
                                                                              }
                                                                            >
                                                                              Add Question
                                                                            </Button>
                                                                          </div>
                                                                        )}
                                                                      </FieldArray>
                                                                    </div>

                                                                    <div className="flex justify-end gap-2 mt-4">
                                                                      {isAssignmentSubmitted[`${sectionIdx}-${itemIdx}`] && (
                                                                        <Button
                                                                          type="button"
                                                                          variant="outline"
                                                                          onClick={() => setEditAssignment(null)}
                                                                        >
                                                                          Cancel
                                                                        </Button>
                                                                      )}
                                                                      <Button
                                                                        type="button"
                                                                        onClick={() => handleAssignmentSave(sectionIdx, itemIdx)}
                                                                      >
                                                                        Save Assignment
                                                                      </Button>
                                                                    </div>
                                                                  </div>
                                                                )}
                                                              {/* Assignment View/Preview */}
                                                              {isAssignmentSubmitted[`${sectionIdx}-${itemIdx}`] &&
                                                                viewItem?.sectionIdx === sectionIdx &&
                                                                viewItem?.itemIdx === itemIdx &&
                                                                !editAssignment && (
                                                                  <div className="border-t mt-3 pt-3">
                                                                    <div className="mb-2">
                                                                      <b>Description:</b> {item.description}
                                                                    </div>
                                                                    <div className="mb-2">
                                                                      <b>Duration:</b> {item.duration} minutes
                                                                    </div>
                                                                    <div>
                                                                      <b>Questions:</b>
                                                                      <ol className="list-decimal ml-5 mt-2">
                                                                        {item.questions.map((q, qIdx) => (
                                                                          <li key={qIdx} className="mb-3">
                                                                            <div className="font-medium mb-1">{q.question}</div>
                                                                            <div className="text-sm text-gray-600 space-y-1">
                                                                              <div>Marks: {q.marks}</div>
                                                                              {q.maxWordLimit && (
                                                                                <div>Word Limit: {q.maxWordLimit} words</div>
                                                                              )}
                                                                              {q.answer && (
                                                                                <div>
                                                                                  <b>Model Answer:</b>
                                                                                  <div className="ml-2 mt-1 text-gray-700">
                                                                                    {q.answer}
                                                                                  </div>
                                                                                </div>
                                                                              )}
                                                                            </div>
                                                                          </li>
                                                                        ))}
                                                                      </ol>
                                                                    </div>
                                                                  </div>
                                                                )}
                                                            </div>
                                                          )}
                                                          {/* VIEW SUBMITTED CONTENT */}
                                                          {viewItem && item.type != "quiz" && item.type != "assignment" &&
                                                            viewItem.sectionIdx === sectionIdx &&
                                                            viewItem.itemIdx === itemIdx && (
                                                              <div className="border mt-3 p-3 rounded bg-white">
                                                                <div className="flex justify-between items-center mb-2">
                                                                  <span className="font-semibold">Submitted Content</span>
                                                                  {/* <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          className="px-2 py-1 rounded-none"
                                          onClick={() => setViewItem(null)}
                                        >
                                          Close
                                        </Button> */}
                                                                </div>
                                                                {item.type === "lecture" && (
                                                                  <>
                                                                    <div>
                                                                      <b>Lecture Name:</b> {item.lectureName}
                                                                    </div>
                                                                    <div>
                                                                      <b>Content Type:</b> {item.contentType}
                                                                    </div>

                                                                    {item.contentType === "article" && (
                                                                      <div className="mt-2">
                                                                        <b>Article:</b>

                                                                        {/* Article Source: Write - Show HTML content */}
                                                                        {item.articleSource === 'write' && item.contentText && (
                                                                          <div
                                                                            className="prose max-w-none border p-2 mt-1 rounded bg-gray-50"
                                                                            dangerouslySetInnerHTML={{ __html: item.contentText }}
                                                                          />
                                                                        )}

                                                                                                                                                {/* Article Source: Upload - Show uploaded files */}
                                                                        {item.articleSource === 'upload' && item.contentFiles?.length > 0 && (
                                                                          <div className="border rounded p-2 mt-1 bg-gray-50">
                                                                            <div className="text-sm text-gray-600 mb-2">Uploaded Documents:</div>
                                                                            {item.contentFiles.map((file, idx) => (
                                                                              <div key={idx} className="flex items-center justify-between py-1">
                                                                                <div className="flex items-center gap-2">
                                                                                  <File size={16} className="text-blue-500" />
                                                                                  <span className="text-sm font-medium">{file.name}</span>
                                                                                  <span className="text-xs text-gray-500">
                                                                                    {file.file && typeof file.file.size === 'number'
                                                                                      ? `(${(file.file.size / 1024 / 1024).toFixed(2)} MB)`
                                                                                      : ''}
                                                                                  </span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                  <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="p-1 h-6 w-6"
                                                                                    onClick={() => handlePreviewFile(file.url, file.name)}
                                                                                    title="Preview file"
                                                                                  >
                                                                                    <Eye size={14} />
                                                                                  </Button>
                                                                                  <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="px-2 py-1 rounded-none"
                                                                                    onClick={() => {
                                                                                      const newFiles = [...item.contentFiles];
                                                                                      if (newFiles[idx].url && newFiles[idx].url.startsWith('blob:')) {
                                                                                        URL.revokeObjectURL(newFiles[idx].url);
                                                                                      }
                                                                                      newFiles.splice(idx, 1);
                                                                                      formik.setFieldValue(
                                                                                        `sections[${sectionIdx}].items[${itemIdx}].contentFiles`,
                                                                                        newFiles
                                                                                      );
                                                                                    }}
                                                                                  >
                                                                                    <Trash2 size={14} className="text-red-500" />
                                                                                  </Button>
                                                                                </div>
                                                                              </div>
                                                                            ))}
                                                                          </div>
                                                                        )}

                                                                        {/* Article Source: Link - Show URL with preview */}
                                                                        {item.articleSource === 'link' && item.contentUrl && (
                                                                          <div className="border p-2 mt-1 rounded bg-gray-50">
                                                                            <div className="flex items-center gap-2">
                                                                              <ExternalLink size={16} className="text-blue-500" />
                                                                              <a
                                                                                href={item.contentUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                                                                              >
                                                                                {item.contentUrl}
                                                                              </a>
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 mt-1">
                                                                              External Article Link
                                                                            </div>
                                                                          </div>
                                                                        )}

                                                                        {/* Resources Section for Articles */}
                                                                        <div className="mt-4">
                                                                          <div className="flex items-center justify-between mb-2">
                                                                            <h4 className="font-medium text-sm">Resources</h4>
                                                                            <Button
                                                                              type="button"
                                                                              size="sm"
                                                                              variant="outline"
                                                                              onClick={() => {
                                                                                const fileInput = document.createElement('input');
                                                                                fileInput.type = 'file';
                                                                                fileInput.accept = '.pdf,.doc,.docx,.zip,.rar,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.xls,.xlsx';
                                                                                fileInput.multiple = true;

                                                                                fileInput.onchange = async (e) => {
                                                                                  const files = (e.target as HTMLInputElement).files;
                                                                                  if (files) {
                                                                                    const currentResources = item.resources || [];
                                                                                    const newResources = await Promise.all(
                                                                                      Array.from(files).map(async (file) => {
                                                                                        // Upload to Cloudinary
                                                                                        let cloudinaryUrl = '';
                                                                                        let cloudinaryPublicId = '';
                                                                                        
                                                                                        try {
                                                                                          const uploadResult = await uploadToCloudinary(file, 'raw');
                                                                                          cloudinaryUrl = uploadResult.url;
                                                                                          cloudinaryPublicId = uploadResult.publicId;
                                                                                        } catch (error) {
                                                                                          console.error('Failed to upload resource to Cloudinary:', error);
                                                                                          // Fallback to local file
                                                                                          cloudinaryUrl = URL.createObjectURL(file);
                                                                                        }

                                                                                        return {
                                                                                          name: file.name,
                                                                                          file: file,
                                                                                          url: cloudinaryUrl,
                                                                                          cloudinaryUrl: cloudinaryUrl,
                                                                                          cloudinaryPublicId: cloudinaryPublicId,
                                                                                          type: 'lecture'
                                                                                        };
                                                                                      })
                                                                                    );

                                                                                    formik.setFieldValue(
                                                                                      `sections[${sectionIdx}].items[${itemIdx}].resources`,
                                                                                      [...currentResources, ...newResources]
                                                                                    );
                                                                                  }
                                                                                };

                                                                                fileInput.click();
                                                                              }}
                                                                            >
                                                                              + Add Resources
                                                                            </Button>
                                                                          </div>

                                                                          {item.resources?.length > 0 && (
                                                                            <div className="border rounded p-2 bg-white">
                                                                              {item.resources.map((resource, resourceIdx) => (
                                                                                <div key={resourceIdx} className="flex items-center justify-between py-1">
                                                                                  <div className="flex items-center gap-2">
                                                                                    {getFileIcon(resource.name)}
                                                                                    <span className="text-sm">{resource.name}</span>
                                                                                    {resource.cloudinaryUrl && resource.cloudinaryUrl !== resource.url && (
                                                                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                                        Cloudinary
                                                                                      </span>
                                                                                    )}
                                                                                  </div>
                                                                                  <div className="flex items-center gap-2">
                                                                                    <Button
                                                                                      type="button"
                                                                                      variant="ghost"
                                                                                      size="sm"
                                                                                      className="p-1 h-6 w-6"
                                                                                      onClick={() => {
                                                                                        if (resource.cloudinaryUrl) {
                                                                                          window.open(resource.cloudinaryUrl, '_blank');
                                                                                        } else if (resource.url) {
                                                                                          window.open(resource.url, '_blank');
                                                                                        }
                                                                                      }}
                                                                                      title="Open resource"
                                                                                    >
                                                                                      <Eye size={14} />
                                                                                    </Button>
                                                                                    <Button
                                                                                      type="button"
                                                                                      variant="ghost"
                                                                                      size="sm"
                                                                                      className="px-2 py-1 rounded-none text-red-600"
                                                                                      onClick={() => {
                                                                                        const newResources = [...item.resources];
                                                                                        const resourceUrl = newResources[resourceIdx]?.url;
                                                                                        if (resourceUrl && resourceUrl.startsWith('blob:')) {
                                                                                          URL.revokeObjectURL(resourceUrl);
                                                                                        }
                                                                                        newResources.splice(resourceIdx, 1);
                                                                                        formik.setFieldValue(
                                                                                          `sections[${sectionIdx}].items[${itemIdx}].resources`,
                                                                                          newResources
                                                                                        );
                                                                                      }}
                                                                                    >
                                                                                      <Trash2 size={12} />
                                                                                    </Button>
                                                                                  </div>
                                                                                </div>
                                                                              ))}
                                                                            </div>
                                                                          )}
                                                                        </div>

                                                                        {/* No content message */}
                                                                        {(!item.articleSource ||
                                                                          (item.articleSource === 'write' && !item.contentText) ||
                                                                          (item.articleSource === 'upload' && (!item.contentFiles || item.contentFiles.length === 0)) ||
                                                                          (item.articleSource === 'link' && !item.contentUrl)
                                                                        ) && (
                                                                            <div className="border p-2 mt-1 rounded bg-gray-50 text-gray-500 text-sm italic">
                                                                              No article content added yet
                                                                            </div>
                                                                          )}
                                                                      </div>
                                                                    )}
                                                                    {/* In your view content section, update the video part */}
                                                                    {item.contentType === "video" && (
                                                                      <div className="mt-2">
                                                                        {item.contentFiles?.length > 0 && (
                                                                          <>
                                                                            <b>Videos:</b>
                                                                            <div className="grid gap-4 mt-1">
                                                                              {item.contentFiles.map((content, idx) => (
                                                                                <div key={idx} className="border rounded p-2">
                                                                                  <div className="flex items-center justify-between mb-2">
                                                                                    <p className="text-sm font-medium">Video {idx + 1}: {content.name}</p>
                                                                                    <div className="flex items-center gap-2 mb-2">
                                                                                      <Clock className="text-primary" size={16} />
                                                                                      <span className="font-bold text-primary"> {formatDuration(content.duration || 0)}</span>
                                                                                    </div>
                                                                                  </div>
                                                                                  <div className="w-full" style={{ position: 'relative', paddingTop: '56.25%' }}>
                                                                                    <video src={content.url} controls style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
                                                                                  </div>
                                                                                </div>
                                                                              ))}
                                                                            </div>
                                                                          </>
                                                                        )}
                                                                        {/* Show video link if present */}
                                                                        {item.videoSource === "link" && item.contentUrl && (
                                                                          <div className="mt-4">
                                                                            <b>Video Link:</b>
                                                                            <div className="border rounded p-2 mt-1 bg-gray-50 break-all">
                                                                              <a href={item.contentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                                                {item.contentUrl}
                                                                              </a>
                                                                            </div>
                                                                            {/* Optionally, embed the video if it's a YouTube/Vimeo link */}
                                                                            {(item.contentUrl.includes("youtube.com") || item.contentUrl.includes("youtu.be")) && (
                                                                                <div className="mt-2">
                                                                                  <div className="w-full" style={{ position: 'relative', paddingTop: '56.25%' }}>
                                                                                    <iframe
                                                                                      src={`https://www.youtube.com/embed/${item.contentUrl.includes("youtube.com")
                                                                                        ? item.contentUrl.split("v=")[1]?.split("&")[0]
                                                                                        : item.contentUrl.split("/").pop()}`}
                                                                                      title="YouTube video"
                                                                                      frameBorder="0"
                                                                                      allowFullScreen
                                                                                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                                                                    />
                                                                                  </div>
                                                                                </div>
                                                                            )}
                                                                            {item.contentUrl.includes("vimeo.com") && (
                                                                                <div className="mt-2">
                                                                                  <div className="w-full" style={{ position: 'relative', paddingTop: '56.25%' }}>
                                                                                    <iframe
                                                                                      src={`https://player.vimeo.com/video/${item.contentUrl.split("/").pop()}`}
                                                                                      title="Vimeo video"
                                                                                      frameBorder="0"
                                                                                      allowFullScreen
                                                                                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                                                                    />
                                                                                  </div>
                                                                                </div>
                                                                            )}
                                                                          </div>
                                                                        )}
                                                                        {/* Resources */}
                                                                        {item.resources?.length > 0 && (
                                                                          <div className="mt-4">
                                                                            <b>Resources:</b>
                                                                            <div className="border rounded p-2 mt-1 bg-gray-50">
                                                                              {item.resources.map((resource, idx) => (
                                                                                <div key={idx} className="flex items-center gap-2 py-1">
                                                                                  <File size={14} />
                                                                                  <span className="text-sm">{resource.name}</span>
                                                                                </div>
                                                                              ))}
                                                                            </div>
                                                                          </div>
                                                                        )}
                                                                      </div>
                                                                    )}
                                                                  </>
                                                                )}

                                                              </div>
                                                            )}
                                                        </div>
                                                      </div>
                                                    )}
                                                  </Draggable>
                                                ))}
                                              </div>)}
                                          </Droppable>
                                          {/* Add item (lecture/quiz) */}
                                          {addType && addType.sectionIdx === sectionIdx ? (
                                            <div className="flex flex-col md:flex-row gap-2 mt-2">
                                              <Button
                                                type="button"
                                                className="rounded-none"
                                                onClick={() => {
                                                  push({
                                                    type: "lecture",
                                                    lectureName: `Lecture ${section.items.length + 1}`,
                                                    contentType: "",
                                                    videoSource: "upload",
                                                    articleSource: "upload",
                                                    contentFiles: [],
                                                    contentUrl: "",
                                                    contentText: "",
                                                    resources: [],
                                                    published: false, // Default to unpublished
                                                    description: "", // Add description field
                                                    isPromotional: false, // Default to non-promotional
                                                    seqNo: section.items.length + 1, // Set seqNo based on current items count
                                                  });
                                                  setAddType(null);
                                                }}
                                              >
                                                + Lecture
                                              </Button>
                                              <Button
                                                type="button"
                                                className="rounded-none"
                                                onClick={() => {
                                                  const newItemIdx = section.items.length;
                                                  push(getInitialQuiz(newItemIdx + 1));
                                                  setAddType(null);
                                                  // Set the new quiz to edit mode
                                                  setEditQuiz({ sectionIdx, itemIdx: newItemIdx });
                                                  setViewItem({ sectionIdx, itemIdx: newItemIdx });
                                                  setIsQuizSubmitted(prev => ({ ...prev, [`${sectionIdx}-${newItemIdx}`]: false }));
                                                }}
                                              >
                                                + Quiz
                                              </Button>
                                              <Button
                                                type="button"
                                                className="rounded-none"
                                                onClick={() => {
                                                  const newItemIdx = section.items.length;
                                                  push(getInitialAssignment(newItemIdx + 1));
                                                  setAddType(null);
                                                }}
                                              >
                                                + Assignment
                                              </Button>
                                              <Button
                                                type="button"
                                                className="rounded-none"
                                                onClick={() => setAddType(null)}
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          ) : (
                                            <div>
                                              <Button
                                                className="rounded-none mt-2"
                                                type="button"
                                                onClick={() => setAddType({ sectionIdx })}
                                              >
                                                + Curriculum item
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </FieldArray>
                                    )}
                                  </div>
                                </div>)}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>)}
                    </Droppable>
                  </DragDropContext>
                  <div>
                    <Button
                      className="rounded-none"
                      type="button"
                      onClick={() => {
                        const newSectionIdx = formik.values.sections.length;
                        pushSection({
                          name: `Section ${newSectionIdx + 1}`,
                          seqNo: newSectionIdx + 1,
                          items: [
                            {
                              type: "lecture",
                              lectureName: "Lecture 1",
                              contentType: "",
                              contentFile: null,
                              contentUrl: "",
                              contentText: "",
                              published: false, // Default to unpublished
                              description: "", // Add description field
                              seqNo: 1 // First item in the section
                            },
                          ],
                          published: false // Default to unpublished
                        });
                        // Automatically expand the newly created section
                        setExpandedSections(prev => ({
                          ...prev,
                          [newSectionIdx]: true
                        }));
                        // Ensure all items are collapsed when new section is created
                        setViewItem(null);
                      }}
                    >
                      + Add Section
                    </Button>
                  </div>
                </div>
              )}
            </FieldArray>

          </div>
        </div>
        <div className="flex justify-end mt-8">
          <Button className="rounded-none" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </form>
      {/* Upload Content Modal */}
      <UploadContentModal
        open={uploadModal.open}
        onClose={() => {
          console.log('Modal closing');
          setUploadModal({ open: false, sectionIdx: null });
          setUploadType(null);
        }}
        uploadType={uploadType}
        setUploadType={setUploadType}
        onUpload={async (filesOrExcel, sectionIdx) => {
          console.log('onUpload called with:', { filesOrExcel, sectionIdx, uploadType });

          // Get current section items from formik
          const currentSectionItems = formik.values.sections[sectionIdx]?.items || [];
          console.log('Current section items:', currentSectionItems);

          // Check for empty lecture
          const emptyLectureIndex = currentSectionItems.findIndex(item =>
            item.type === 'lecture' &&
            item.contentType === '' &&
            (!item.contentFiles || item.contentFiles.length === 0)
          );
          console.log('Empty lecture index:', emptyLectureIndex);

          // Type guard for FileList
          const isFileList = (value: unknown): value is FileList => {
            return typeof value === 'object' && value !== null && 'length' in value && 'item' in value;
          };

          // Type guard for File
          const isFile = (value: unknown): value is File => {
            return typeof value === 'object' && value !== null && 'name' in value && 'size' in value && 'type' in value;
          };

          if (uploadType === 'video' && isFileList(filesOrExcel)) {
            // Handle video files
            console.log('Processing video files');
            // Create video lectures for each file
            const newLectures = await Promise.all(
              Array.from(filesOrExcel).map(async (file) => {
                // Upload to Cloudinary first
                let cloudinaryUrl = '';
                let cloudinaryPublicId = '';
                let duration = 0;
                
                try {
                  console.log('Starting video upload to Cloudinary for:', file.name);
                  
                  // Update status to uploading
                  const tempLecture = {
                    type: 'lecture' as const,
                    lectureName: file.name.replace(/\.[^/.]+$/, ""),
                    contentType: 'video' as const,
                    videoSource: 'upload' as const,
                    contentFiles: [{
                      file,
                      url: '', // Will be set after upload
                      name: file.name,
                      status: 'uploading' as VideoStatus,
                      uploadedAt: new Date(),
                      uploadProgress: 0
                    }],
                    contentUrl: '',
                    contentText: '',
                    articleSource: 'upload' as const,
                    resources: [],
                    published: false,
                    description: '',
                    isPromotional: false,
                    seqNo: formik.values.sections[sectionIdx].items.length + 1
                  };

                  // Add the lecture immediately with uploading status
                  const newSections = [...formik.values.sections];
                  newSections[sectionIdx].items.push(tempLecture);
                  formik.setValues({ sections: newSections });

                  // Upload to Cloudinary with progress tracking
                  const uploadResult = await uploadToCloudinary(file, 'video', (progress) => {
                    // Update progress in the UI
                    const updatedSections = [...formik.values.sections];
                    const lectureIndex = updatedSections[sectionIdx].items.length - 1;
                    if (updatedSections[sectionIdx].items[lectureIndex].type === 'lecture') {
                      const lecture = updatedSections[sectionIdx].items[lectureIndex] as LectureItem;
                      if (lecture.contentFiles[0]) {
                        lecture.contentFiles[0].uploadProgress = progress;
                        formik.setValues({ sections: updatedSections });
                      }
                    }
                  });
                  
                  cloudinaryUrl = uploadResult.url;
                  cloudinaryPublicId = uploadResult.publicId;
                  duration = uploadResult.duration || 0;
                  
                  console.log('Cloudinary upload successful:', {
                    url: cloudinaryUrl,
                    publicId: cloudinaryPublicId,
                    duration: duration
                  });
                  
                  // Ensure we have a valid Cloudinary URL
                  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
                    throw new Error('Invalid Cloudinary URL received');
                  }
                  
                } catch (error) {
                  console.error('Failed to upload video to Cloudinary:', error);
                  
                  // Update status to failed
                  const updatedSections = [...formik.values.sections];
                  const lectureIndex = updatedSections[sectionIdx].items.length - 1;
                  if (updatedSections[sectionIdx].items[lectureIndex].type === 'lecture') {
                    const lecture = updatedSections[sectionIdx].items[lectureIndex] as LectureItem;
                    if (lecture.contentFiles[0]) {
                      lecture.contentFiles[0].status = 'failed';
                      formik.setValues({ sections: updatedSections });
                    }
                  }
                  
                  // Don't fallback to blob URLs - require Cloudinary upload
                  throw new Error(`Video upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }

                console.log('Updating lecture with Cloudinary data:', duration);
                
                // Update the existing lecture with Cloudinary data
                const updatedSections = [...formik.values.sections];
                const lectureIndex = updatedSections[sectionIdx].items.length - 1;
                
                if (updatedSections[sectionIdx].items[lectureIndex].type === 'lecture') {
                  const lecture = updatedSections[sectionIdx].items[lectureIndex] as LectureItem;
                  
                  // Update the content file with Cloudinary data
                  if (lecture.contentFiles[0]) {
                    lecture.contentFiles[0] = {
                      ...lecture.contentFiles[0],
                      url: cloudinaryUrl,
                      cloudinaryUrl,
                      cloudinaryPublicId,
                      duration,
                      status: 'uploaded' as VideoStatus,
                      uploadProgress: 100
                    };
                  }
                  
                  // Update lecture properties
                  lecture.contentUrl = cloudinaryUrl;
                  lecture.duration = duration;
                  
                  // Update the form values
                  formik.setValues({ sections: updatedSections });
                  
                  console.log('Updated lecture object:', lecture);
                  return lecture;
                }
                
                // Fallback: create new lecture if update failed
                const lecture = {
                  type: 'lecture' as const,
                  lectureName: file.name.replace(/\.[^/.]+$/, ""),
                  contentType: 'video' as const,
                  videoSource: 'upload' as const,
                  contentFiles: [{
                    file,
                    url: cloudinaryUrl,
                    cloudinaryUrl,
                    cloudinaryPublicId,
                    name: file.name,
                    duration,
                    status: 'uploaded' as VideoStatus,
                    uploadedAt: new Date()
                  }],
                  contentUrl: cloudinaryUrl,
                  contentText: '',
                  articleSource: 'upload' as const,
                  resources: [],
                  published: false,
                  isPromotional: false,
                  seqNo: currentSectionItems.length + 1,
                };
                console.log('Created fallback lecture object:', lecture);
                return lecture;
              })
            );

              // Build the final items array (insert into empty lecture if present)
              let finalItems = [] as any[];
              if (emptyLectureIndex !== -1) {
                const updatedItems = [...currentSectionItems];
                updatedItems[emptyLectureIndex] = newLectures[0];
                if (newLectures.length > 1) {
                  updatedItems.push(...newLectures.slice(1));
                }
                finalItems = updatedItems;
              } else {
                finalItems = [...currentSectionItems, ...newLectures];
              }

              // Utility: mark first two video lectures in this section as promotional
              const applyPromotionalMarking = (itemsArray: any[]) => {
                const copy = itemsArray.map((it) => ({ ...it }));
                let markedCount = 0;
                for (let i = 0; i < copy.length; i++) {
                  const it = copy[i];
                  if (it && it.type === 'lecture' && it.contentType === 'video') {
                    if (markedCount < 2) {
                      it.isPromotional = true;
                      markedCount++;
                    } else {
                      it.isPromotional = false;
                    }
                  }
                }
                return copy;
              };

              const itemsWithPromo = applyPromotionalMarking(finalItems);
              formik.setFieldValue(`sections[${sectionIdx}].items`, itemsWithPromo);
          } else if (uploadType === 'document' && isFileList(filesOrExcel)) {
            // Handle document files
            console.log('Processing document files');
            // Create document lectures for each file
            const newLectures = await Promise.all(
              Array.from(filesOrExcel).map(async (file, index) => {
                // Upload to Cloudinary
                let cloudinaryUrl = '';
                let cloudinaryPublicId = '';
                
                try {
                  const uploadResult = await uploadToCloudinary(file, 'raw');
                  cloudinaryUrl = uploadResult.url;
                  cloudinaryPublicId = uploadResult.publicId;
                } catch (error) {
                  console.error('Failed to upload document to Cloudinary:', error);
                  // Fallback to blob URL if Cloudinary fails
                  const fallbackUrl = URL.createObjectURL(file);
                  
                  return {
                    type: 'lecture' as const,
                    lectureName: file.name.replace(/\.[^/.]+$/, ""),
                    contentType: 'article' as const,
                    videoSource: 'upload' as const,
                    contentFiles: [{
                      file,
                      url: fallbackUrl,
                      cloudinaryUrl: '',
                      cloudinaryPublicId: '',
                      name: file.name,
                      status: 'failed' as VideoStatus,
                      uploadedAt: new Date()
                    }],
                    contentUrl: '',
                    contentText: '',
                    articleSource: 'upload' as const,
                    resources: [],
                    published: false,
                    isPromotional: false,
                    seqNo: currentSectionItems.length + index + 1,
                  };
                }

                return {
                  type: 'lecture' as const,
                  lectureName: file.name.replace(/\.[^/.]+$/, ""),
                  contentType: 'article' as const,
                  videoSource: 'upload' as const,
                  contentFiles: [{
                    file,
                    url: cloudinaryUrl, // Store Cloudinary URL as primary URL
                    cloudinaryUrl,
                    cloudinaryPublicId,
                    name: file.name,
                    status: 'uploaded' as VideoStatus,
                    uploadedAt: new Date()
                  }],
                  contentUrl: '',
                  contentText: '',
                  articleSource: 'upload' as const,
                  resources: [],
                  published: false,
                  isPromotional: false,
                  seqNo: currentSectionItems.length + index + 1,
                };
              })
            );

            // If there's an empty lecture, update it with the first document
            if (emptyLectureIndex !== -1) {
              const updatedItems = [...currentSectionItems];
              updatedItems[emptyLectureIndex] = newLectures[0];

              // Add remaining documents as new lectures
              if (newLectures.length > 1) {
                updatedItems.push(...newLectures.slice(1));
              }

              formik.setFieldValue(
                `sections[${sectionIdx}].items`,
                updatedItems
              );
            } else {
              // No empty lecture found, add all as new lectures
              formik.setFieldValue(
                `sections[${sectionIdx}].items`,
                [...currentSectionItems, ...newLectures]
              );
            }
          } else if (uploadType === 'url' && isFile(filesOrExcel)) {
            // Handle Excel file
            console.log('Processing Excel file');
            const urls: string[] = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                // Assume URLs are in the first column, skip header
                const urlList = (json as any[][]).slice(1).map(row => row[0]).filter(Boolean);
                resolve(urlList);
              };
              reader.onerror = reject;
              reader.readAsArrayBuffer(filesOrExcel);
            });

            // Create video lectures for each URL
            const newLectures = urls.map((url, idx) => ({
              type: 'lecture' as const,
              lectureName: `Video Link ${idx + 1}`,
              contentType: 'video' as const,
              videoSource: 'link' as const,
              contentFiles: [],
              contentUrl: url,
              contentText: '',
              articleSource: 'upload' as const,
              resources: [],
              published: false, // Default to unpublished
              isPromotional: false, // Default to non-promotional
              seqNo: currentSectionItems.length + idx + 1,
            }));

            // If there's an empty lecture, update it with the first URL
            if (emptyLectureIndex !== -1) {
              const updatedItems = [...currentSectionItems];
              updatedItems[emptyLectureIndex] = newLectures[0];

              // Add remaining URLs as new lectures
              if (newLectures.length > 1) {
                updatedItems.push(...newLectures.slice(1));
              }

              formik.setFieldValue(
                `sections[${sectionIdx}].items`,
                updatedItems
              );
            } else {
              // No empty lecture found, add all as new lectures
              formik.setFieldValue(
                `sections[${sectionIdx}].items`,
                [...currentSectionItems, ...newLectures]
              );
            }
          } else if (uploadType === 'write' && isFile(filesOrExcel)) {
            // Handle Excel file for paragraphs
            const paragraphs: { text: string; heading?: string }[] = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                // Skip header row and map to paragraph objects
                const paragraphList = (json as any[][]).slice(1).map(row => ({
                  text: row[0] || '',
                  heading: row[1] || undefined
                })).filter(p => p.text);
                resolve(paragraphList);
              };
              reader.onerror = reject;
              reader.readAsArrayBuffer(filesOrExcel);
            });

            // Convert paragraphs to HTML
            const htmlContent = paragraphs.map(p => {
              if (p.heading) {
                return `<h2>${p.heading}</h2><p>${p.text}</p>`;
              }
              return `<p>${p.text}</p>`;
            }).join('');

            const newLecture = {
              type: 'lecture' as const,
              lectureName: 'Article',
              contentType: 'article' as const,
              videoSource: 'upload' as const,
              contentFiles: [],
              contentUrl: '',
              contentText: htmlContent,
              articleSource: 'write' as const,
              resources: [],
              published: false, // Default to unpublished
              isPromotional: false, // Default to non-promotional
              seqNo: currentSectionItems.length + 1,
            };

            if (emptyLectureIndex !== -1) {
              const updatedItems = [...currentSectionItems];
              updatedItems[emptyLectureIndex] = newLecture;
              formik.setFieldValue(
                `sections[${sectionIdx}].items`,
                updatedItems
              );
            } else {
              formik.setFieldValue(
                `sections[${sectionIdx}].items`,
                [...currentSectionItems, newLecture]
              );
            }
          }

          // Close the modal after processing
          setUploadModal({ open: false, sectionIdx: null });
          setUploadType(null);
        }}
        sectionIdx={uploadModal.sectionIdx}
      />
      
      {/* Preview Modal */}
      {showPreviewModal && previewContent && (
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview: {previewContent.name}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {previewContent.type.startsWith('video/') && (
                <div className="w-full" style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <video controls src={previewContent.url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
                </div>
              )}
              {previewContent.type.startsWith('image/') && (
                <img src={previewContent.url} alt={previewContent.name} className="max-w-full h-auto max-h-[60vh] mx-auto" />
              )}
              {previewContent.type === 'application/pdf' && (
                <div className="w-full" style={{ position: 'relative', paddingTop: '75%' }}>
                  <iframe src={previewContent.url} title={previewContent.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
                </div>
              )}
              {/* For other document types, provide a download link */}
              {!(previewContent.type.startsWith('video/') || previewContent.type.startsWith('image/') || previewContent.type === 'application/pdf') && (
                <div className="flex flex-col items-center justify-center p-4 border rounded-md bg-gray-50">
                  <FileTextIcon size={48} className="text-gray-500 mb-2" />
                  <p className="text-gray-700 mb-2">This file type cannot be previewed directly.</p>
                  <Button onClick={() => window.open(previewContent.url, '_blank')} className="flex items-center gap-2">
                    <Download size={16} /> Download File
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </FormikProvider>
  );
}

function ArticleEditor({
  sectionIdx,
  itemIdx,
  content,
  onChange
}: {
  sectionIdx: number;
  itemIdx: number;
  content: string;
  onChange: (html: string) => void;
}) {
  return (
    <Textarea
      className="min-h-[120px] p-4 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary"
      value={content}
      onChange={e => onChange(e.target.value)}
      placeholder="Enter description..."
    />
  );
}

const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return "00:00";
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};



// Modal for Upload Content
function UploadContentModal({ open, onClose, uploadType, setUploadType, onUpload, sectionIdx }: {
  open: boolean;
  onClose: () => void;
  uploadType: 'video' | 'document' | 'url' | 'write' | null;
  setUploadType: (type: 'video' | 'document' | 'url' | 'write' | null) => void;
  onUpload: (filesOrExcel: FileList | File | string, sectionIdx: number) => void;
  sectionIdx: number | null;
}) {
  
  const [selectedFiles, setSelectedFiles] = useState<FileList | File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (uploadType === 'url' || uploadType === 'write') {
      // For URL/Excel and Write/Excel, we only need the first file
      setSelectedFiles(files[0]);
    } else {
      // For video and document, we can handle multiple files
      setSelectedFiles(files);
    }
  };

  const handleUpload = () => {

    if (!selectedFiles || sectionIdx === null) return;

    console.log('Uploading files:', selectedFiles);
    console.log('Upload type:', uploadType);
    console.log('Section index:', sectionIdx);

    try {
      onUpload(selectedFiles, sectionIdx);
      // Close modal and reset state after successful upload
      setSelectedFiles(null);
      setUploadType(null);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Reset selected files when modal closes
  const handleClose = () => {
    setSelectedFiles(null);
    setUploadType(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Content Type to Upload</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!uploadType ? (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => setUploadType('video')}
              >
                <Video className="h-8 w-8" />
                <span>Video</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => setUploadType('document')}
              >
                <FileText className="h-8 w-8" />
                <span>Document</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => setUploadType('url')}
              >
                <Link className="h-8 w-8" />
                <span>URL</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => setUploadType('write')}
              >
                <PenLine className="h-8 w-8" />
                <span>Write</span>
              </Button>
            </div>
          ) : uploadType === 'write' ? (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Excel Format Instructions:</h4>
                <p className="text-sm text-gray-500 mb-2">
                  Create an Excel file with the following format:
                </p>
                <div className="bg-gray-50 p-2 rounded text-sm font-mono">
                  <p>Column A: Paragraph</p>
                  <p>Column B: Heading (optional)</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Each row will be converted into a paragraph in the article.
                  If a heading is provided, it will be used as a section header.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Excel File
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="w-full"
                />
                {selectedFiles && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Selected file: {(selectedFiles as File).name}
                    </p>
                    <Button onClick={handleUpload} className="w-full">
                      Upload File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : uploadType === 'video' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Video Files
                </label>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleFileChange}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Select one or more video files to upload
                </p>
                {selectedFiles && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Selected files: {(selectedFiles as FileList).length} video(s)
                    </p>
                    <Button onClick={handleUpload} className="w-full">
                      Upload Videos
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : uploadType === 'document' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Document Files
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  multiple
                  onChange={handleFileChange}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Select one or more document files to upload
                </p>
                {selectedFiles && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Selected files: {(selectedFiles as FileList).length} document(s)
                    </p>
                    <Button onClick={handleUpload} className="w-full">
                      Upload Documents
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : uploadType === 'url' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Excel File with URLs
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 mt-2 space-y-2">
                  <p>Upload an Excel file with URLs in the first column.</p>
                  <p className="font-medium">Sample Excel Format:</p>
                  <pre className="bg-gray-50 p-2 rounded text-sm font-mono">
                    A
                    1 | URL
                    2 | https://example.com/video1
                    3 | https://example.com/video2
                  </pre>
                </div>
                {selectedFiles && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Selected file: {(selectedFiles as File).name}
                    </p>
                    <Button onClick={handleUpload} className="w-full">
                      Upload URLs
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}