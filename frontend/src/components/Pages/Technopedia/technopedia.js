import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Avatar,
    CircularProgress,
    Snackbar,
    Alert,
    Typography,
    Divider,
    Box
} from '@mui/material';
import './technopedia.css';
import technoLogo from '../../Assets/img/techno_contest.png';
import starLogo from '../../Assets/img/star.png';
import rightLogo from '../../Assets/img/techniche_logo.png';
import birdLogo from '../../Assets/img/bird_logo1.png';
import arcImage from '../../Assets/img/arc.png';

function Contest() {
    const { year } = useParams();
    const baseURL = process.env.NODE_ENV === "production" ? "https://technothlon.techniche.org.in" : "http://localhost:4000";
    const navigate = useNavigate();

    // State management
    const [contestDates, setContestDates] = useState({
        schedule: null,
        individualTimer: null
    });
    const [questions, setQuestions] = useState([

    ]);
    const [contestStarted, setContestStarted] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openEndDialog, setOpenEndDialog] = useState(false);
    const [userName, setUserName] = useState('');
    const [years, setYears] = useState(null)
    const [error, setError] = useState('');
    const [scores, setScores] = useState({
        question1: 0,
        question2: 0,
        question3: 0,
        question4: 0,
        question5: 0,
        question6: 0,
        question7: 0,
        question8: 0,
        question9: 0,
        question10: 0,
        total: 0
    });
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [showReloadConfirm, setShowReloadConfirm] = useState(false);
    const reloadAttemptedRef = useRef(false);
    const [questionLoading, setQuestionLoading] = useState(false);

    // Check user authentication
    useEffect(() => {
        const checkAuthentication = () => {
            const userPhone = localStorage.getItem('userPhone');
            const userName = localStorage.getItem('userName');
            const isContestActive = localStorage.getItem('isContestActive');

            if (!userPhone || !userName) {
                navigate('/technopedia-login', { replace: true });
                return;
            }

            setUserName(userName);
            if (isContestActive === 'true') {
                setContestStarted(true);
            }
        };

        checkAuthentication();
    }, [navigate]);

    // Check if contest is already started
    useEffect(() => {
        const startTime = localStorage.getItem('contestStartTime');
        if (startTime) {
            setContestStarted(true);
            fetchQuestions(); // ← add this
        }
    }, []);

    // Fetch contest times (but don't show timer to user)
    useEffect(() => {
        const fetchTimes = async () => {
            try {
                const phone = localStorage.getItem('userPhone');
                const sessionId = localStorage.getItem('sessionToken');

                const response = await axios.get(`${baseURL}/api/technopedia/techno/times`, {
                    params: { phone, sessionId }
                });

                if (response.data) {
                    setContestDates(response.data);
                }
            } catch (error) {
                console.error('Error fetching times:', error);
                setError('Error fetching contest schedule');
            }
        };

        fetchTimes();
    }, [baseURL]);

    // Get answered questions
    useEffect(() => {
        const answeredQuestions = JSON.parse(localStorage.getItem('answeredQuestions') || '[]');
        setQuestions(prevQuestions =>
            prevQuestions.map(q => ({
                ...q,
                answered: answeredQuestions.includes(q.id.toString())
            }))
        );
    }, []);

    // Listen for answer submissions from question pages
    useEffect(() => {
        const handleAnswerSubmitted = (event) => {
            if (event.detail && event.detail.questionId) {
                setSnackbar({
                    open: true,
                    message: 'Your answer has been submitted successfully!',
                    severity: 'success'
                });

                // Update answered questions
                setQuestions(prevQuestions =>
                    prevQuestions.map(q =>
                        q.id === event.detail.questionId
                            ? { ...q, answered: true, attempted: true }
                            : q
                    )
                );

                // Update localStorage
                const answeredQuestions = JSON.parse(localStorage.getItem('answeredQuestions') || '[]');
                if (!answeredQuestions.includes(event.detail.questionId.toString())) {
                    answeredQuestions.push(event.detail.questionId.toString());
                    localStorage.setItem('answeredQuestions', JSON.stringify(answeredQuestions));
                }
            }
        };

        window.addEventListener('answerSubmitted', handleAnswerSubmitted);
        return () => window.removeEventListener('answerSubmitted', handleAnswerSubmitted);
    }, []);

    useEffect(() => {
        if (!showAnalysis) return;
        const handleBeforeUnload = (e) => {
            if (reloadAttemptedRef.current) return;
            e.preventDefault();
            e.returnValue = '';
            setShowReloadConfirm(true);
            reloadAttemptedRef.current = true;
            return '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [showAnalysis]);

    // Add this useEffect
    useEffect(() => {
        const isActive = localStorage.getItem('contestStartTime');
        if (!isActive) {
            fetchQuestionsPreview(); // only fetch preview if contest NOT started
        }
    }, [year]);

    // Separate preview fetch (no auth needed, just metadata)
    const fetchQuestionsPreview = async () => {
        try {
            setQuestionLoading(true)
            const questionPromises = Array.from({ length: 10 }, (_, i) => i + 1).map(id =>
                axios.get(`${baseURL}/api/technopedia/questions/${year}/${id}`)
                // No Authorization header needed for preview
            );
            const responses = await Promise.all(questionPromises);
            const formattedQuestions = responses.map((response, index) => ({
                id: index + 1,
                title: response.data.title,
                letter: response.data.letter,
                points: response.data.points,
                answered: false
            }));
            setQuestions(formattedQuestions);
        } catch (error) {

            console.error('Error fetching preview:', error);
        } finally {
            setQuestionLoading(false)
        }
    };

    // Handlers
    const handleStartContest = () => {
        setOpenDialog(true);
    };

    const fetchQuestions = async () => {
        try {
            setYears(year);
            setQuestionLoading(true)
            const sessionToken = localStorage.getItem('sessionToken');
            if (!sessionToken) {
                throw new Error('No session token found');
            }

            const questionPromises = Array.from({ length: 10 }, (_, i) => i + 1).map(id =>
                axios.get(`${baseURL}/api/technopedia/questions/${year}/${id}`, {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`
                    }
                })
            );

            const responses = await Promise.all(questionPromises);

            const formattedQuestions = responses.map((response, index) => ({
                id: index + 1,
                title: response.data.title,
                letter: response.data.letter,
                points: response.data.points,
                content: response.data.content || '',
                answered: false
            }));
            setQuestions(formattedQuestions)
        } catch (error) {
            console.error('Error fetching questions:', error);
            setError('Failed to load questions. Please try again.');
        } finally {
            setQuestionLoading(false)

        }
    };


    const handleConfirmStart = async () => {
        try {
            setIsLoading(true);
            setError('');

            const userPhone = localStorage.getItem('userPhone');
            const userName = localStorage.getItem('userName');
            const userSchool = localStorage.getItem('userSchool');
            const studentType1 = localStorage.getItem('usertype');

            console.log('Frontend data being sent:', { userPhone, userName, userSchool, studentType1 });

            if (!userPhone || !userName || !userSchool) {
                throw new Error('Missing user information. Please login again.');
            }

            const requestData = {
                phone: userPhone,
                name: userName,
                school: userSchool,
                studentType: studentType1
            };

            console.log('Request data:', requestData);

            const response = await axios.post(`${baseURL}/api/technopedia/techno/start`, requestData);

            if (response.data.success) {
                // Set contest times (for tracking purposes only)
                const startTime = new Date();

                // Save to localStorage
                localStorage.setItem('contestStartTime', startTime.toISOString());
                localStorage.setItem('sessionToken', response.data.sessionToken);
                localStorage.setItem('isContestActive', 'true');

                // Update state
                setContestStarted(true);
                setOpenDialog(false);

                // Fetch questions
                await fetchQuestions();

                setSnackbar({
                    open: true,
                    message: 'Contest started successfully! You can now solve questions.',
                    severity: 'success'
                });
            } else {
                throw new Error(response.data.message || 'Failed to start contest');
            }
        } catch (error) {
            console.error('Contest start error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to start contest');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAnalysis = async () => {
        try {
            const userPhone = localStorage.getItem('userPhone');
            console.log('Fetching analysis for phone:', userPhone);

            const response = await axios.get(`${baseURL}/api/technopedia/analysis/${userPhone}`);

            console.log('Analysis response:', response.data);

            if (response.data.success) {
                setAnalysisData(response.data.analysis);
                return response.data.analysis;
            }
        } catch (error) {
            console.error('Error fetching analysis:', error);
            setError('Error fetching performance analysis');
        }
        return null;
    };

    const clearContestSessionStorage = () => {
        const itemsToRemove = [
            'contestStartTime',
            'sessionToken',
            'answeredQuestions',
            'technopedia_answeredQuestions',
            'isContestActive'
        ];

        for (let i = 1; i <= 10; i++) {
            localStorage.removeItem(`technopedia_timeSpent_question_${i}`);
            localStorage.removeItem(`technopedia_totalTimeSpent_question_${i}`);
        }

        itemsToRemove.forEach(item => localStorage.removeItem(item));
    };

    const handleEndContest = async () => {
        try {
            setIsLoading(true);
            setOpenEndDialog(false);
            setError('');
            const userPhone = localStorage.getItem('userPhone');

            if (!userPhone) {
                setError('User phone not found');
                navigate('/technopedia-login');
                return;
            }

            console.log('Ending contest for phone:', userPhone);

            // First end the contest
            const response = await axios.post(`${baseURL}/api/technopedia/techno/end`, {
                phone: userPhone
            });

            console.log('End contest response:', response.data);

            if (response.data.message === 'Contest ended successfully') {
                setScores(response.data.scores);
                setTotalTimeSpent(response.data.totalTimeSpent);

                clearContestSessionStorage();
                setContestStarted(false);

                // Fetch analysis data
                const analysis = await fetchAnalysis();
                if (analysis) {
                    setShowAnalysis(true);
                }
            } else {
                // If the response doesn't indicate success, still try to show analysis
                const analysis = await fetchAnalysis();
                if (analysis) {
                    clearContestSessionStorage();
                    setContestStarted(false);
                    setShowAnalysis(true);
                }
            }
        } catch (error) {
            console.error('Error ending contest:', error);
            setError(error.response?.data?.message || 'Error ending contest');

            // If there's an error, still try to clear localStorage and show analysis
            try {
                const analysis = await fetchAnalysis();
                if (analysis) {
                    clearContestSessionStorage();
                    setContestStarted(false);
                    setShowAnalysis(true);
                }
            } catch (analysisError) {
                console.error('Error fetching analysis after contest end error:', analysisError);
            }
        } finally {
            setIsLoading(false);
        }
    };



    const handleQuestionClick = (id, letter) => {
        console.log('year:', year, 'id:', id, 'letter:', letter); // add this temporarily
        navigate(`/technopedia/${year}/${id}/${letter}`);
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleReloadYes = () => {
        setShowReloadConfirm(false);
        window.removeEventListener('beforeunload', () => { }); // Remove handler
        window.location.reload();
    };
    const handleReloadNo = () => {
        setShowReloadConfirm(false);
        reloadAttemptedRef.current = false;
    };

    // Utility functions
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${remainingSeconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    };

    const formatTimeInMinutes = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    };

    // Constants for analysis display
    const metricIcons = {
        accuracy: '🎯',
        averageConfidence: '🔮',
        averageTIQ: '🧠',
        averageEfficiency: '⚡',
        averageConsistency: '📊',
        timeEfficiencyScore: '⏱️'
    };

    const metricTitles = {
        accuracy: 'Accuracy',
        averageConfidence: 'Confidence',
        averageTIQ: 'Tech IQ',
        averageEfficiency: 'Efficiency',
        averageConsistency: 'Consistency',
        timeEfficiencyScore: 'Time Efficiency'
    };

    const statusIcons = {
        correct: '✓',
        wrong: '✗',
        unattempted: '⏸'
    };

    const scoreLabels = {
        confidence: 'Confidence',
        tiq: 'TIQ',
        efficiency: 'Efficiency',
        consistency: 'Consistency'
    };

    const insightIcons = {
        strengths: '💪',
        improvements: '📈',
        recommendations: '💡'
    };

    const insightTitles = {
        strengths: 'Strengths',
        improvements: 'Areas for Improvement',
        recommendations: 'Recommendations'
    };

    const AnalysisComponent = () => {
        if (!analysisData) {
            return (
                <div className="TA-analysis-container">
                    <h2 className="TA-analysis-title">TechnoAnalysis</h2>
                    <div className="TA-analysis-loading">
                        <CircularProgress />
                        <p>Loading your performance analysis...</p>
                    </div>
                </div>
            );
        }

        // Performance level indicator
        const getPerformanceLevel = (score) => {
            if (score >= 85) return { level: 'Excellent', color: '#4CAF50', icon: '🏆' };
            if (score >= 75) return { level: 'Good', color: '#2196F3', icon: '🎯' };
            if (score >= 65) return { level: 'Average', color: '#FF9800', icon: '⚡' };
            return { level: 'Needs Improvement', color: '#F44336', icon: '📚' };
        };

        const performanceLevel = getPerformanceLevel(analysisData.collectiveScore);
        const radius = 90;
        const strokeWidth = 20;
        const circumference = Math.PI * radius;
        const progress = (40 / 100) * circumference;

        return (
            <div className="TA-analysis-container">
                <h2 className="TA-analysis-title">🔬 TechnoAnalysis Report</h2>

                <div style={{ display: "flex" }}>
                    <div style={{
                        height: "300px",
                        background: "linear-gradient(to right, #810eed, #7700c6)",
                        width: "600px",
                        borderRadius: "16px",
                        padding: "10px 50px 10px 10px",
                        display: "flex",
                        justifyContent: "space-between",
                        marginRight: "20px"
                    }}>
                        <span style={{ textAlign: "center" }}>
                            <svg
                                width="340"
                                height="220"
                                viewBox="0 0 220 120"
                            >
                                {/* Background Arc */}
                                <path
                                    d="
                                        M 20 100
                                        A 90 90 0 0 1 200 100
                                    "
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth={strokeWidth}
                                    strokeLinecap=""
                                />

                                {/* Progress Arc */}
                                <path
                                    d="
                                        M 20 100
                                        A 90 90 0 0 1 200 100
                                    "
                                    fill="none"
                                    stroke="#1aff8d"
                                    strokeWidth={strokeWidth}
                                    strokeLinecap=""
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference - progress}
                                    style={{
                                        transition: "0.5s ease",
                                        filter: "drop-shadow(0px 0px 1px #00eb6a)"
                                    }}
                                />

                                {/* Marks Text */}
                                <text
                                    x="110"
                                    y="82"
                                    textAnchor="middle"
                                    fontSize="20"
                                    fontWeight="bold"
                                    fill="white"
                                >
                                    0/1000
                                </text>
                                <br></br>
                                <text
                                    x="110"
                                    y="100"
                                    textAnchor="middle"
                                    fontSize="9"
                                    fontWeight="bold"
                                    fill="white"
                                >
                                    Overall Score
                                </text>
                            </svg>
                        </span>
                        <div>
                            <span style={{ display: "block", marginBotton: "10px" }}>
                                <p style={{ color: "white" }}>⏱️ Time taken</p>
                                <h1 style={{
                                    color: "white",
                                    fontSize: "50px",
                                    fontWeight: "900"
                                }}>3h 2m</h1>
                                <p style={{
                                    color: "#e1e1e1",
                                    fontSize: "15px",
                                    fontWeight: "400",
                                    marginTop: "4px",
                                }}>15 min/Q</p>
                            </span>
                            <hr></hr>
                            <span style={{ display: "block" }}>
                                <p style={{ color: "white" }}>✅ Completion rate</p>
                                <h1 style={{
                                    color: "white",
                                    fontSize: "50px",
                                    fontWeight: "900"
                                }}>10%</h1>
                                <p style={{ color: "white" }}>4/10</p>
                            </span>
                        </div>
                    </div>

                    <div style={{
                        width: "350px",
                        height: "300px",
                        border: "2px solid white",
                        borderRadius: "16px",
                        background: "white",
                    }}>
                        <div style={{
                            width: "300px",
                            height: "50px",
                            borderRadius: "10px",
                            borderLeft: "7px solid blue",
                            margin: "20px",
                            boxShadow: "0 0 10px gray"
                        }}> Attempted</div>
                        <div style={{
                            width: "300px",
                            height: "50px",
                            borderRadius: "10px",
                            borderLeft: "7px solid green",
                            margin: "20px",
                            boxShadow: "0 0 10px gray"
                        }}>Correct</div>
                        <div style={{
                            width: "300px",
                            height: "50px",
                            borderRadius: "10px",
                            borderLeft: "7px solid red",
                            margin: "20px",
                            boxShadow: "0 0 10px gray"
                        }}>Wrong</div>
                        <div style={{
                            width: "300px",
                            height: "50px",
                            borderRadius: "10px",
                            borderLeft: "7px solid orange",
                            margin: "20px",
                            boxShadow: "0 0 10px gray"
                        }}>Unattempted</div>
                    </div>
                </div>

                {/* Performance Summary */}
                {/* <div className="TA-performance-summary">
                    <div className="TA-summary-card TA-primary">
                        <div className="TA-summary-icon">{performanceLevel.icon}</div>
                        <div className="TA-summary-content">
                            <div className="TA-summary-value">{analysisData.collectiveScore}/100</div>
                            <div className="TA-summary-label">Overall Score</div>
                            <div className="TA-summary-category" style={{ color: performanceLevel.color }}>
                                {analysisData.performanceCategory}
                            </div>
                        </div>
                    </div>

                    <div className="TA-summary-card">
                        <div className="TA-summary-icon">⏱️</div>
                        <div className="TA-summary-content">
                            <div className="TA-summary-value">{analysisData.totalContestTime}m</div>
                            <div className="TA-summary-label">Total Time</div>
                            <div className="TA-summary-sub">Avg: {analysisData.averageTimePerQuestion}m/Q</div>
                        </div>
                    </div>

                    <div className="TA-summary-card">
                        <div className="TA-summary-icon">✅</div>
                        <div className="TA-summary-content">
                            <div className="TA-summary-value">{analysisData.completionRate}%</div>
                            <div className="TA-summary-label">Completion Rate</div>
                            <div className="TA-summary-sub">{analysisData.attemptedQuestions}/{analysisData.totalQuestions}</div>
                        </div>
                    </div>
                </div> */}

                {/* Overview Cards */}
                <div className="TA-analysis-overview">
                    <div className="TA-overview-card TA-attempted">
                        <div className="TA-overview-number">{analysisData.attemptedQuestions}</div>
                        <div className="TA-overview-label">Attempted</div>
                    </div>
                    <div className="TA-overview-card TA-correct">
                        <div className="TA-overview-number">{analysisData.correctAnswers}</div>
                        <div className="TA-overview-label">Correct</div>
                    </div>
                    <div className="TA-overview-card TA-wrong">
                        <div className="TA-overview-number">{analysisData.wrongAnswers}</div>
                        <div className="TA-overview-label">Wrong</div>
                    </div>
                    <div className="TA-overview-card TA-unattempted">
                        <div className="TA-overview-number">{analysisData.unattemptedQuestions}</div>
                        <div className="TA-overview-label">Unattempted</div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="TA-performance-metrics">
                    {['accuracy', 'averageConfidence', 'averageTIQ', 'averageEfficiency', 'averageConsistency', 'timeEfficiencyScore'].map((metricKey, index) => (
                        <div key={index} className="TA-metric-card">
                            <div className="TA-metric-header">
                                <span className="TA-metric-icon">{metricIcons[metricKey]}</span>
                                <span className="TA-metric-title">{metricTitles[metricKey]}</span>
                            </div>
                            <div className="TA-metric-value">
                                {metricKey === 'averageTIQ' ? `${analysisData[metricKey]}/150` : `${analysisData[metricKey]}/100`}
                            </div>
                            <div className="TA-metric-bar">
                                <div
                                    className="TA-metric-progress"
                                    style={{ width: `${metricKey === 'averageTIQ' ? (analysisData[metricKey] / 150) * 100 : analysisData[metricKey]}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Insights Section */}
                {analysisData.insights && (
                    <div className="TA-insights-section">
                        <h3>💡 Performance Insights</h3>
                        <div className="TA-insights-grid">
                            {['strengths', 'improvements', 'recommendations'].map((type, index) => (
                                analysisData.insights[type].length > 0 && (
                                    <div key={index} className={`TA-insight-card TA-${type}`}>
                                        <div className="TA-insight-header">
                                            <span className="TA-insight-icon">{insightIcons[type]}</span>
                                            <span className="TA-insight-title">{insightTitles[type]}</span>
                                        </div>
                                        <ul className="TA-insight-list">
                                            {analysisData.insights[type].map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* Question-wise Analysis */}
                <div className="TA-question-analysis">
                    <h3>📊 Question-wise Performance</h3>
                    <div className="TA-questions-grid">
                        {analysisData.questionAnalysis.map((question, index) => (
                            <div key={index} className={`TA-question-card TA-${question.status}`}>
                                <div className="TA-question-header">
                                    <span className="TA-question-number">Q{question.questionId}</span>
                                    <span className={`TA-status-badge TA-${question.status}`}>
                                        {statusIcons[question.status]}
                                    </span>
                                    <span className="TA-question-grade">{question.grade}</span>
                                </div>
                                <div className="TA-question-metrics">
                                    <div className="TA-metric-row">
                                        <span className="TA-metric-label">⏱ Time:</span>
                                        <span className="TA-metric-value">{question.timeSpent}m</span>
                                    </div>
                                    <div className="TA-metric-row">
                                        <span className="TA-metric-label">👁 Visits:</span>
                                        <span className="TA-metric-value">{question.visitCount}</span>
                                    </div>
                                    <div className="TA-metric-row">
                                        <span className="TA-metric-label">📝 Attempts:</span>
                                        <span className="TA-metric-value">{question.submissionCount}</span>
                                    </div>
                                </div>
                                <div className="TA-question-scores">
                                    {['confidence', 'tiq', 'efficiency', 'consistency'].map((scoreKey, idx) => (
                                        <div key={idx} className="TA-score-item">
                                            <span className="TA-score-label">{scoreLabels[scoreKey]}: </span>
                                            <span className="TA-score-value">{question[scoreKey]}{scoreKey === 'tiq' ? '/150' : '/100'}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="TA-correct-answer">
                                    <span className="TA-answer-label">Correct Answer:</span>
                                    <span className="TA-answer-value">{question.correctAnswer}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final Score */}
                <div className="TA-final-score">
                    <h3>🏆 Final Score</h3>
                    <div className="TA-score-display">
                        <div className="TA-total-score">{analysisData.scores.total}</div>
                        <div className="TA-score-label">Total Points</div>
                    </div>
                </div>
            </div>
        );
    };

    // const handleBack = () => {
    //     // Clear all localStorage items related to contest and analysis
    //     const itemsToRemove = [
    //         'contestStartTime',
    //         'sessionToken',
    //         'userPhone',
    //         'userName',
    //         'userSchool',
    //         'usertype',
    //         'answeredQuestions',
    //         'isContestActive',
    //         'userRoll'
    //     ];
    //     for (let i = 1; i <= 10; i++) {
    //         localStorage.removeItem(`technopedia_timeSpent_question_${i}`);
    //         localStorage.removeItem(`technopedia_totalTimeSpent_question_${i}`);
    //     }
    //     itemsToRemove.forEach(item => localStorage.removeItem(item));
    //     Object.keys(localStorage).forEach(key => {
    //         if (key.includes('technopedia') || key.includes('contest') || key.includes('session')) {
    //             localStorage.removeItem(key);
    //         }
    //     });
    //     navigate('/technopedia-login', { replace: true });
    // };

    const handleBack = () => {
        if (showAnalysis) {
            clearContestSessionStorage();
            setContestStarted(false);
            setShowAnalysis(false);
            navigate(`/technopedia`);
        } else if (contestStarted) {
            setOpenEndDialog(true);
        }
    };

    return (
        <div className={`contest-container ${contestStarted ? 'contest-started' : ''}`}>
            {/* Back button for contest */}
            {(contestStarted || showAnalysis) && (
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    className="back-button-contest"
                >
                    Back
                </Button>
            )}

            <div className="header-section">
                <div className="main-logo-container">
                    {/* <img src={starLogo} alt="" className="star-logo" /> */}
                    <img src={technoLogo} alt="Technothlon" className="main-logo1" />
                    {/* <img src={rightLogo} alt="" className="right-logo" /> */}
                    {/* <img src={arcImage} alt="" className="arc-image" /> */}
                </div>
                <div className="user-info">
                    <Avatar>{userName ? userName[0].toUpperCase() : 'A'}</Avatar>
                    <span className="user-name">{userName ? userName : "Akash Roy"}</span>
                </div>
            </div>

            {showAnalysis ? (
                <AnalysisComponent />
            ) : !contestStarted ? (
                <div className="TL-questions-section-c">
                    {questionLoading ? (
                        <div className="TL-loading-container">
                            <CircularProgress />
                        </div>
                    ) : (
                        <div className="TL-questions-section-c">
                            <div className='TL-question-heading'>
                                <h1 className='heading-text'>PRACTICE QUESTIONS</h1>
                                <div className='heading-card'>
                                    <div className='heading-card-detail'>
                                        <span className='heading-card-icon'>
                                            <ion-icon name="document-text-outline"></ion-icon>
                                        </span>
                                        <span className='heading-card-info'>
                                            <p>Total Questions</p>
                                            <h1>{questions.length > 0 ? questions.length : 0}</h1>
                                        </span>
                                    </div>
                                    <div className='heading-card-detail'>
                                        <span className='heading-card-icon'>
                                            <ion-icon name="star-outline"></ion-icon>
                                        </span>
                                        <span className='heading-card-info'>
                                            <p>Total Points</p>
                                            <h1>{questions.reduce((total, question) => total + question.points, 0)}</h1 >
                                        </span>
                                    </div>
                                    <div className='heading-card-detail'>
                                        <span className='heading-card-icon'>
                                            <ion-icon name="stats-chart-outline"></ion-icon>
                                        </span>
                                        <span className='heading-card-info'
                                        >
                                            <p>Diffuculty mix</p>
                                            <h1 >Easy-Hard</h1>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="TL-questions-grid">
                                {questions.map((question) => (
                                    <div key={question.id} className="TL-question-wrapper">
                                        <div className="question-card">
                                            <div className="question-header">
                                                <span className="question-letter">{question.letter}</span>
                                                <span className="points-badge">
                                                    <span><ion-icon name="star"></ion-icon></span>
                                                    <span>{question.points} pts</span>
                                                </span>
                                            </div>
                                            <div className="question-content">
                                                <h3 className="question-title">{question.title || `Question ${question.letter}`}</h3>
                                                <div className="status-badge locked">
                                                    <span className="lock-icon">🔒</span>
                                                    Locked
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Start button as last grid item */}
                                <div className="start-section-c">
                                    <button
                                        className="start-button"
                                        onClick={handleStartContest}
                                        disabled={isLoading}
                                    >
                                        <span>{isLoading ? 'Starting...' : '🚀 Start Contest'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="TL-questions-section-c">
                    <div className="TL-questions-grid">
                        {questions.map((question) => (
                            <div key={question.id} className="TL-question-wrapper">
                                <div className={`question-card ${question.answered ? 'answered' : 'unlocked'}`}>
                                    <div className="question-header">
                                        <span className="question-letter">{question.letter}</span>
                                        <span className="points-badge">{question.points} pts</span>
                                    </div>
                                    <div className="question-content">
                                        <h3 className="question-title">{question.title || `Question ${question.letter}`}</h3>
                                        <button
                                            className={`solve-button ${question.answered ? 'answered' : ''}`}
                                            onClick={() => handleQuestionClick(question.id, question.letter)}
                                        >
                                            {question.answered ? 'Solve Again' : 'Solve Now'} <span className="arrow">→</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* End button as last grid item */}
                        <div className="start-section-c">
                            <button
                                className="end-contest-btn"
                                onClick={handleEndContest}
                                disabled={isLoading}
                            >
                                <span>{isLoading ? 'Ending...' : '🏁 End Contest'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!showAnalysis && <img src={birdLogo} alt="" className="bird-logo" />}

            {/* show to end contest */}
            {/* End Contest Warning Dialog */}
            <Dialog
                open={openEndDialog}
                onClose={() => setOpenEndDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "8px",
                        padding: "8px"
                    }
                }}
            >
                <DialogContent sx={{ padding: "1.2rem" }}>

                    {/* TOP */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            borderBottom: "1px solid #e5e7eb",
                            paddingBottom: "12px"
                        }}
                    >

                        {/* ICON */}
                        <div
                            style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "50%",
                                background: "#fff4ec",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                            }}
                        >
                            <WarningAmberRoundedIcon
                                sx={{
                                    color: "#ff6b35",
                                    fontSize: "1.8rem"
                                }}
                            />
                        </div>

                        {/* TEXT */}
                        <div>

                            <Typography
                                sx={{
                                    fontSize: "1.4rem",
                                    fontWeight: 700,
                                    color: "#111827",
                                    mb: 1
                                }}
                            >
                                End Contest?
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: "0.95rem",
                                    color: "#4b5563",
                                    lineHeight: 1.7
                                }}
                            >
                                You are currently participating in an active contest.
                                If you go back now, your contest session will end and you will be log out of the contest interface
                            </Typography>

                            {/* INFO BOX */}
                            <div
                                style={{
                                    marginTop: "1rem",
                                    background: "#fff8f5",
                                    border: "1px solid #ffe3d3",
                                    borderRadius: "12px",
                                    padding: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px"
                                }}
                            >
                                <InfoOutlinedIcon
                                    sx={{
                                        color: "#ff6b35",
                                        fontSize: "1.2rem"
                                    }}
                                />

                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        color: "#374151",
                                        lineHeight: 1.5
                                    }}
                                >
                                    Make sure you have submitted your answers before ending the contest
                                </Typography>
                            </div>
                        </div>

                    </div>



                    {/* BUTTONS */}
                    <DialogActions
                        sx={{
                            padding: 0,
                            marginTop: "1.2rem",
                            justifyContent: "flex-end",
                            gap: "8px"
                        }}
                    >

                        <Button
                            onClick={() => setOpenEndDialog(false)}
                            sx={{
                                color: "#4b5563",
                                fontWeight: 600,
                                textTransform: "none"
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleEndContest}
                            variant="contained"
                            sx={{
                                background: "#ff6b35",
                                borderRadius: "5px",
                                padding: "8px 18px",
                                textTransform: "none",
                                fontWeight: 600,
                                boxShadow: "none",

                                "&:hover": {
                                    background: "#f4511e",
                                    boxShadow: "none"
                                }
                            }}
                        >
                            End Contest
                        </Button>

                    </DialogActions>

                </DialogContent>
            </Dialog>

            {/* Start Contest Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => !isLoading && setOpenDialog(false)}
                disableBackdropClick={isLoading}
                disableEscapeKeyDown={isLoading}
            >
                <DialogTitle>Start Contest?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Warning: Once you start the contest, you can solve questions without any time limit.
                        You can submit multiple answers for each question - your latest answer will be considered.
                        Negative points will be awarded for incorrect answers.
                        Are you sure you want to proceed?
                    </DialogContentText>
                    {error && (
                        <div className="error-message" style={{
                            color: 'red',
                            marginTop: '10px',
                            padding: '8px',
                            backgroundColor: '#ffebee',
                            borderRadius: '4px'
                        }}>
                            {error}
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        color="primary"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmStart}
                        color="primary"
                        variant="contained"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span style={{ marginRight: '8px' }}>Starting...</span>
                                <CircularProgress size={20} color="inherit" />
                            </>
                        ) : (
                            'Start Contest'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Dialog open={showReloadConfirm} onClose={handleReloadNo} disableEscapeKeyDown>
                <DialogTitle>Reload Confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to reload? You may lose your analysis data.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleReloadNo} color="primary">No</Button>
                    <Button onClick={handleReloadYes} color="primary" variant="contained">Yes</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Contest;
