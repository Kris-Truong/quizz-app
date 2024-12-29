import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import QuestionManagement from './components/QuestionManagement';
import QuizPage from './components/QuizPage';
import ScorePage from './components/ScorePage';
import './App.css';

const App = () => {
  return (
    <Router>
  <div>
    {/* Navbar */}
    <nav className="navbar">
      <div className="logo">
        <img src="/images/logo2.png" alt="Logo" />
      </div>
      <ul className="menu">
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

    {/* Page Content */}
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <div className="page-content">
              <h1 className="welcome-title">Welcome to the Quiz App</h1>
              <p className="welcome-message">Navigate to create questions, take a quiz, or view your scores.</p>
            </div>
          }
        />
        <Route path="/manage-questions" element={<QuestionManagement />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/score/:sessionId" element={<ScorePage />} />
      </Routes>
    </div>
  </div>
</Router>
  
)}

export default App;
