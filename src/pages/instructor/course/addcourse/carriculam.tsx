import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Pencil, Trash2, UploadCloud, Eye, ChevronDown, ChevronUp , File } from "lucide-react";
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

function useArticleEditor(
  sectionIdx: number,
  itemIdx: number,
  initialContent: string,
  onUpdate: (html: string) => void
) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate(html);
    },
  });

  return editor;
}

export interface Question {
  question: string;
  options: string[];
  correctOption: number;
}

export interface QuizItem {
  type: 'quiz';
  quizTitle: string;
  quizDescription: string;
  questions: Question[];
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
  contentFile: File | null;
  contentUrl: string;
  contentText: string;
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
      correctOption: 0,
    },
  ],
});

const getInitialLecture = (index: number): LectureItem => ({
  type: "lecture",
  lectureName: `Lecture ${index}`,
  contentType: "",
  contentFile: null,
  contentUrl: "",
  contentText: "",
  resources: [],
});

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
                  contentType: Yup.string().required("Content type is required"),
                  contentFile: Yup.mixed().when("contentType", {
                    is: (val: string) => val === "video",
                    then: (schema) => schema.required("Video file is required"),
                    otherwise: (schema) => schema.notRequired(),
                  }),
                  contentText: Yup.string().when("contentType", {
                    is: (val: string) => val === "article",
                    then: (schema) => schema.required("Article content is required"),
                    otherwise: (schema) => schema.notRequired(),
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
      q.correctOption >= 0
    );

    if (currentQuiz.quizTitle && currentQuiz.quizDescription && hasValidQuestions) {
      setEditQuiz(null);
      setIsQuizSubmitted({ ...isQuizSubmitted, [`${sectionIdx}-${itemIdx}`]: true });
    } else {
      formik.validateForm();
    }
  }
};

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <div>
          <div className="mb-3">
            <div className="border-[#cfcfcf] border rounded-md flex items-center justify-between gap-2 p-4 mb-2">
              <div className="py-1 px-3 bg-primary text-white">New</div>
              <span className="text-[#393939] text-md font-semibold font-['Raleway']">
                Check out the latest creation flow improvements, new question types, and AI-assisted features in practice tests.
              </span>
            </div>
            <h3 className="course-sectional-question mb-2">What will students learn in your course?</h3>
            <p className="course-sectional-descrption mb-4">
              The following descriptions will be publicly visible on your Course Landing Page and will have a direct impact on your course performance. These descriptions will help learners decide if your course is right for them.
            </p>
            <FieldArray name="sections">
              {({ push: pushSection, remove: removeSection }) => (
                <div className="mt-8 gap-4 flex flex-col">
                  {formik.values.sections.map((section, sectionIdx) => (
                    <div key={sectionIdx} className="mb-8 border rounded p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <label className="ins-label mr-2">
                          Section {sectionIdx + 1}:
                        </label>
                        <Input
                          className="ins-control-border w-auto"
                          style={{ maxWidth: 250 }}
                          name={`sections[${sectionIdx}].name`}
                          value={section.name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        {formik.values.sections.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="p-1"
                            onClick={() => removeSection(sectionIdx)}
                            title="Delete Section"
                          >
                            <Trash2 size={18} className="text-red-500" />
                          </Button>
                        )}
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
                            {section.items.map((item, itemIdx) => (
                              <div key={itemIdx} className="relative border rounded p-3 mb-2 bg-gray-50">
                                {/* LECTURE */}
                                {item.type === "lecture" && (
                                  <>
                                    <div className="flex items-center gap-2 mb-2">
                                      {editLecture && editLecture.sectionIdx === sectionIdx && editLecture.itemIdx === itemIdx ? (
                                        <>
                                          <Input
                                            className="ins-control-border w-auto"
                                            style={{ maxWidth: 300 }}
                                            name={`sections[${sectionIdx}].items[${itemIdx}].lectureName`}
                                            value={item.lectureName}
                                            onChange={formik.handleChange}
                                            onBlur={() => setEditLecture(null)}
                                            autoFocus
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            className="p-1"
                                            onClick={() => setEditLecture(null)}
                                            title="Done"
                                          >
                                            ✓
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <span className="font-semibold">{item.lectureName}</span>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            className="p-1"
                                            onClick={() => setEditLecture({ sectionIdx, itemIdx })}
                                            title="Edit Lecture Name"
                                          >
                                            <Pencil size={16} />
                                          </Button>
                                        </>
                                      )}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="p-1"
                                        onClick={() => remove(itemIdx)}
                                        title="Delete"
                                      >
                                        <Trash2 size={16} className="text-red-500" />
                                      </Button>
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
                                    </div>
                                    {/* Content Type and Upload */}
                                    {showContentType &&
                                      showContentType.sectionIdx === sectionIdx &&
                                      showContentType.itemIdx === itemIdx ? (
                                      <div className="flex flex-col gap-2 mt-2">
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
                                        {/* Video: Upload & Info */}
{item.contentType === "video" && (
  <div className="flex flex-col gap-2">
    {!item.contentFile ? (
      <Input
        className="ins-control-border"
        type="file"
        accept="video/*"
        onChange={e => {
          const file = e.target.files?.[0] || null;
          formik.setFieldValue(
            `sections[${sectionIdx}].items[${itemIdx}].contentFile`,
            file
          );
          if (file) {
            formik.setFieldValue(
              `sections[${sectionIdx}].items[${itemIdx}].contentUrl`,
              URL.createObjectURL(file)
            );
          }
        }}
      />
    ) : (
      <>
        <div className="flex items-center gap-2">
          <UploadCloud size={14} />
          <span className="text-green-600 text-xs">{item.contentFile.name}</span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="p-1"
            onClick={() => {
              formik.setFieldValue(
                `sections[${sectionIdx}].items[${itemIdx}].contentFile`,
                null
              );
              formik.setFieldValue(
                `sections[${sectionIdx}].items[${itemIdx}].contentUrl`,
                ""
              );
              // Clear resources when video is removed
              formik.setFieldValue(
                `sections[${sectionIdx}].items[${itemIdx}].resources`,
                []
              );
            }}
          >
            Remove
          </Button>
        </div>

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
                    const item = formik.values.sections[sectionIdx].items[itemIdx];
                    if (item.type === "lecture") {
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
                  }
                };
                
                fileInput.click();
              }}
            >
              + Add Resources
            </Button>
          </div>

          {/* Display Resources */}
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
                    variant="ghost"
                    className="p-1"
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
      </>
    )}
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
                                      <Button
                                        className="absolute top-1/2 -translate-y-1/2 right-1 h-[10] rounded-none text-sm"
                                        type="button"
                                        onClick={() => setShowContentType({ sectionIdx, itemIdx })}
                                      >
                                        Add Content
                                      </Button>
                                    )}
                                  </>
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
          variant="ghost"
          className="p-1"
          onClick={() => remove(itemIdx)}
          title="Delete"
        >
          <Trash2 size={16} className="text-red-500" />
        </Button>
        {isQuizSubmitted[`${sectionIdx}-${itemIdx}`] && (
          <Button
            type="button"
            variant="ghost"
            className="p-1"
            onClick={() => setEditQuiz({ sectionIdx, itemIdx })}
          >
            <Pencil size={16} />
          </Button>
        )}
      </div>
      {isQuizSubmitted[`${sectionIdx}-${itemIdx}`] && (
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

                    <div className="ml-4">
                      {question.options.map((option, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            checked={question.correctOption === optIdx}
                            onChange={() => {
                              formik.setFieldValue(
                                `sections[${sectionIdx}].items[${itemIdx}].questions.${qIdx}.correctOption`,
                                optIdx
                              );
                            }}
                            className="bg-primary text-primary focus:ring-0 h-4 w-4"
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
                              variant="ghost"
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
              variant="outline"
              onClick={() => setEditQuiz(null)}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
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
                      q.correctOption === optIdx ? "text-green-600 font-medium" : ""
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
          variant="ghost"
          className="p-1"
          onClick={() => remove(itemIdx)}
          title="Delete"
        >
          <Trash2 size={16} className="text-red-500" />
        </Button>
        {isAssignmentSubmitted[`${sectionIdx}-${itemIdx}`] && (
          <Button
            type="button"
            variant="ghost"
            className="p-1"
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
        <Input
          className="ins-control-border mb-2"
          placeholder="Assignment Title"
          name={`sections[${sectionIdx}].items[${itemIdx}].title`}
          value={item.title}
          onChange={formik.handleChange}
        />
        <Input
          className="ins-control-border mb-2"
          placeholder="Assignment Description"
          name={`sections[${sectionIdx}].items[${itemIdx}].description`}
          value={item.description}
          onChange={formik.handleChange}
        />
        <Input
          className="ins-control-border mb-4"
          type="number"
          placeholder="Duration (minutes)"
          name={`sections[${sectionIdx}].items[${itemIdx}].duration`}
          value={item.duration}
          onChange={formik.handleChange}
          min={1}
        />

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
              <textarea
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
                                {viewItem && item.type != "quiz" &&
                                  viewItem.sectionIdx === sectionIdx &&
                                  viewItem.itemIdx === itemIdx && (
                                    <div className="border mt-3 p-3 rounded bg-white">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold">Submitted Content</span>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          className="p-1"
                                          onClick={() => setViewItem(null)}
                                        >
                                          Close
                                        </Button>
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
    <div 
      className="prose max-w-none border p-2 mt-1 rounded bg-gray-50"
      dangerouslySetInnerHTML={{ __html: item.contentText }}
    />
                                            </div>
                                          )}
                                          {/* In your view content section, update the video part */}
{item.contentType === "video" && item.contentUrl && (
  <div className="mt-2">
    <b>Video:</b>
    <video src={item.contentUrl} controls className="w-full max-w-xs mt-1" />
    
    {item.resources?.length > 0 && (
      <div className="mt-3">
        <b>Resources:</b>
        <div className="border rounded p-2 mt-1 bg-gray-50">
          {item.resources.map((resource, idx) => (
            <div key={idx} className="flex items-center gap-2 py-1">
              <File size={14} />
              <span>{resource.name}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}
                                        </>
                                      )}
                                      {/* {item.type === "quiz" && (
                                        <>
                                          <div>
                                            <b>Quiz Title:</b> {item.quizTitle}
                                          </div>
                                          <div>
                                            <b>Description:</b> {item.quizDescription}
                                          </div>
                                          <div className="mt-2">
                                            <b>Questions:</b>
                                            <ol className="list-decimal ml-5">
                                              {"questions" in item && Array.isArray(item.questions) && item.questions.map((q: any, qIdx: number) => (
                                                <li key={qIdx} className="mb-2">
                                                  <div>
                                                    <b>Q:</b> {q.question}
                                                  </div>
                                                  <ul className="list-disc ml-5">
                                                    {q.options.map((opt: string, optIdx: number) => (
                                                      <li key={optIdx}>
                                                        {opt}{" "}
                                                        {q.correctOption === optIdx && (
                                                          <span className="text-green-600 font-semibold">(Correct)</span>
                                                        )}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </li>
                                              ))}
                                            </ol>
                                          </div>
                                        </>
                                      )} */}
                                    </div>
                                  )}
                              </div>
                            ))}
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
                  ))}
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