import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/MockTest.css";
import Layout from "../components/Layout";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

function MockTest() {
  const location = useLocation();

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800);

  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!selectedRole) return;

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
  }, [selectedRole]);

  /* ================= LOAD ROLES ================= */
  useEffect(() => {
    const loadRoles = async () => {
      if (location.state?.roles) {
        setRoles(location.state.roles);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const stored = localStorage.getItem(`resume_analysis_${user.id}`);

      if (stored) {
        const parsed = JSON.parse(stored);
        setRoles(parsed?.careers?.map(c => c.role) || []);
      }
    };

    loadRoles();
  }, [location.state]);

  /* ================= SELECT ROLE ================= */
  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    setLoading(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/assessment/${encodeURIComponent(role)}/`
      );
      const data = await res.json();

      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (id, option) => {
    setAnswers((prev) => ({ ...prev, [id]: option }));
  };

  /* ================= SUBMIT ================= */
 const handleSubmit = async () => {

  if (Object.keys(answers).length !== questions.length) {
    alert("Please answer all questions before submitting.");
    return;
  }

  try {
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - startTime) / 1000);

    const { data: { user } } = await supabase.auth.getUser();

    const res = await fetch("http://127.0.0.1:8000/api/submit-assessment/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        answers: Object.entries(answers).map(([id, answer]) => ({
          id,
          answer
        })),
        role: selectedRole,
        assessment_type: "skill",
        user_id: user.id,
        time_taken: timeTaken
      })
    });

    const data = await res.json();

    const attempted = Object.keys(answers).length;
    const correct = data.score;
    const wrong = attempted - correct;

    setResult({
      correct,
      wrong,
      attempted,
      total: questions.length,
      timeTaken,
      questions,     // 🔥 ADD THIS
      answers 
    });

    setShowResult(true);

  } catch (err) {
    console.error(err);
    alert("Submission failed");
  }
};
  const formatTime = (t) => {
    const min = Math.floor(t / 60);
    const sec = t % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  /* ================= RESULT PAGE ================= */
  if (showResult && result) {
    const data = [
      { name: "Correct", value: result.correct },
      { name: "Wrong", value: result.wrong },
    ];

    const COLORS = ["#22c55e", "#ef4444"];

    return (
      <div className="result-page">
        <div className="result-glass square">

          <h2 className="result-title">Assessment Result</h2>

          <div className="chart-container">
            <PieChart width={280} height={280}>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={45}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

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
            onClick={() => window.location.href = "/assessment/mock-test"}
          >
            Back to Skill Assessment
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

                  <div className="answer-row">
                    <span className="label">Your Answer:</span>
                    <span className={`answer ${isCorrect ? "correct" : "wrong"}`}>
                      {userAnswer || "—"} {isCorrect ? "✔" : "✖"}
                    </span>
                  </div>

                  <div className="answer-row">
                    <span className="label">Correct Answer:</span>
                    <span className="answer correct-answer">
                      {q.answer} ✔
                    </span>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
        )}
      </div>
    );
  }

  /* ================= MAIN UI ================= */
  return (
  <Layout>
    <div className="container">
      <h1 className="title">Skill Assessment</h1>

      {!selectedRole && (
        <div className="role-container">
          <h2 className="role-title">Choose Your Career Path</h2>

          <div className="carousel-wrapper">
            <div className="carousel-track">
              {[...roles, ...roles].map((role, i) => (
                <div
                  key={i}
                  className="role-card"
                  onClick={() => handleRoleSelect(role)}
                >
                  <div className="role-icon">💼</div>
                  <h3>{role}</h3>
                  <p>Start your assessment journey</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedRole && loading && (
        <div className="loader">Loading questions...</div>
      )}

      {selectedRole && !loading && questions.length > 0 && questions[currentIndex] && (
        <div className="quiz-wrapper">

          <div className="quiz-top">
            <div className="timer">⏱ {formatTime(timeLeft)}</div>

            <div className="actions">
              <button
                className="exit-btn"
                onClick={() => setSelectedRole(null)}
              >
                End Test
              </button>

              {/* ✅ DISABLED BUTTON */}
              <button
                className={`submit-btn ${
                  Object.keys(answers).length !== questions.length ? "disabled" : ""
                }`}
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== questions.length}
              >
                Submit
              </button>
            </div>
          </div>

          <div className="quiz-card-new">
            <p className="question-count">
              Question {currentIndex + 1} of {questions.length}
            </p>

            <h2 className="question-title">
              {questions[currentIndex]?.question}
            </h2>

            {questions[currentIndex]?.code && (
              <pre className="code-block">
                <code>{questions[currentIndex].code}</code>
              </pre>
            )}

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

            <button
              className="next-btn"
              onClick={() => {
                if (currentIndex < questions.length - 1) {
                  setCurrentIndex((prev) => prev + 1);
                }
              }}
            >
              Next →
            </button>
          </div>

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
        </div>
  </Layout>
);
}

export default MockTest;