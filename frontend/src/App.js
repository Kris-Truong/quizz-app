import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import QuestionManagement from './components/QuestionManagement';
import QuizPage from './components/QuizPage';
import ScorePage from './components/ScorePage';

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/manage-questions">Manage Questions</Link>
            </li>
            <li>
              <Link to="/quiz">Take Quiz</Link>
            </li>
            <li>
              <Link to="/score/:sessionId">View Score</Link>
            </li>
          </ul>
        </nav>

        {/* Page Routes */}
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h1>Welcome to the Quiz App</h1>
                <p>Navigate to create questions, take a quiz, or view your scores.</p>
              </div>
            }
          />
          <Route path="/manage-questions" element={<QuestionManagement />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/score/:sessionId" element={<ScorePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
