import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import questionsData from "../components/data/questions.json";
import "../styles/MockTest.css";
import { supabase } from "../supabaseClient";
 
function MockInterview() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [showConfirm, setShowConfirm] = useState(false);
 
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(new Date());
  const [showReview, setShowReview] = useState(false);
  /* ================= LOAD QUESTIONS ================= */
  useEffect(() => {
    const aptitude = questionsData.filter(q => q.type === "aptitude");
    const verbal = questionsData.filter(q => q.type === "verbal");
 
    const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());
 
    const selected = [
      ...shuffle(aptitude).slice(0, 10),
      ...shuffle(verbal).slice(0, 10),
    ];
 
    setQuestions(shuffle(selected));
  }, []);
 
  /* ================= TIMER ================= */
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
 
    return () => clearInterval(timer);
  }, [questions]);
 
  const handleOptionClick = (id, option) => {
    setAnswers(prev => ({
      ...prev,
      [id]: option,
    }));
  };
 
  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
 
 
    let scoreCount = 0;
 
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) scoreCount++;
    });
 
    const attempted = Object.keys(answers).length;
    const wrong = attempted - scoreCount;
    const timeTaken = Math.floor((new Date() - startTime) / 1000);
 
    const { data: { user } } = await supabase.auth.getUser();
 
    await fetch("http://127.0.0.1:8000/api/submit-assessment/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        answers: Object.entries(answers).map(([id, answer]) => ({
          id,
          answer
        })),
        assessment_type: "online",   // 🔥 IMPORTANT
        user_id: user.id,
        time_taken: timeTaken,
        score: scoreCount
      })
    });
 
    setResult({
      correct: scoreCount,
      wrong,
      attempted,
      total: questions.length,
      timeTaken,
      questions,     // 🔥 ADD THIS
      answers
    });
 
    setShowResult(true);
  };
 
  const formatTime = (t) => {
    const min = Math.floor(t / 60);
    const sec = t % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };
 
  /* ================= RESULT ================= */
  if (showResult && result) {
    return (
      <div className="result-page">
        <div className="result-glass square">
 
          <h2 className="result-title">Assessment Result</h2>
 
          <div className="result-stats-grid">
 
            <div className="stat-box correct">
              <h3>{result.correct}</h3>
              <p>Correct</p>
            </div>
 
            <div className="stat-box wrong">
              <h3>{result.wrong}</h3>
              <p>Wrong</p>
            </div>
 
            <div className="stat-box">
              <h3>{result.attempted}</h3>
              <p>Attempted</p>
            </div>
 
            <div className="stat-box">
              <h3>{result.total}</h3>
              <p>Total</p>
            </div>
 
            <div className="stat-box full">
              <h3>{result.timeTaken}s</h3>
              <p>Time Taken</p>
            </div>
 
          </div>
 
        </div>
        <div className="result-actions">
 
          <button
            className="review-btn"
            onClick={() => setShowReview(true)}
          >
            Review Answers
          </button>
 
          <button
            className="dashboard-btn"
            onClick={() => window.location.href = "/dashboard"}
          >
            Back to Dashboard
          </button>
 
        </div>
        {showReview && (
        <div className="review-section">
          <h3 className="review-title">Review Your Answers</h3>
 
          {result.questions.map((q, index) => {
            const userAnswer = result.answers[q.id];
            const isCorrect = userAnswer === q.answer;
 
            return (
              <div key={index} className={`review-card ${isCorrect ? "correct-card" : "wrong-card"}`}>
 
                {/* QUESTION */}
                <div className="review-question">
                  <strong>Q{index + 1}.</strong> {q.question}
                </div>
 
                {/* ANSWERS ROW */}
                <div className="review-answers">

                {/* YOUR ANSWER */}
                <div className="answer-row">
                  <span className="label">Your Answer:</span>
                  <span className={`answer ${isCorrect ? "correct" : "wrong"}`}>
                    {userAnswer || "—"} {isCorrect ? "✔ Correct" : "✖ Wrong"}
                  </span>
                </div>

                {/* 🔥 SHOW ONLY IF WRONG */}
                {!isCorrect && (
                  <div className="answer-row">
                    <span className="label">Correct Answer:</span>
                    <span className="answer correct">
                      {q.answer} ✔
                    </span>
                  </div>
                )}

              </div>
 
                  
                </div>
 
              
            );
          })}
        </div>
        )}
      </div>
    );
  }
 
  /* ================= QUIZ ================= */
  return (
<div className="container">
  <h1 className="title">Aptitude / Verbal Assessment</h1>
 
  {questions.length > 0 && (
    <div className="quiz-wrapper">
 
      {/* 🔥 TOP BAR */}
      <div className="quiz-top">
        <div className="timer">⏱ {formatTime(timeLeft)}</div>
 
        <div className="actions">
          <button
            className="exit-btn"
            onClick={() => window.location.href = "/dashboard"}
          >
            End Test
          </button>
 
          <button
            className="submit-btn"
            onClick={() => {
              const unanswered = questions.length - Object.keys(answers).length;
 
              if (unanswered > 0) {
                setShowConfirm(true);
              } else {
                handleSubmit();
              }
            }}
          >
            Submit
          </button>
        </div>
      </div>
 
      {/* QUESTION CARD */}
      <div className="quiz-card-new">
 
        <p className="question-count">
          Question {currentIndex + 1} of {questions.length}
        </p>
 
        <h2 className="question-title">
          {questions[currentIndex]?.question}
        </h2>
 
        <div className="options-new">
          {questions[currentIndex]?.options?.map((opt, i) => (
            <div
              key={i}
              className={`option-new ${
                answers[questions[currentIndex]?.id] === opt ? "selected" : ""
              }`}
              onClick={() =>
                handleOptionClick(questions[currentIndex]?.id, opt)
              }
            >
              {opt}
            </div>
          ))}
        </div>
 
        <div className="nav-buttons">
 
          {currentIndex > 0 && (
            <button
              className="next-btn"
              onClick={() => setCurrentIndex(prev => prev - 1)}
            >
              ← Previous
            </button>
          )}
 
          {currentIndex < questions.length - 1 && (
            <button
              className="next-btn"
              onClick={() => setCurrentIndex(prev => prev + 1)}
            >
              Next →
            </button>
          )}
 
        </div>
 
      </div>
 
      {/* NAVIGATION */}
      <div className="question-nav">
        {questions.map((q, i) => (
          <div
            key={i}
            className={`nav-box
              ${currentIndex === i ? "active" : ""}
              ${answers[q.id] ? "answered" : ""}
            `}
            onClick={() => setCurrentIndex(i)}
          >
            {i + 1}
          </div>
        ))}
      </div>
 
    </div>
  )}
 
  {/* 🔥 MODAL (CORRECT PLACE) */}
  {showConfirm && (
    <div className="modal-overlay">
      <div className="modal-box">
 
        <h3>Submit Test?</h3>
        <p>
          You still have {questions.length - Object.keys(answers).length} unanswered questions.
        </p>
 
        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={() => setShowConfirm(false)}
          >
            Cancel
          </button>
 
          <button
            className="confirm-btn"
            onClick={() => {
              setShowConfirm(false);
              handleSubmit();
            }}
          >
            Submit Anyway
          </button>
        </div>
 
      </div>
    </div>
  )}
 
</div>
);
}
export default MockInterview;