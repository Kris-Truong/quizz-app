import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuestionManagement = () => {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        text: '',
        options: ['', '', '', ''], // Ensure exactly 4 options
        correctAnswerIndex: 0,
    });
    const [editingQuestionId, setEditingQuestionId] = useState(null);

    // Fetch existing questions from the backend
    useEffect(() => {
        axios
            .get('http://localhost:5212/api/quiz/questions')
            .then((response) => {
                setQuestions(response.data);
            })
            .catch((error) => {
                console.error('Error fetching questions:', error.message);
            });
    }, []);

    // Handle creating a new question
    const createQuestion = () => {
        if (newQuestion.options.some((option) => option.trim() === '')) {
            alert('All options must be filled!');
            return;
        }

        axios
            .post('http://localhost:5212/api/quiz/questions', newQuestion)
            .then((response) => {
                alert('Question created successfully!');
                setQuestions([...questions, response.data]); // Add new question to the list
                setNewQuestion({ text: '', options: ['', '', '', ''], correctAnswerIndex: 0 }); // Reset form
            })
            .catch((error) => console.error('Error creating question:', error));
    };

    // Handle updating an existing question
    const updateQuestion = (id, updatedQuestion) => {
        if (updatedQuestion.options.some((option) => option.trim() === '')) {
            alert('All options must be filled!');
            return;
        }

        axios
            .put(`http://localhost:5212/api/quiz/questions/${id}`, updatedQuestion)
            .then(() => {
                alert('Question updated successfully!');
                setQuestions((prevQuestions) =>
                    prevQuestions.map((q) =>
                        q.id === id ? updatedQuestion : q
                    )
                );
                setEditingQuestionId(null); // Exit editing mode
            })
            .catch((error) => {
                console.error('Error updating question:', error);
                alert('Failed to update the question. Please try again.');
            });
    };

    // Handle deleting a question
    const deleteQuestion = (id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            axios
                .delete(`http://localhost:5212/api/quiz/questions/${id}`)
                .then(() => {
                    alert('Question deleted successfully!');
                    setQuestions((prevQuestions) =>
                        prevQuestions.filter((q) => q.id !== id)
                    );
                })
                .catch((error) => {
                    console.error('Error deleting question:', error);
                    alert('Failed to delete the question. Please try again.');
                });
        }
    };

    // Handle canceling editing
    const cancelEdit = () => {
        setEditingQuestionId(null);
    };

    return (
        <div>
            <h1>Question Management</h1>

            {/* Create New Question Section */}
            <div>
                <h3>Create New Question</h3>
                <input
                    type="text"
                    placeholder="Question Text"
                    value={newQuestion.text}
                    onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                />
                <h4>Options</h4>
                {newQuestion.options.map((option, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) =>
                                setNewQuestion((prev) => {
                                    const updatedOptions = [...prev.options];
                                    updatedOptions[index] = e.target.value;
                                    return { ...prev, options: updatedOptions };
                                })
                            }
                        />
                    </div>
                ))}
                <div>
                    <label>Correct Answer Index: </label>
                    <input
                        type="number"
                        min="0"
                        max="3"
                        value={newQuestion.correctAnswerIndex}
                        onChange={(e) =>
                            setNewQuestion({ ...newQuestion, correctAnswerIndex: parseInt(e.target.value) || 0 })
                        }
                    />
                </div>
                <button onClick={createQuestion}>Create Question</button>
            </div>

            {/* Display Existing Questions */}
            <h3>Existing Questions</h3>
            <ul>
                {questions?.length > 0 ? (
                    questions.map((q) => (
                        <li key={q.id}>
                            {editingQuestionId === q.id ? (
                                // In-Place Editing Form
                                <div>
                                    <input
                                        type="text"
                                        value={q.text}
                                        onChange={(e) =>
                                            setQuestions((prev) =>
                                                prev.map((question) =>
                                                    question.id === q.id
                                                        ? { ...question, text: e.target.value }
                                                        : question
                                                )
                                            )
                                        }
                                    />
                                    {q.options.map((option, index) => (
                                        <div key={index}>
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) =>
                                                    setQuestions((prev) =>
                                                        prev.map((question) =>
                                                            question.id === q.id
                                                                ? {
                                                                    ...question,
                                                                    options: question.options.map((opt, idx) =>
                                                                        idx === index ? e.target.value : opt
                                                                    ),
                                                                }
                                                                : question
                                                        )
                                                    )
                                                }
                                            />
                                        </div>
                                    ))}
                                    <button onClick={() => updateQuestion(q.id, q)}>Save</button>
                                    <button onClick={cancelEdit}>Cancel</button>
                                </div>
                            ) : (
                                // Display Question
                                <div>
                                    <strong>{q.text}</strong>
                                    <ul>
                                        {q.options.map((option, idx) => (
                                            <li key={idx}>{`${idx + 1}. ${option}`}</li>
                                        ))}
                                    </ul>
                                    <p>Correct Answer: {q.options[q.correctAnswerIndex]}</p>
                                    <button onClick={() => setEditingQuestionId(q.id)}>Edit</button>
                                    <button onClick={() => deleteQuestion(q.id)}>Delete</button>
                                </div>
                            )}
                        </li>
                    ))
                ) : (
                    <p>No questions available</p>
                )}
            </ul>
        </div>
    );
};

export default QuestionManagement;
