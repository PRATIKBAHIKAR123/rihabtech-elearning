import React, { useState, useEffect } from 'react';
import QuizPage from './quizPageQn';

const QuizWrapper: React.FC = () => {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get quiz data from URL parameters (check both search and hash)
    const hash = window.location.hash;
    const search = window.location.search;
    
    let dataParam = null;
    
    // Check hash first (for #/learner/quiz?data=...)
    if (hash.includes('?')) {
      const hashParams = new URLSearchParams(hash.split('?')[1]);
      dataParam = hashParams.get('data');
    }
    
    // If not found in hash, check search params
    if (!dataParam) {
      const urlParams = new URLSearchParams(search);
      dataParam = urlParams.get('data');
    }
    
    console.log('QuizWrapper - Looking for data:', { hash, search, dataParam });
    
    if (dataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataParam));
        console.log('QuizWrapper - Parsed quiz data:', parsedData);
        setQuizData(parsedData);
      } catch (error) {
        console.error('Error parsing quiz data:', error);
      }
    } else {
      console.log('No quiz data found in URL');
    }
    
    setLoading(false);
  }, []);

  return <QuizPage quizData={quizData} loading={loading} />;
};

export default QuizWrapper;
