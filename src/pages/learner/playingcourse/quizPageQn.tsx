import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Flag, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';

const QuizPage = () => {
  // Quiz data
  const [quizData] = useState({
    id: 1,
    title: "Knowledge Check: Research Basics",
    description: "Test your understanding of basic UX research concepts. This quiz covers fundamental principles, methods, and best practices in user experience research.",
    duration: 15, // minutes
    passingScore: 80,
    questions: [
      {
        id: 1,
        question: "What are the primary goals of UX research? (Select all that apply)",
        type: "multiple",
        options: [
          "Understanding user needs and behaviors",
          "Validating design decisions",
          "Increasing conversion rates",
          "Identifying usability issues",
          "Reducing development costs"
        ],
        correctAnswers: [0, 1, 3] // indices of correct answers
      },
      {
        id: 2,
        question: "Which research methods are considered qualitative? (Select all that apply)",
        type: "multiple",
        options: [
          "User interviews",
          "A/B testing",
          "Usability testing",
          "Analytics data analysis",
          "Focus groups",
          "Card sorting"
        ],
        correctAnswers: [0, 2, 4]
      },
      {
        id: 3,
        question: "What should you do before conducting user interviews? (Select all that apply)",
        type: "multiple",
        options: [
          "Prepare a discussion guide",
          "Define research objectives",
          "Set up recording equipment",
          "Schedule participants",
          "All of the above"
        ],
        correctAnswers: [0, 1, 2, 3]
      },
      {
        id: 4,
        question: "Which of these are key principles of good survey design? (Select all that apply)",
        type: "multiple",
        options: [
          "Ask leading questions",
          "Use clear, simple language",
          "Keep questions neutral",
          "Include as many questions as possible",
          "Test the survey before launching"
        ],
        correctAnswers: [1, 2, 4]
      },
      {
        id: 5,
        question: "What are common biases in UX research? (Select all that apply)",
        type: "multiple",
        options: [
          "Confirmation bias",
          "Selection bias",
          "Recency bias",
          "Anchoring bias",
          "Social desirability bias"
        ],
        correctAnswers: [0, 1, 2, 3, 4]
      }
    ]
  });

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({});
  const [timeRemaining, setTimeRemaining] = useState(quizData.duration * 60); // in seconds
  const [quizStarted, setQuizStarted] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());

  // Timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setQuizCompleted(true);
            setShowResults(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, quizCompleted, timeRemaining]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev:any) => {
      const currentAnswers = prev[questionId] || [];
      const newAnswers = currentAnswers.includes(optionIndex)
        ? currentAnswers.filter((idx:number) => idx !== optionIndex)
        : [...currentAnswers, optionIndex];
      
      return {
        ...prev,
        [questionId]: newAnswers
      };
    });
  };

  // Navigate questions
  const goToQuestion = (index:any) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Flag/unflag question
  const toggleFlag = (questionId:any) => {
    setFlaggedQuestions(prev => {
      const newFlags = new Set(prev);
      if (newFlags.has(questionId)) {
        newFlags.delete(questionId);
      } else {
        newFlags.add(questionId);
      }
      return newFlags;
    });
  };

  // Submit quiz
  const submitQuiz = () => {
    setQuizCompleted(true);
    setShowResults(true);
  };

  // Calculate results
  const calculateResults = () => {
    let totalCorrect = 0;
    let totalQuestions = quizData.questions.length;

    quizData.questions.forEach((question:any) => {
      const userAnswers = selectedAnswers[question.id] || [];
      const correctAnswers = question.correctAnswers;
      
      // Check if user answers match correct answers exactly
      if (userAnswers.length === correctAnswers.length &&
          userAnswers.every((answer:any) => correctAnswers.includes(answer))) {
        totalCorrect++;
      }
    });

    const percentage = Math.round((totalCorrect / totalQuestions) * 100);
    const passed = percentage >= quizData.passingScore;

    return { totalCorrect, totalQuestions, percentage, passed };
  };

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{quizData.title}</h1>
            <p className="text-gray-600">{quizData.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-600 font-medium">Duration</p>
              <p className="text-lg font-bold text-blue-800">{quizData.duration} minutes</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-600 font-medium">Questions</p>
              <p className="text-lg font-bold text-green-800">{quizData.questions.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <Flag className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-600 font-medium">Passing Score</p>
              <p className="text-lg font-bold text-purple-800">{quizData.passingScore}%</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">Instructions:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Read each question carefully</li>
                  <li>• Select all answers that apply using checkboxes</li>
                  <li>• You can flag questions for review</li>
                  <li>• Navigate between questions using the sidebar</li>
                  <li>• Submit when you're ready or when time runs out</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => setQuizStarted(true)}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const results = calculateResults();
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              results.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {results.passed ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {results.passed ? 'Congratulations!' : 'Try Again'}
            </h1>
            <p className="text-gray-600">
              {results.passed 
                ? 'You have successfully passed the quiz!' 
                : 'You need to score at least 80% to pass.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 font-medium">Your Score</p>
              <p className={`text-3xl font-bold ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
                {results.percentage}%
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 font-medium">Questions Correct</p>
              <p className="text-3xl font-bold text-gray-800">
                {results.totalCorrect}/{results.totalQuestions}
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => {
                setQuizStarted(false);
                setQuizCompleted(false);
                setShowResults(false);
                setCurrentQuestionIndex(0);
                setSelectedAnswers({});
                setTimeRemaining(quizData.duration * 60);
                setFlaggedQuestions(new Set());
              }}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retake Quiz
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz interface
  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{quizData.title}</h1>
              <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {quizData.questions.length}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-1 rounded-full ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-blue-700'
              }`}>
                <Clock className="w-4 h-4 mr-1" />
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>
              <Button
                onClick={submitQuiz}
                className="rounded-none"
              >
                Submit Quiz
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 pr-4">
                  {currentQuestion.question}
                </h2>
                <button
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`p-2 rounded-full transition-colors ${
                    flaggedQuestions.has(currentQuestion.id)
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedAnswers[currentQuestion.id]?.includes(index) || false}
                      onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                      onCheckedChange={()=>handleAnswerSelect(currentQuestion.id, index)}
                      className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex === quizData.questions.length - 1}
                  className="flex items-center px-4 py-2 text-white bg-primary rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Question Navigation Sidebar */}
          <div className="bg-white rounded-lg shadow-sm p-4 h-fit">
            <h3 className="font-semibold text-gray-800 mb-4">Questions</h3>
            <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
              {quizData.questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => goToQuestion(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors relative ${
                    currentQuestionIndex === index
                      ? 'bg-primary text-white'
                      : selectedAnswers[question.id]?.length > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                  {flaggedQuestions.has(question.id) && (
                    <Flag className="w-3 h-3 absolute -top-1 -right-1 text-yellow-500" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                  <span>Not answered</span>
                </div>
                <div className="flex items-center">
                  <Flag className="w-3 h-3 text-yellow-500 mr-2" />
                  <span>Flagged</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;