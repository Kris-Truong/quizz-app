import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const QuizPage = () => {
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const navigate = useNavigate(); // Initialize the navigate function

  const startQuiz = () => {
    axios.post('http://localhost:5212/api/quiz/start')
      .then(response => setSessionId(response.data))
      .catch(error => console.error('Error starting quiz:', error));
  };

  useEffect(() => {
    if (sessionId) {
      axios.get(`http://localhost:5212/api/quiz/${sessionId}/questions`)
        .then(response => setQuestions(response.data))
        .catch(error => console.error('Error fetching quiz questions:', error));
    }
  }, [sessionId]);

  const handleSubmit = () => {
    axios.post(`http://localhost:5212/api/quiz/${sessionId}/submit`, userAnswers)
      .then(response => {
        const score = response.data; // Get the score from the response
        navigate('/score/:sessionId', { state: { score } }); // Navigate to ScorePage and pass score
      })
      .catch(error => console.error('Error submitting answers:', error));
  };

  const handleAnswerChange = (questionId, answerIndex) => {
    setUserAnswers({ ...userAnswers, [questionId]: answerIndex });
  };

  return (
    <div>
      <h1>Quiz Page</h1>
      {sessionId ? (
        <div>
          {questions.map(question => (
            <div key={question.id}>
              <p>{question.text}</p>
              {question.options.map((option, index) => (
                <label key={index}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={index}
                    onChange={() => handleAnswerChange(question.id, index)}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}
          <button onClick={handleSubmit}>Submit Quiz</button>
        </div>
      ) : (
        <button onClick={startQuiz}>Start Quiz</button>
      )}
    </div>
  );
};

export default QuizPage;
