import { useState, useEffect, useRef } from "react";
import LoadingIcon from "../../../../components/ui/LoadingIcon";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Pencil, Trash2, UploadCloud, ChevronDown, ChevronUp, File, ExternalLink, GripVertical, Video, FileText, Link, PenLine, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { MenuBar } from "../../../../components/ui/tiptapmenubar";
import { Textarea } from "../../../../components/ui/textarea";
import { Checkbox } from "../../../../components/ui/checkbox";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../../../../components/ui/hover-card";
// @ts-ignore
import * as XLSX from 'xlsx';
// Add Tiptap imports:
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { getCourseDraft, saveCourseDraft } from "../../../../fakeAPI/course";


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
}

type VideoStatus = 'uploaded' | 'uploading' | 'failed';

interface VideoContent {
  file: File;
  url: string;
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
  }[];
  published: boolean; // Add published property
  description?: string; // Add description field
  isPromotional?: boolean; // Add promotional property for free videos
}

export interface Section {
  name: string;
  items: (LectureItem | QuizItem | Assignment)[];
  published: boolean; // Add published property
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

interface AddTypeState {
  sectionIdx: number;
}

const getInitialAssignment = (): Assignment => ({
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
  ]
});

const getInitialQuiz = (): QuizItem => ({
  type: "quiz",
  quizTitle: "",
  quizDescription: "",
  questions: [
    {
      question: "",
      options: ["", ""],
      correctOption: [0],
    },
  ],
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
  isPromotional: false, // Default to non-promotional
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
              const { name, url, duration, status, uploadedAt } = cf || {};
              // Only add defined fields
              const result: any = {};
              if (name !== undefined) result.name = name;
              if (url !== undefined) result.url = url;
              if (duration !== undefined) result.duration = duration;
              if (status !== undefined) result.status = status;
              if (uploadedAt !== undefined) result.uploadedAt = uploadedAt;
              return result;
            });
          } else if (key === 'resources' && Array.isArray(obj[key])) {
            newObj[key] = obj[key].map((res: any) => {
              const { name } = res || {};
              const result: any = {};
              if (name !== undefined) result.name = name;
              return result;
            });
          } else {
            newObj[key] = clean(obj[key]);
          }
        }
      }
      return newObj;
    }
    return obj;
  }
  return clean(clone);
}

export function CourseCarriculam({ onSubmit }: any) {
  const draftId = useRef<string>(localStorage.getItem("draftId") || "");
  const [loading, setLoading] = useState(true);
  const [showContentType, setShowContentType] = useState<ViewItemState | null>(null);
  const [editLecture, setEditLecture] = useState<ViewItemState | null>(null);
  const [addType, setAddType] = useState<AddTypeState | null>(null);
  const [viewItem, setViewItem] = useState<ViewItemState | null>(null);
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

  const initialValues: CurriculumFormValues = {
    sections: [
      {
        name: "Introduction",
        items: [getInitialLecture(1)],
        published: false // Default to unpublished
      },
    ],
  };

  const [formInitialValues, setFormInitialValues] = useState(initialValues);

  useEffect(() => {
    async function fetchDraft() {
      setLoading(true);
      if (draftId.current) {
        const draft = await getCourseDraft(draftId.current);
        if (draft && draft.curriculum) {
          setFormInitialValues(draft.curriculum);
        }
      }
      setLoading(false);
    }
    fetchDraft();
  }, []);

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
                  contentUrl: Yup.string().when(["contentType", "articleSource"], {
                    is: (contentType: string, articleSource: string) =>
                      contentType === "article" && articleSource === "link",
                    then: (schema) => schema.url("Please enter a valid URL").required("Article URL is required"),
                    otherwise: (schema) => schema.when("contentType", {
                      is: (val: string) => val === "video",
                      then: (schema) => schema.url("Please enter a valid URL"),
                      otherwise: (schema) => schema.notRequired(),
                    }),
                  }),
                  contentFiles: Yup.array().when(["contentType", "articleSource"], {
                    is: (contentType: string, articleSource: string) =>
                      contentType === "article" && articleSource === "upload",
                    then: (schema) => schema.min(1, "Please upload at least one document"),
                    otherwise: (schema) => schema.when("contentType", {
                      is: (val: string) => val === "video",
                      then: (schema) => schema.min(1, "Please upload at least one video file"),
                      otherwise: (schema) => schema.notRequired(),
                    }),
                  }),
                });
              } else if (item.type === "quiz") {
                return Yup.object({
                  type: Yup.string().oneOf(["quiz"]).required(),
                  quizTitle: Yup.string().required("Quiz title is required"),
                  quizDescription: Yup.string().required("Quiz description is required"),
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
      const serializableCurriculum = stripFilesFromCurriculum(values);
      await saveCourseDraft(draftId.current, {
        curriculum: serializableCurriculum,
        progress: 24, // or next step value
        isCurriculumFinal: true,
      });
      onSubmit(values);
    },
  });

  // Autosave on change (debounced)
  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        const serializableCurriculum = stripFilesFromCurriculum(formik.values);
        saveCourseDraft(draftId.current, {
          curriculum: serializableCurriculum,
          progress: 24,
          isCurriculumFinal: false,
        });
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [formik.values, loading]);

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
        questions
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
    if (currentQuiz.type === "quiz") {
      const hasValidQuestions = currentQuiz.questions.every(q =>
        q.question &&
        q.options.length >= 2 &&
        q.options.every(opt => opt.trim()) &&
        q.correctOption >= [0]
      );

      if (currentQuiz.quizTitle && currentQuiz.quizDescription && hasValidQuestions) {
        setEditQuiz(null);
        setIsQuizSubmitted({ ...isQuizSubmitted, [`${sectionIdx}-${itemIdx}`]: true });
      } else {
        formik.validateForm();
      }
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
      formik.setFieldValue('sections', newSections);
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

        formik.setFieldValue(`sections[${sourceSectionIndex}].items`, newItems);
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

        formik.setFieldValue(`sections[${sourceSectionIndex}].items`, result[source.droppableId]);
        formik.setFieldValue(`sections[${destSectionIndex}].items`, result[destination.droppableId]);
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
        totalMarks: parseFloat(totalMarksExcel) || 0
      });
    }
  };

  // 1. At the top of the curriculum (above FieldArray):
  const getLectureDuration = (lecture: LectureItem): number => {
    if (lecture.type === 'lecture' && lecture.contentType === 'video' && Array.isArray(lecture.contentFiles)) {
      return lecture.contentFiles.reduce((sum: number, file: VideoContent) => sum + (file.duration || 0), 0);
    }
    return 0;
  };

  const getAssignmentDuration = (item: Assignment | LectureItem | QuizItem): number => {
    if ((item as Assignment).type === 'assignment') {
      return ((item as Assignment).duration || 0) * 60; // convert minutes to seconds
    }
    return 0;
  };

  const getSectionDuration = (section: Section): number => {
    return section.items.reduce((sum: number, item: LectureItem | QuizItem | Assignment) => {
      if (item.type === 'lecture') return sum + getLectureDuration(item as LectureItem);
      if (item.type === 'assignment') return sum + getAssignmentDuration(item as Assignment);
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

  if (loading) {
    return <LoadingIcon />;
  }

  return (
    
    <FormikProvider value={formik}>
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
                    <Droppable droppableId="sections" type="SECTION">
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
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="cursor-grab active:cursor-grabbing flex items-center gap-2 flex-1 hover:bg-gray-100 rounded" {...provided.dragHandleProps}>
                                        <GripVertical size={20} className="text-gray-400" />
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
                                    <FieldArray name={`sections[${sectionIdx}].items`}>
                                      {({ push, remove, replace }) => (
                                        <div className="flex flex-col gap-4">
                                          <Droppable droppableId={`items-${sectionIdx}`} type="ITEM">
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
                                                        <div>
                                                          {/* LECTURE */}
                                                          {item.type === "lecture" && (
                                                            <div className={`${showContentType &&
                                                              showContentType.sectionIdx === sectionIdx &&
                                                              showContentType.itemIdx === itemIdx ? 'flex-col' : 'flex-row'} flex justify-between`}>
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
                                                                  <div className="cursor-grab active:cursor-grabbing flex gap-2 items-center hover:bg-gray-100 rounded" {...provided.dragHandleProps}>
                                                                    <GripVertical size={16} className="text-gray-400" />
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
                                                                <div className="flex flex-col gap-2 mt-2 w-auto px-12">
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
                                                                      <div className="flex items-center gap-4 mb-2">
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

                                                                              const fileObjects = await Promise.all(files.map(async (file) => {
                                                                                const url = URL.createObjectURL(file);
                                                                                // Get video duration
                                                                                const duration = await new Promise<number>((resolve) => {
                                                                                  const video = document.createElement('video');
                                                                                  video.preload = 'metadata';
                                                                                  video.onloadedmetadata = () => {
                                                                                    resolve(video.duration);
                                                                                    video.remove();
                                                                                  };
                                                                                  video.src = url;
                                                                                });
                                                                                return {
                                                                                  file,
                                                                                  url,
                                                                                  name: file.name,
                                                                                  duration
                                                                                };
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
                                                                                      {/* {content.uploadedAt.toLocaleDateString()} */}
                                                                                    </span>
                                                                                  </td>
                                                                                  <td className="p-2">
                                                                                    <div className="flex items-center gap-2">
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
                                                                                  </td>
                                                                                </tr>
                                                                              ))}
                                                                            </tbody>
                                                                          </table>
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
                                                                              fileInput.accept = '.pdf,.doc,.docx,.zip,.rar,.txt';
                                                                              fileInput.multiple = true;

                                                                              fileInput.onchange = (e) => {
                                                                                const files = (e.target as HTMLInputElement).files;
                                                                                if (files) {
                                                                                  const currentResources = item.resources || [];
                                                                                  const newResources = Array.from(files).map(file => ({
                                                                                    name: file.name,
                                                                                    file: file
                                                                                  }));

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
                                                                                  <File size={14} />
                                                                                  <span className="text-sm">{resource.name}</span>
                                                                                </div>
                                                                                <Button
                                                                                  type="button"
                                                                                  size="sm"
                                                                                  variant="outline"
                                                                                  className="px-2 py-1 rounded-none"
                                                                                  onClick={() => {
                                                                                    const newResources = [...item.resources];
                                                                                    newResources.splice(resourceIdx, 1);
                                                                                    formik.setFieldValue(
                                                                                      `sections[${sectionIdx}].items[${itemIdx}].resources`,
                                                                                      newResources
                                                                                    );
                                                                                  }}
                                                                                >
                                                                                  <Trash2 size={14} />
                                                                                </Button>
                                                                              </div>
                                                                            ))}
                                                                          </div>
                                                                        )}
                                                                      </div>
                                                                    </div>
                                                                  )}
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
                                                                  <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => {
                                                                      const sampleData = [
                                                                        ['Quiz Title', 'Quiz Description', 'Question', 'Options', 'Correct Options'],
                                                                        ['Sample Quiz', 'This is a sample quiz description', 'What is 2+2?', '3,4,5,6', '2'],
                                                                        ['', '', 'What colors are in rainbow?', 'Red,Blue,Green,Yellow,Purple,Orange', '1,2,3,4,5,6'],
                                                                        ['', '', 'Which planets are in our solar system?', 'Mercury,Venus,Earth,Mars,Jupiter,Saturn,Uranus,Neptune', '1,2,3,4,5,6,7,8']
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
                                                                            const questions: Question[] = [];
                                                                            let currentQuestion: Partial<Question> = {};
                                                                            rows.forEach((row, index) => {
                                                                              if (row[2]) {
                                                                                if (Object.keys(currentQuestion).length > 0) {
                                                                                  questions.push(currentQuestion as Question);
                                                                                }
                                                                                currentQuestion = {
                                                                                  question: row[2],
                                                                                  options: row[3] ? row[3].split(',') : [],
                                                                                  correctOption: row[4] ? row[4].split(',').map((opt: string) => parseInt(opt) - 1) : [0]
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
                                                                              questions
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
                                                                          <div className="border p-2 mt-1 rounded bg-gray-50">
                                                                            <div className="text-sm text-gray-600 mb-2">Uploaded Documents:</div>
                                                                            {item.contentFiles.map((file, idx) => (
                                                                              <div key={idx} className="flex items-center gap-2 py-1">
                                                                                <File size={16} className="text-blue-500" />
                                                                                <span className="text-sm font-medium">{file.name}</span>
                                                                                <span className="text-xs text-gray-500">
                                                                                  {file.file && typeof file.file.size === 'number'
                                                                                    ? `(${(file.file.size / 1024 / 1024).toFixed(2)} MB)`
                                                                                    : ''}
                                                                                </span>
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
                                                                                  <video src={content.url} controls className="w-full max-w-xs" />
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
                                                                                <iframe
                                                                                  width="420"
                                                                                  height="236"
                                                                                  src={`https://www.youtube.com/embed/${item.contentUrl.includes("youtube.com")
                                                                                    ? item.contentUrl.split("v=")[1]?.split("&")[0]
                                                                                    : item.contentUrl.split("/").pop()}`}
                                                                                  title="YouTube video"
                                                                                  frameBorder="0"
                                                                                  allowFullScreen
                                                                                />
                                                                              </div>
                                                                            )}
                                                                            {item.contentUrl.includes("vimeo.com") && (
                                                                              <div className="mt-2">
                                                                                <iframe
                                                                                  width="420"
                                                                                  height="236"
                                                                                  src={`https://player.vimeo.com/video/${item.contentUrl.split("/").pop()}`}
                                                                                  title="Vimeo video"
                                                                                  frameBorder="0"
                                                                                  allowFullScreen
                                                                                />
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
                                            <div className="flex gap-2 mt-2">
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
                                                  push(getInitialQuiz());
                                                  setAddType(null);
                                                }}
                                              >
                                                + Quiz
                                              </Button>
                                              <Button
                                                type="button"
                                                className="rounded-none"
                                                onClick={() => {
                                                  push(getInitialAssignment());
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
                      onClick={() =>
                        pushSection({
                          name: `Section ${formik.values.sections.length + 1}`,
                          items: [
                            {
                              type: "lecture",
                              lectureName: "Lecture 1",
                              contentType: "",
                              contentFile: null,
                              contentUrl: "",
                              contentText: "",
                              published: false, // Default to unpublished
                              description: "" // Add description field
                            },
                          ],
                          published: false // Default to unpublished
                        })
                      }
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
          <Button className="rounded-none" type="submit">
            Save & Continue
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
                const url = URL.createObjectURL(file);
                // Get video duration
                const duration = await new Promise<number>((resolve) => {
                  const video = document.createElement('video');
                  video.preload = 'metadata';
                  video.onloadedmetadata = () => {
                    resolve(video.duration);
                    video.remove();
                  };
                  video.src = url;
                });

                return {
                  type: 'lecture' as const,
                  lectureName: file.name.replace(/\.[^/.]+$/, ""),
                  contentType: 'video' as const,
                  videoSource: 'upload' as const,
                  contentFiles: [{
                    file,
                    url,
                    name: file.name,
                    duration,
                    status: 'uploaded' as VideoStatus,
                    uploadedAt: new Date()
                  }],
                  contentUrl: '',
                  contentText: '',
                  articleSource: 'upload' as const,
                  resources: [],
                  published: false, // Default to unpublished
                  isPromotional: false, // Default to non-promotional
                };
              })
            );

            // If there's an empty lecture, update it with the first video
            if (emptyLectureIndex !== -1) {
              const updatedItems = [...currentSectionItems];
              updatedItems[emptyLectureIndex] = newLectures[0];

              // Add remaining videos as new lectures
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
          } else if (uploadType === 'document' && isFileList(filesOrExcel)) {
            // Handle document files
            console.log('Processing document files');
            // Create document lectures for each file
            const newLectures = Array.from(filesOrExcel).map((file) => {
              return {
                type: 'lecture' as const,
                lectureName: file.name.replace(/\.[^/.]+$/, ""),
                contentType: 'article' as const,
                videoSource: 'upload' as const,
                contentFiles: [{
                  file,
                  url: URL.createObjectURL(file),
                  name: file.name,
                  status: 'uploaded' as VideoStatus,
                  uploadedAt: new Date()
                }],
                contentUrl: '',
                contentText: '',
                articleSource: 'upload' as const,
                resources: [],
                published: false, // Default to unpublished
                isPromotional: false, // Default to non-promotional
              };
            });

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
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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