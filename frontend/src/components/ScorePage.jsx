import React from 'react';
import { useLocation } from 'react-router-dom';

const ScorePage = () => {
  const location = useLocation(); // Get the state passed by navigate
  const { score } = location.state || {}; // Extract score from the state

  return (
    <div>
      <h1>Your Score: {score !== undefined ? score : 'Loading...'}</h1>
    </div>
  );
};

export default ScorePage;
