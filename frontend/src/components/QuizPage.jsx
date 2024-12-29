import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './QuizPage.css';

const QuizPage = () => {
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false); // State to track quiz start
  const navigate = useNavigate();

  const startQuiz = () => {
    axios.post('http://localhost:5212/api/quiz/start')
      .then(response => {
        setSessionId(response.data);
        setQuizStarted(true); // Mark quiz as started
      })
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
        const score = response.data;
        navigate(`/score/${sessionId}`, { state: { score } });
      })
      .catch(error => console.error('Error submitting answers:', error));
  };

  const handleAnswerChange = (questionId, answerIndex) => {
    setUserAnswers({ ...userAnswers, [questionId]: answerIndex });
  };

  return (
    <div className={`quiz-container ${quizStarted ? 'started' : ''}`}>
      <h1 className="page-title">Quiz Page</h1>

      {/* Display start button if quiz has not started */}
      {!quizStarted ? (
        <div className="start-quiz-container">
          <button className="start-quiz-button" onClick={startQuiz}>Start Quiz</button>
        </div>
      ) : (
        // Display quiz content if quiz has started
        <div className="quiz-page">
          <div className="quiz-list">
            <div>
              {questions.map((question, index) => (
                <div className="question" key={question.id}>
                  <p className="question-text">
                    <span>Question {index + 1}:</span> {question.text}
                  </p>
                  <div className="options">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex}>
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={optionIndex}
                          onChange={() => handleAnswerChange(question.id, optionIndex)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="submit-button" onClick={handleSubmit}>Submit Quiz</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
