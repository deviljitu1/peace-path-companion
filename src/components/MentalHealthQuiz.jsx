import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './MentalHealthQuiz.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MentalHealthQuiz = ({ onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedTest, setSelectedTest] = useState('phq9');
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [quizHistory, setQuizHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Load quiz history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('mentalHealthQuizHistory');
    if (savedHistory) {
      setQuizHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save quiz history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mentalHealthQuizHistory', JSON.stringify(quizHistory));
  }, [quizHistory]);

  // Different mental health assessments
  const mentalHealthTests = {
    phq9: {
      name: "PHQ-9 Depression Test",
      description: "Measures depression severity",
      icon: "😔",
      questions: [
        "Little interest or pleasure in doing things?",
        "Feeling down, depressed, or hopeless?",
        "Trouble falling or staying asleep, or sleeping too much?",
        "Feeling tired or having little energy?",
        "Poor appetite or overeating?",
        "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
        "Trouble concentrating on things, such as reading the newspaper or watching television?",
        "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?",
        "Thoughts that you would be better off dead, or of hurting yourself in some way?"
      ],
      options: [
        "Not at all",
        "Several days", 
        "More than half the days",
        "Nearly every day"
      ],
      scoring: [0, 1, 2, 3],
      interpretation: [
        { min: 0, max: 4, level: "None", description: "No significant depression", color: "#4CAF50" },
        { min: 5, max: 9, level: "Mild", description: "Mild depression symptoms", color: "#8BC34A" },
        { min: 10, max: 14, level: "Moderate", description: "Moderate depression symptoms", color: "#FFC107" },
        { min: 15, max: 19, level: "Moderately Severe", description: "Moderately severe depression symptoms", color: "#FF9800" },
        { min: 20, max: 27, level: "Severe", description: "Severe depression symptoms", color: "#F44336" }
      ],
      recommendations: {
        "None": [
          "Maintain your healthy habits",
          "Continue regular check-ins with yourself",
          "Practice gratitude and mindfulness"
        ],
        "Mild": [
          "Increase physical activity",
          "Improve sleep hygiene",
          "Practice stress management techniques",
          "Consider talking to a counselor if symptoms persist"
        ],
        "Moderate": [
          "Consult with a mental health professional",
          "Consider therapy options (CBT, talk therapy)",
          "Practice regular self-care activities",
          "Establish a support network"
        ],
        "Moderately Severe": [
          "Seek professional help as soon as possible",
          "Discuss treatment options with a healthcare provider",
          "Reach out to trusted friends or family members",
          "Consider medication options if recommended by a doctor"
        ],
        "Severe": [
          "Seek immediate professional help",
          "Contact a mental health crisis line if needed",
          "Discuss comprehensive treatment options",
          "Ensure you have a support system in place"
        ]
      }
    },
    gad7: {
      name: "GAD-7 Anxiety Test",
      description: "Measures anxiety severity",
      icon: "😰",
      questions: [
        "Feeling nervous, anxious, or on edge?",
        "Not being able to stop or control worrying?",
        "Worrying too much about different things?",
        "Trouble relaxing?",
        "Being so restless that it is hard to sit still?",
        "Becoming easily annoyed or irritable?",
        "Feeling afraid as if something awful might happen?"
      ],
      options: [
        "Not at all",
        "Several days", 
        "More than half the days",
        "Nearly every day"
      ],
      scoring: [0, 1, 2, 3],
      interpretation: [
        { min: 0, max: 4, level: "None", description: "No significant anxiety", color: "#4CAF50" },
        { min: 5, max: 9, level: "Mild", description: "Mild anxiety symptoms", color: "#8BC34A" },
        { min: 10, max: 14, level: "Moderate", description: "Moderate anxiety symptoms", color: "#FFC107" },
        { min: 15, max: 21, level: "Severe", description: "Severe anxiety symptoms", color: "#F44336" }
      ],
      recommendations: {
        "None": [
          "Continue practicing stress management",
          "Maintain healthy routines",
          "Practice mindfulness meditation"
        ],
        "Mild": [
          "Practice deep breathing exercises",
          "Limit caffeine intake",
          "Try progressive muscle relaxation",
          "Consider talking to a counselor if symptoms persist"
        ],
        "Moderate": [
          "Consult with a mental health professional",
          "Practice regular relaxation techniques",
          "Consider cognitive behavioral therapy",
          "Establish a worry time to contain anxious thoughts"
        ],
        "Severe": [
          "Seek professional help as soon as possible",
          "Discuss treatment options with a healthcare provider",
          "Practice grounding techniques during anxiety attacks",
          "Consider medication options if recommended by a doctor"
        ]
      }
    },
    burnout: {
      name: "Burnout Assessment",
      description: "Measures emotional exhaustion and burnout",
      icon: "😫",
      questions: [
        "Feeling exhausted or drained?",
        "Feeling disconnected from your work or activities?",
        "Finding it hard to get started on tasks?",
        "Feeling less accomplished than usual?",
        "Becoming more cynical or critical in your outlook?",
        "Feeling less patient with people than usual?",
        "Difficulty concentrating on tasks?",
        "Physical symptoms like headaches or stomachaches?"
      ],
      options: [
        "Never",
        "Rarely", 
        "Sometimes",
        "Often",
        "Always"
      ],
      scoring: [0, 1, 2, 3, 4],
      interpretation: [
        { min: 0, max: 10, level: "Low", description: "Low risk of burnout", color: "#4CAF50" },
        { min: 11, max: 20, level: "Moderate", description: "Moderate risk of burnout", color: "#FFC107" },
        { min: 21, max: 32, level: "High", description: "High risk of burnout", color: "#F44336" }
      ],
      recommendations: {
        "Low": [
          "Continue with your current self-care practices",
          "Maintain work-life balance",
          "Set healthy boundaries"
        ],
        "Moderate": [
          "Prioritize rest and recovery",
          "Practice stress management techniques",
          "Consider delegating tasks when possible",
          "Take regular breaks during work"
        ],
        "High": [
          "Seek professional guidance",
          "Consider taking time off if possible",
          "Reevaluate priorities and commitments",
          "Establish firm boundaries",
          "Practice regular self-care activities"
        ]
      }
    },
    wellbeing: {
      name: "Well-Being Check",
      description: "Measures overall mental well-being",
      icon: "😊",
      questions: [
        "How often do you feel happy or content?",
        "How satisfied are you with your life overall?",
        "How often do you feel a sense of purpose or meaning?",
        "How connected do you feel to others?",
        "How well are you able to handle daily stresses?",
        "How often do you engage in activities you enjoy?",
        "How well are you taking care of your physical health?"
      ],
      options: [
        "Rarely/Never",
        "Sometimes", 
        "Often",
        "Almost Always"
      ],
      scoring: [0, 1, 2, 3],
      interpretation: [
        { min: 0, max: 7, level: "Low", description: "Low sense of well-being", color: "#F44336" },
        { min: 8, max: 14, level: "Moderate", description: "Moderate sense of well-being", color: "#FFC107" },
        { min: 15, max: 21, level: "High", description: "High sense of well-being", color: "#4CAF50" }
      ],
      recommendations: {
        "Low": [
          "Focus on small daily pleasures",
          "Connect with supportive people",
          "Practice gratitude journaling",
          "Engage in physical activity regularly"
        ],
        "Moderate": [
          "Continue practices that bring you joy",
          "Set aside time for self-reflection",
          "Explore new hobbies or interests",
          "Practice mindfulness meditation"
        ],
        "High": [
          "Maintain your healthy routines",
          "Share your positive practices with others",
          "Set new personal growth goals",
          "Continue nurturing your relationships"
        ]
      }
    }
  };

  const currentTest = mentalHealthTests[selectedTest];
  const questions = currentTest.questions;
  const options = currentTest.options;

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (answers[currentQuestion] !== undefined) {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Calculate total score
        const totalScore = answers.reduce((sum, answer, index) => {
          return sum + currentTest.scoring[answer];
        }, 0);
        
        setScore(totalScore);
        setShowResults(true);
        
        // Save to history
        const newHistoryEntry = {
          test: currentTest.name,
          testKey: selectedTest,
          date: new Date().toLocaleDateString(),
          fullDate: new Date(),
          score: totalScore,
          level: getInterpretation(totalScore).level,
          maxScore: Math.max(...currentTest.interpretation.map(i => i.max))
        };
        
        setQuizHistory(prevHistory => [newHistoryEntry, ...prevHistory.slice(0, 9)]);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleTestChange = (testKey) => {
    setSelectedTest(testKey);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setShowHistory(false);
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const getInterpretation = (scoreValue = score) => {
    const result = currentTest.interpretation.find(
      range => scoreValue >= range.min && scoreValue <= range.max
    );
    return result || currentTest.interpretation[0];
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setShowHistory(false);
  };

  const handleDone = () => {
    // Call the onComplete callback with results
    if (onComplete) {
      onComplete(score, answers);
    }
    // Close the quiz
    if (onClose) {
      onClose();
    }
  };

  const getMoodChartData = () => {
    // Filter history for the current test type
    const testHistory = quizHistory.filter(item => item.testKey === selectedTest);
    
    if (testHistory.length === 0) return null;
    
    // Sort by date
    const sortedHistory = [...testHistory].sort((a, b) => 
      new Date(a.fullDate) - new Date(b.fullDate)
    );
    
    const labels = sortedHistory.map(item => {
      const date = new Date(item.fullDate);
      return `${date.getMonth()+1}/${date.getDate()}`;
    });
    
    const data = sortedHistory.map(item => item.score);
    
    const interpretation = getInterpretation();
    
    return {
      labels,
      datasets: [
        {
          label: 'Score History',
          data: data,
          borderColor: interpretation.color,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: interpretation.color,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: interpretation.color
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Your Progress Over Time'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: currentTest ? Math.max(...currentTest.interpretation.map(i => i.max)) : 27,
        title: {
          display: true,
          text: 'Score'
        }
      }
    },
  };

  if (showResults) {
    const interpretation = getInterpretation();
    const recommendations = currentTest.recommendations[interpretation.level];
    const chartData = getMoodChartData();
    
    return (
      <div className="quiz-overlay">
        <div className="quiz-container results-container">
          <button className="quiz-close-btn" onClick={onClose}>×</button>
          
          <div className="results-header">
            <div className="test-icon-large">{currentTest.icon}</div>
            <h2>{currentTest.name} - Results</h2>
          </div>
          
          <div className="score-display">
            <div className="score-circle" style={{borderColor: interpretation.color}}>
              <span>{score}</span>
            </div>
            <div className="score-level" style={{color: interpretation.color}}>
              {interpretation.level} Level
            </div>
            <p>{interpretation.description}</p>
          </div>
          
          {chartData && (
            <div className="progress-chart">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
          
          <div className="interpretation">
            <h4>What This Means</h4>
            <p>Your score of {score} indicates {interpretation.description.toLowerCase()}.</p>
            <p>This screening tool is not a diagnostic instrument but helps identify symptoms that may need professional attention.</p>
          </div>
          
          <div className="recommendations">
            <h4>Recommended Next Steps</h4>
            <ul>
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
          
          <div className="results-actions">
            <button className="nav-btn" onClick={restartTest}>
              <i className="fas fa-redo"></i> Retake Test
            </button>
            <button className="nav-btn primary" onClick={restartTest}>
              <i className="fas fa-check"></i> Done
            </button>
          </div>

          <div className="quiz-history-section">
            <div className="section-header">
              <h4>Test History</h4>
              <button 
                className="toggle-history"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'Hide' : 'Show'} History
              </button>
            </div>
            
            {showHistory && quizHistory.length > 0 && (
              <div className="history-list">
                {quizHistory.map((entry, index) => (
                  <div key={index} className="history-item">
                    <div className="history-test">{entry.test}</div>
                    <div className="history-date">{entry.date}</div>
                    <div 
                      className="history-score"
                      style={{color: mentalHealthTests[entry.testKey]?.interpretation.find(
                        i => entry.score >= i.min && entry.score <= i.max
                      )?.color || '#333'}}
                    >
                      Score: {entry.score}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-overlay">
      <div className="quiz-container">
        <button className="quiz-close-btn" onClick={onClose}>×</button>
        
        <div className="test-selection">
          <div className="app-header">
            <h1>MindCheck</h1>
            <p>Your Mental Wellness Companion</p>
          </div>
          
          <p className="test-selection-title">Select a mental health assessment:</p>
          
          <div className="test-cards">
            {Object.entries(mentalHealthTests).map(([key, test]) => (
              <div
                key={key}
                className={`test-card ${selectedTest === key ? 'active' : ''}`}
                onClick={() => handleTestChange(key)}
              >
                <div className="test-card-icon">{test.icon}</div>
                <div className="test-card-content">
                  <h3>{test.name}</h3>
                  <p>{test.description}</p>
                </div>
                <div className="test-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="quiz-progress">
          <div className="progress-info">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
        
        <div className="quiz-question">
          <div className="question-number">Question {currentQuestion + 1}</div>
          <h3>{questions[currentQuestion]}</h3>
          <p>Over the last 2 weeks, how often have you been bothered by this problem?</p>
        </div>
        
        <div className="quiz-options">
          {options.map((option, index) => (
            <button 
              key={index}
              onClick={() => handleAnswer(index)}
              className={`option-btn ${answers[currentQuestion] === index ? 'selected' : ''}`}
            >
              <span className="option-indicator">
                {answers[currentQuestion] === index ? (
                  <i className="fas fa-check-circle"></i>
                ) : (
                  <i className="far fa-circle"></i>
                )}
              </span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>
        
        <div className="navigation-buttons">
          <button 
            className="nav-btn prev-btn"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <i className="fas fa-arrow-left"></i> Previous
          </button>
          
          <button 
            className="nav-btn next-btn"
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
          >
            {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'} <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthQuiz;