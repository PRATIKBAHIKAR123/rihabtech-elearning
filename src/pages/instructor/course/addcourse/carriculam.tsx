import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Pencil, Trash2, UploadCloud, Eye, ChevronDown, ChevronUp, File, ExternalLink, GripVertical } from "lucide-react";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { MenuBar } from "../../../../components/ui/tiptapmenubar";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { AssignmentEditor } from "../../../../components/ui/assignmentEditorComponent";
import { on } from "events";
import { Textarea } from "../../../../components/ui/textarea";
import { Checkbox } from "../../../../components/ui/checkbox";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';


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
}

export interface Section {
  name: string;
  items: (LectureItem | QuizItem | Assignment)[];
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
  contentUrl: ""
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


export function CourseCarriculam({ onSubmit }: any) {
  const [showContentType, setShowContentType] = useState<ViewItemState | null>(null);
  const [editLecture, setEditLecture] = useState<ViewItemState | null>(null);
  const [addType, setAddType] = useState<AddTypeState | null>(null);
  const [viewItem, setViewItem] = useState<ViewItemState | null>(null);
  const [editQuiz, setEditQuiz] = useState<ViewItemState | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<{ [key: string]: boolean }>({});
  const [isAssignmentSubmitted, setIsAssignmentSubmitted] = useState<{ [key: string]: boolean }>({});
  const [editAssignment, setEditAssignment] = useState<ViewItemState | null>(null);

  const initialValues: CurriculumFormValues = {
    sections: [
      {
        name: "Introduction",
        items: [getInitialLecture(1)],
      },
    ],
  };


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
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      console.log("Curriculum values:", values);
      onSubmit(values);
    },
  });

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

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
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
                                  className={`mb-8 border rounded p-4 bg-white ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                    }`}
                                >
                                  <div >

                                    <div className="flex items-center gap-2 mb-2">
                                      {/* <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                            >
                              <GripVertical size={20} className="text-gray-400" />
                            </div> */}
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
                                          onClick={() => {
                                            const fileInput = document.createElement('input');
                                            fileInput.type = 'file';
                                            fileInput.accept = 'video/*';
                                            fileInput.multiple = true;
                                            
                                            fileInput.onchange = async (e) => {
                                              const files = (e.target as HTMLInputElement).files;
                                              if (!files || files.length === 0) return;

                                              // Get current section items from formik
                                              const currentSectionItems = formik.values.sections[sectionIdx]?.items || [];

                                              // Check for empty lecture
                                              const emptyLectureIndex = currentSectionItems.findIndex(item => 
                                                item.type === 'lecture' && 
                                                item.contentType === '' && 
                                                (!item.contentFiles || item.contentFiles.length === 0)
                                              );

                                              // Create video lectures for each file
                                              const newLectures = await Promise.all(
                                                Array.from(files).map(async (file) => {
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
                                                    resources: []
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
                                            };

                                            fileInput.click();
                                          }}
                                        >
                                          <UploadCloud size={18} />
                                        </Button>
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
                                                {section.items.map((item, itemIdx) => (
                                                  <Draggable
                                          key={`item-${sectionIdx}-${itemIdx}`}
                                          draggableId={`item-${sectionIdx}-${itemIdx}`}
                                          index={itemIdx}
                                        >
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`border rounded p-3 mb-2 bg-gray-50 ${
                                                snapshot.isDragging ? 'shadow-lg bg-white' : ''
                                              }`}
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
                                                            <div   className="cursor-grab active:cursor-grabbing flex gap-2 items-center hover:bg-gray-100 rounded" {...provided.dragHandleProps}>
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


                                                        </div>
                                                        {/* Content Type and Upload */}
                                                        {showContentType &&
                                                          showContentType.sectionIdx === sectionIdx &&
                                                          showContentType.itemIdx === itemIdx ? (
                                                          <div className="flex flex-col gap-2 mt-2 w-auto px-12">
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
                                                                              <span className="text-sm">{content.file.type}</span>
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
                                                              Add Content
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
                                                    {item.type === "quiz" && (
                                                      <div className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between gap-2 mb-2">
                                                          <div className="flex items-center gap-2">
                                                            <span className="font-semibold">
                                                              {item.quizTitle || "New Quiz"}
                                                            </span>
                                                            <Button
                                                              type="button"
                                                              variant="outline"
                                                              className="px-2 py-1 rounded-none"
                                                              onClick={() => remove(itemIdx)}
                                                              title="Delete"
                                                            >
                                                              <Trash2 size={16} className="text-red-500" />
                                                            </Button>
                                                            {isQuizSubmitted[`${sectionIdx}-${itemIdx}`] && (
                                                              <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="px-2 py-1 rounded-none"
                                                                onClick={() => setEditQuiz({ sectionIdx, itemIdx })}
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
                                                              <Input
                                                                className="ins-control-border mb-2"
                                                                placeholder="Quiz Title"
                                                                name={`sections[${sectionIdx}].items[${itemIdx}].quizTitle`}
                                                                value={item.quizTitle}
                                                                onChange={formik.handleChange}
                                                              />
                                                              <Input
                                                                className="ins-control-border mb-2"
                                                                placeholder="Quiz Description"
                                                                name={`sections[${sectionIdx}].items[${itemIdx}].quizDescription`}
                                                                value={item.quizDescription}
                                                                onChange={formik.handleChange}
                                                              />

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
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="px-2 py-1 rounded-none"
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

                                                                          <div className="ml-4">
                                                                            {question.options.map((option, optIdx) => (
                                                                              <div key={optIdx} className="flex items-center gap-2 mb-2">
                                                                                {/* <input
                                                              type="checkbox"
                                                              //checked={question.correctOption.push(optIdx)}
                                                              onChange={() => {
                                                                formik.setFieldValue(
                                                                  `sections[${sectionIdx}].items[${itemIdx}].questions.${qIdx}.correctOption`,
                                                                  optIdx
                                                                );
                                                              }}
                                                              className="bg-primary text-primary focus:ring-0 h-4 w-4"
                                                            /> */}
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
                                                                                      `sections[${sectionIdx}].items[${itemIdx}].questions.${qIdx}.correctOption`,
                                                                                      updatedOptions
                                                                                    );
                                                                                  }}
                                                                                />
                                                                                <Input
                                                                                  className="ins-control-border flex-1"
                                                                                  placeholder={`Option ${optIdx + 1}`}
                                                                                  name={`sections[${sectionIdx}].items[${itemIdx}].questions.${qIdx}.options.${optIdx}`}
                                                                                  value={option}
                                                                                  onChange={formik.handleChange}
                                                                                />
                                                                                {question.options.length > 2 && (
                                                                                  <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    className="px-2 py-1 rounded-none"
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                      const newOptions = [...question.options];
                                                                                      newOptions.splice(optIdx, 1);
                                                                                      formik.setFieldValue(
                                                                                        `sections[${sectionIdx}].items[${itemIdx}].questions.${qIdx}.options`,
                                                                                        newOptions
                                                                                      );
                                                                                    }}
                                                                                  >
                                                                                    <Trash2 size={14} />
                                                                                  </Button>
                                                                                )}
                                                                              </div>
                                                                            ))}
                                                                            <Button
                                                                              type="button"
                                                                              size="sm"
                                                                              variant="outline"
                                                                              onClick={() => {
                                                                                const newOptions = [...question.options, ""];
                                                                                formik.setFieldValue(
                                                                                  `sections[${sectionIdx}].items[${itemIdx}].questions.${qIdx}.options`,
                                                                                  newOptions
                                                                                );
                                                                              }}
                                                                            >
                                                                              Add Option
                                                                            </Button>
                                                                          </div>
                                                                        </div>
                                                                      ))}
                                                                      <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        className="rounded-none"
                                                                        onClick={() =>
                                                                          pushQuestion({
                                                                            question: "",
                                                                            options: ["", ""],
                                                                            correctOption: 0,
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
                                                                  Save Quiz
                                                                </Button>
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
                                                                            q.correctOption.includes(optIdx) ? "text-green-600 font-medium" : ""
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
                                                              className="px-2 py-1 rounded-none"
                                                              onClick={() => remove(itemIdx)}
                                                              title="Delete"
                                                            >
                                                              <Trash2 size={16} className="text-red-500" />
                                                            </Button>
                                                            {isAssignmentSubmitted[`${sectionIdx}-${itemIdx}`] && (
                                                              <Button
                                                                type="button"
                                                                variant="ghost"
                                                                className="px-2 py-1 rounded-none"
                                                                onClick={() => setEditAssignment({ sectionIdx, itemIdx })}
                                                              >
                                                                <Pencil size={16} />
                                                              </Button>
                                                            )}
                                                          </div>
                                                          {isAssignmentSubmitted[`${sectionIdx}-${itemIdx}`] && (
                                                            <Button
                                                              type="button"
                                                              variant="ghost"
                                                              className="p-1"
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
                                                                            ({(file.file.size / 1024 / 1024).toFixed(2)} MB)
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
                                                                              <span className="text-sm text-gray-500">
                                                                                {formatDuration(content.duration || 0)}
                                                                              </span>
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
                                                    contentFile: null,
                                                    contentUrl: "",
                                                    contentText: "",
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
                            },
                          ],
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
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  return (
    <>
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="min-h-[200px] p-4"
      />
    </>
  );
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};