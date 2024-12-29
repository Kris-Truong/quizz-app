import React from 'react';
import { useLocation } from 'react-router-dom';
import './ScorePage.css';

const ScorePage = () => {
  const location = useLocation(); // Get the state passed by navigate
  const { score } = location.state || {}; // Extract score from the state

  return (
    <div className="page-content">
      <h1 className="title">
        Your Score: {score === undefined || score === null ? 'Null' : score}
      </h1>
      {(score === undefined || score === null) && (
        <p>Please take the quiz to determine your score</p>
      )}
    </div>
  );
}

export default ScorePage;
