const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ContestScore = require('../models/contest-score');
const Contest = require('../models/contest');
const crypto = require('crypto');
const Announcement = require('../models/announcement');
const Online26=require('../models/online26');
const { convertToIST } = require('../utils/timeUtils');
const Offline26 = require('../models/Offline26'); // Import Offline25 model
const newStudent = require('../models/newStudent'); // Import newStudent model
const cosStudent = require('../models/cos_student'); //COS Students

const isDbReady = () => mongoose.connection.readyState === 1;
const cleanPhoneNumber = (phone = '') => phone.trim().replace(/\D/g, '');

const dryRunStudents = new Map();
const dryRunScores = new Map();
const dryRunContest = {
    contest: 'Math Logic Challenge',
    startTime: new Date(Date.now() - 60 * 1000),
    endTime: new Date(Date.now() + 60 * 60 * 1000),
    questions: [
        {
            questionId: 1,
            letter: 'A',
            title: 'Lost Sequences in Number Maze',
            content: 'Stuart and Bob devise a path to follow.\nStuart writes down the first six intervals for a break:\n0 1 2 3 4 5\nEach subsequent interval is the last digit of the sum of the previous six intervals.\nStuart starts scribbling down the entire sequence of intervals.\nHelp Bob find out which of the following subsequences will never occur.\n\nA) 1 3 5 7 9\nB) 9 7 5 3 1\nC) 3 1 5 9 7\nD) All\n\nType 1 for A, 2 for B, 3 for C, and 4 for D.',
            answer: '1',
            points: 300
        },
        {
            questionId: 2,
            letter: 'B',
            title: 'Bamboo Breakfast: Slicing to Share',
            content: 'A group of 60 explorers find themselves with only 47 identical bamboo sticks for breakfast.\nTo ensure fairness, they decide that each person must receive an exactly equal portion of bamboo.\nThey have a sharp sword that can be used to cut through several sticks at once.\nWhat is the minimum number of cuts required to divide the 47 bamboo sticks so that all 60 explorers receive equal shares?\n\n(Note: A single cut can go through multiple sticks at once.)',
            answer: '3',
            points: 600
        },
        {
            questionId: 3,
            letter: 'C',
            title: "The Leader's Last Apple",
            content: 'Thor places two boxes - one containing 15 apples and the other containing 12 apples. He tells Dora that a person can either eat an equal number of apples from both boxes or any number of apples from just one box.\nThe player who eats the last apple wins. Thor then asks Dora to make the first move.\nHow many apples should Dora eat in her first move to ensure a win?',
            answer: '16',
            points: 1000
        }
    ]
};

const getDryRunStudentKey = (email, phone) => `${email.trim().toLowerCase()}::${cleanPhoneNumber(phone)}`;

const getContestStartTime = async () => {
    if (!isDbReady()) return dryRunContest.startTime;

    const contest = await Contest.findOne()
        .sort({ createdAt: -1 })
        .select('startTime');

    return contest?.startTime || null;
};

const isRegistrationClosed = async () => {
    const contestStartTime = await getContestStartTime();
    return Boolean(contestStartTime && new Date() >= contestStartTime);
};
 
const checkContestStudent = async (rollNumber, phone) => {
    const cleanRollNumber = rollNumber.trim().toUpperCase();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const student = await Offline26.findOne({ rollNumber: cleanRollNumber });

    if (!student) return null;

    const isStudent1 = student.contact1 === cleanPhone;
    const isStudent2 = student.contact2 === cleanPhone;

    if (!isStudent1 && !isStudent2) return null;

    return {
        exists: true,
        name: isStudent1 ? student.name1 : student.name2,
        email: isStudent1 ? student.email1 : student.email2,
        phone: isStudent1 ? student.contact1 : student.contact2,
        school: isStudent1 ? student.school1 : student.school2,
        studentType: 'offline',
        rollNumber: cleanRollNumber
    };
};

router.post('/auth/check-student', async (req, res) => {
    try {
        const { rollNumber, phone } = req.body;

        if (!rollNumber || !phone) {
            return res.status(400).json({ exists: false, message: 'Roll number and phone number are required' });
        }

        const student = await checkContestStudent(rollNumber, phone);

        if (!student) {
            return res.json({ exists: false, message: 'Student not found or details do not match.' });
        }

        res.json(student);
    } catch (error) {
        console.error('Contest auth check-student error:', error);
        res.status(500).json({ exists: false, message: 'Internal server error' });
    }
});

const registerNewStudent = async (req, res) => {
    try {
        const { name, email, phone, school, city } = req.body;

        if (!name || !email || !phone || !school || !city) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (await isRegistrationClosed()) {
            return res.status(403).json({
                success: false,
                message: 'Registration closed. Contest has started.'
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = cleanPhoneNumber(phone);

        if (!isDbReady()) {
            const studentKey = getDryRunStudentKey(cleanEmail, cleanPhone);
            if (dryRunStudents.has(studentKey)) {
                return res.json({
                    success: false,
                    message: 'Student already exists. Please sign in.',
                    shouldSignIn: true
                });
            }

            dryRunStudents.set(studentKey, {
                name: name.trim(),
                email: cleanEmail,
                phone: cleanPhone,
                school: school.trim(),
                city: city.trim(),
                studentType: 'new'
            });

            return res.json({ success: true, message: 'Dry-run registration successful. Please sign in.' });
        }

        const existingStudent = await newStudent.findOne({
            $or: [{ email: cleanEmail }, { phone: cleanPhone }]
        });

        if (existingStudent) {
            return res.json({
                success: false,
                message: 'Student already exists. Please sign in.',
                shouldSignIn: true
            });
        }

        await newStudent.create({
            name: name.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            school: school.trim(),
            city: city.trim(),
            registered: true
        });

        res.json({ success: true, message: 'Registration successful. Please sign in.' });
    } catch (error) {
        console.error('Contest new student registration error:', error);
        res.status(500).json({ success: false, message: 'Error registering student' });
    }
};

router.post('/auth/register-new', registerNewStudent);
router.post('/auth/signup', registerNewStudent);

router.post('/auth/signin-new', async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (!email || !phone) {
            return res.status(400).json({ success: false, message: 'Email and phone number are required' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = cleanPhoneNumber(phone);

        if (!isDbReady()) {
            const student = dryRunStudents.get(getDryRunStudentKey(cleanEmail, cleanPhone)) || {
                name: 'Dry Run Student',
                email: cleanEmail,
                phone: cleanPhone,
                city: 'Local',
                school: 'Local Test School',
                studentType: 'new'
            };

            dryRunStudents.set(getDryRunStudentKey(cleanEmail, cleanPhone), student);

            return res.json({
                success: true,
                name: student.name,
                email: student.email,
                phone: student.phone,
                city: student.city,
                school: student.school,
                studentType: 'new',
                dryRun: true
            });
        }

        const student = await newStudent.findOne({
            email: cleanEmail,
            phone: cleanPhone
        });

        if (!student) {
            return res.json({ success: false, message: 'Student not found. Please sign up first.' });
        }

        res.json({
            success: true,
            name: student.name,
            email: student.email,
            phone: student.phone,
            city: student.city,
            school: student.school,
            studentType: 'new'
        });
    } catch (error) {
        console.error('Contest new student signin error:', error);
        res.status(500).json({ success: false, message: 'Error signing in student' });
    }
});

// Start contest
router.post('/contest/start', async (req, res) => {
    try {
        const { phone, name, school, studentType } = req.body;
        
        console.log('Received start request:', { phone, name, school, studentType });
        
        if (!phone || !name || !school || !studentType) {
            return res.status(400).json({ 
                message: 'Phone number, name, school and student type are required' 
            });
        }

        // Validate student type
        if (!['offline', 'online','cos', 'new'].includes(studentType)) {
            return res.status(400).json({
                message: 'Invalid student type. Must be offline, online, or new'
            });
        }

        const cleanPhone = cleanPhoneNumber(phone);

        if (!isDbReady()) {
            const existingContest = dryRunScores.get(cleanPhone);
            if (existingContest?.isStarted) {
                return res.status(403).json({
                    allowed: false,
                    message: 'You have already attempted this contest'
                });
            }

            const sessionToken = crypto.randomBytes(32).toString('hex');
            const contest = {
                phone: cleanPhone,
                name,
                school,
                student: studentType,
                startTime: new Date(),
                endTime: new Date(Date.now() + 60 * 60 * 1000),
                isStarted: true,
                isCompleted: false,
                sessionId: sessionToken,
                answers: [],
                scores: { question1: 0, question2: 0, question3: 0, total: 0 }
            };

            dryRunScores.set(cleanPhone, contest);

            return res.json({
                allowed: true,
                success: true,
                message: 'Dry-run contest started successfully',
                startTime: contest.startTime.toISOString(),
                endTime: contest.endTime.toISOString(),
                sessionToken,
                studentType
            });
        }
        
        // Check if already participated
        const existingContest = await ContestScore.findOne({ phone: cleanPhone });
        if (existingContest) {
            if (existingContest.isStarted) {
                return res.status(403).json({
                    allowed: false,
                    message: 'You have already attempted this contest'
                });
            }

            existingContest.isStarted = true;
            existingContest.startTime = new Date();
            existingContest.endTime = new Date(Date.now() + 60 * 60 * 1000);
            existingContest.sessionId = crypto.randomBytes(32).toString('hex');
            await existingContest.save();

            return res.status(200).json({
                allowed: true,
                success: true,
                message: 'Contest started successfully',
                startTime: existingContest.startTime.toISOString(),
                endTime: existingContest.endTime.toISOString(),
                sessionToken: existingContest.sessionId,
                studentType
            });
        }

        console.log('Creating contest for student type:', studentType);

        // Create new contest with student type
        const contest = new ContestScore({
            phone: cleanPhone,
            name: name,
            school: school,
            student: studentType,  // Store the student type
            startTime: new Date(),
            endTime: new Date(Date.now() + 60 * 60 * 1000),
            isStarted: true,
            isCompleted: false,
            questionsAttempted: 0,
            answers: [],
            scores: {
                question1: 0,
                question2: 0,
                question3: 0,
                total: 0
            }
        });
        
        // Generate session token
        const sessionToken = crypto.randomBytes(32).toString('hex');
        contest.sessionId = sessionToken;

        await contest.save();

        res.json({ 
            allowed: true,
            success: true, 
            message: 'Contest started successfully',
            startTime: contest.startTime.toISOString(),
            endTime: contest.endTime.toISOString(),
            sessionToken,
            studentType  // Return the student type in response
        });

    } catch (error) {
        console.error('Contest start error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error starting contest',
            details: error.message 
        });
    }
});

router.get('/contest/score', async (req, res) => {
    try {
        const { phone } = req.query;

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        if (!isDbReady()) {
            const contestScore = dryRunScores.get(cleanPhoneNumber(phone));
            return res.json({
                isStarted: Boolean(contestScore?.isStarted),
                isCompleted: Boolean(contestScore?.isCompleted)
            });
        }

        const contestScore = await ContestScore.findOne({
            phone: cleanPhoneNumber(phone)
        });

        res.json({
            isStarted: Boolean(contestScore?.isStarted),
            isCompleted: Boolean(contestScore?.isCompleted)
        });
    } catch (error) {
        console.error('Contest score status error:', error);
        res.status(500).json({ message: 'Error fetching contest score status' });
    }
});

// Submit answer
router.post('/contest/submit', async (req, res) => {
    try {
        const { questionId, answer, phone, timeSpentArray } = req.body;
        const submissionTime = new Date();

        if (!isDbReady()) {
            const cleanPhone = cleanPhoneNumber(phone);
            const contestScore = dryRunScores.get(cleanPhone);
            if (!contestScore) {
                return res.status(404).json({ message: 'Contest not found' });
            }

            const question = dryRunContest.questions.find(q => q.questionId === questionId);
            if (!question) {
                return res.status(404).json({ message: 'Question not found' });
            }

            const normalizedAnswer = String(answer || '').trim().toLowerCase();
            const isCorrect = normalizedAnswer === String(question.answer).toLowerCase();
            const score = isCorrect ? question.points : 0;
            const newAnswer = {
                questionId,
                answer,
                submissionTime,
                timeSpentArray,
                totalTimeSpent: Array.isArray(timeSpentArray) ? timeSpentArray.reduce((sum, time) => sum + time, 0) : 0,
                attempted: true,
                isCorrect,
                score
            };

            const existingAnswerIndex = contestScore.answers.findIndex(a => a.questionId === questionId);
            if (existingAnswerIndex !== -1) {
                contestScore.answers[existingAnswerIndex] = newAnswer;
            } else {
                contestScore.answers.push(newAnswer);
            }

            contestScore.scores[`question${questionId}`] = score;
            contestScore.scores.total = contestScore.answers.reduce((total, ans) => total + ans.score, 0);
            dryRunScores.set(cleanPhone, contestScore);

            return res.json({
                success: true,
                isCorrect,
                score,
                totalScore: contestScore.scores.total,
                questionScores: contestScore.scores
            });
        }

        let contestScore = await ContestScore.findOne({ phone });
        if (!contestScore) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        // Get question from contest model
        const contest = await Contest.findOne().sort({ createdAt: -1 });
        const question = contest.questions.find(q => q.questionId === questionId);
        
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check answer correctness
        const isCorrect = answer.toLowerCase() === question.answer.toLowerCase();
        
        // Calculate total time spent and visit count
        const totalTimeSpent = timeSpentArray.reduce((sum, time) => sum + time, 0);
        const visitCount = timeSpentArray.length; // Calculate visit count from array length
        
        // Calculate score
        let score;
        if (isCorrect) {
            switch(questionId) {
                case 1: 
                    score = Math.max(0, 300 - (totalTimeSpent/20000)); 
                    break;  // Add break statement here
                case 2: 
                    score = Math.max(0, 600 - (totalTimeSpent/15000)); 
                    break;
                case 3: 
                    score = Math.max(0, 1000 - (totalTimeSpent/10000)); 
                    break;
                default: 
                    score = 0;
            }
        } else {
            // Negative score for wrong answers
            score = -(totalTimeSpent/20000);
        }

        // Create new answer with visit count
        const newAnswer = {
            questionId,
            answer,
            submissionTime,
            timeSpentArray, // Store the full array
            totalTimeSpent,
            visitCount,    // Include visit count
            attempted: true,
            isCorrect,
            score: Math.round(score)
        };

        // Add or update answer
        const existingAnswerIndex = contestScore.answers.findIndex(a => a.questionId === questionId);
        if (existingAnswerIndex !== -1) {
            // Merge existing timeSpentArray with new times
            const existingAnswer = contestScore.answers[existingAnswerIndex];
            newAnswer.timeSpentArray = [...new Set([...existingAnswer.timeSpentArray, ...timeSpentArray])];
            newAnswer.visitCount = newAnswer.timeSpentArray.length;
            contestScore.answers[existingAnswerIndex] = newAnswer;
        } else {
            contestScore.answers.push(newAnswer);
        }

        // After updating the answer:

        // Update questionsAttempted if this is a new question
        if (existingAnswerIndex === -1) {
            contestScore.questionsAttempted += 1;
        }

        // Update question score in scores object
        contestScore.scores[`question${questionId}`] = Math.round(score);
        
        // Calculate total score
        contestScore.scores.total = contestScore.answers.reduce((total, ans) => total + ans.score, 0);

        // Save all changes
        await contestScore.save();

        // Send response with updated scores
        res.json({
            success: true,
            isCorrect,
            score: Math.round(score),
            timeSpentArray: newAnswer.timeSpentArray,
            totalTimeSpent: newAnswer.totalTimeSpent,
            visitCount: newAnswer.visitCount, // Send the actual visit count
            totalScore: contestScore.scores.total,
            questionScores: {
                question1: contestScore.scores.question1,
                question2: contestScore.scores.question2,
                question3: contestScore.scores.question3
            }
        });

    } catch (error) {
        console.error('Submit error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// End contest
router.post('/contest/end', async (req, res) => {
    try {
        const { phone } = req.body;
        
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        if (!isDbReady()) {
            const cleanPhone = cleanPhoneNumber(phone);
            const contest = dryRunScores.get(cleanPhone);
            if (!contest || !contest.isStarted || contest.isCompleted) {
                return res.status(404).json({ message: 'No active contest found' });
            }

            contest.isCompleted = true;
            contest.endTime = new Date();
            contest.totalTimeSpent = Math.floor((contest.endTime - contest.startTime) / 1000);
            dryRunScores.set(cleanPhone, contest);

            return res.json({
                message: 'Dry-run contest ended successfully',
                endTime: contest.endTime,
                totalTimeSpent: contest.totalTimeSpent,
                scores: contest.scores,
                shouldClearStorage: true
            });
        }

        const contest = await ContestScore.findOne({ 
            phone: phone.trim(),
            isStarted: true,
            isCompleted: false
        });

        if (!contest) {
            return res.status(404).json({ message: 'No active contest found' });
        }

        // Update contest status
        contest.isCompleted = true;
        contest.endTime = new Date();
        contest.totalTimeSpent = Math.floor((contest.endTime - contest.startTime) / 1000);

        // Calculate final scores
        contest.calculateScore();

        await contest.save();

        res.json({ 
            message: 'Contest ended successfully',
            endTime: contest.endTime,
            totalTimeSpent: contest.totalTimeSpent,
            scores: contest.scores,
            shouldClearStorage: true
        });
    } catch (error) {
        console.error('Error ending contest:', error);
        res.status(500).json({ 
            message: 'Error ending contest',
            error: error.message 
        });
    }
});

// Get contest times
router.get('/contest/times', async (req, res) => {
    try {
        const { phone, sessionId } = req.query;

        if (!isDbReady()) {
            const userContest = phone ? dryRunScores.get(cleanPhoneNumber(phone)) : null;
            const individualTimer = userContest && sessionId === userContest.sessionId ? {
                startTime: userContest.startTime.toISOString(),
                endTime: userContest.endTime.toISOString(),
                timeLeft: Math.max(0, userContest.endTime - new Date())
            } : null;

            return res.json({
                schedule: {
                    startTime: dryRunContest.startTime.toISOString(),
                    endTime: dryRunContest.endTime.toISOString(),
                },
                individualTimer,
                timezone: 'Asia/Kolkata',
                dryRun: true
            });
        }

        // Get global contest schedule
        const contestSchedule = await Contest.findOne()
            .sort({ createdAt: -1 })
            .select('startTime endTime');

        if (!contestSchedule) {
            return res.status(404).json({ message: 'No contest schedule found' });
        }

        // Convert contest schedule times to IST
        const scheduleStartIST = convertToIST(contestSchedule.startTime);
        const scheduleEndIST = convertToIST(contestSchedule.endTime);

        // If phone and sessionId provided, get individual timer
        let individualTimer = null;
        if (phone && sessionId) {
            const userContest = await ContestScore.findOne({
                phone,
                sessionId,
                isStarted: true,
                isCompleted: false
            });

            if (userContest) {
                const contestStartIST = convertToIST(userContest.startTime);
                const contestEndIST = convertToIST(userContest.endTime);
                const nowIST = convertToIST(new Date());

                individualTimer = {
                    startTime: contestStartIST.toISOString(),
                    endTime: contestEndIST.toISOString(),
                    timeLeft: Math.max(0, contestEndIST - nowIST)
                };
            }
        }

        res.json({
            schedule: {
                startTime: scheduleStartIST.toISOString(),
                endTime: scheduleEndIST.toISOString(),
            },
            individualTimer,
            timezone: 'Asia/Kolkata'
        });

    } catch (error) {
        console.error('Error fetching times:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get contest dates
router.get('/contest/dates', async (req, res) => {
    try {
        if (!isDbReady()) {
            return res.json({
                startTime: dryRunContest.startTime.toISOString(),
                endTime: dryRunContest.endTime.toISOString(),
                timezone: 'Asia/Kolkata',
                dryRun: true
            });
        }

        const contest = await Contest.findOne()
            .sort({ createdAt: -1 })
            .select('startTime endTime');
        
        if (!contest) {
            return res.status(404).json({ message: 'No contest found' });
        }

        // Convert times to IST
        const istStartTime = convertToIST(contest.startTime);
        const istEndTime = convertToIST(contest.endTime);

        res.json({
            startTime: istStartTime.toISOString(),
            endTime: istEndTime.toISOString(),
            timezone: 'Asia/Kolkata'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contest dates' });
    }
});

router.get('/contest/status', async (req, res) => {
    try {
        if (!isDbReady()) {
            const now = new Date();
            return res.json({
                isContestActive: now >= dryRunContest.startTime && now <= dryRunContest.endTime,
                dryRun: true
            });
        }

        const contest = await Contest.findOne()
            .sort({ createdAt: -1 })
            .select('startTime endTime');

        if (!contest) {
            return res.status(404).json({ message: 'No contest found', isContestActive: false });
        }

        const now = new Date();
        res.json({
            isContestActive: now >= contest.startTime && now <= contest.endTime
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contest status', isContestActive: false });
    }
});

// Get question by ID
router.get('/contest/questions/:id', async (req, res) => {
    try {
        const questionId = parseInt(req.params.id);

        if (!isDbReady()) {
            const question = dryRunContest.questions.find(q => q.questionId === questionId);
            if (!question) {
                return res.status(404).json({ message: 'Question not found' });
            }

            return res.json({
                title: question.title,
                content: question.content,
                points: question.points,
                letter: question.letter,
                dryRun: true
            });
        }
        
        // Find the latest contest and get the specific question
        const contest = await Contest.findOne()
            .sort({ createdAt: -1 })
            .select('questions');

        if (!contest) {
            return res.status(404).json({ message: 'No contest found' });
        }

        const question = contest.questions.find(q => q.questionId === questionId);
        
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Return question without the answer
        res.json({
            title: question.title,
            content: question.content,
            points: question.points,
            letter: question.letter
        });
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ message: 'Error fetching question' });
    }
});

// Get leaderboard
router.get('/contest/leaderboard', async (req, res) => {
    try {
        // First check if leaderboard should be shown
        const announcement = await Announcement.findOne({ id: 1 });
        if (!announcement) {
            return res.status(403).json({ 
                message: 'Leaderboard is not yet available',
                showLeaderboard: false
            });
        }

        // Get all completed contests with scores
        const leaderboard = await ContestScore.find({ 
            isCompleted: true
        })
        .select('name school scores answers totalTimeSpent')
        .sort({ 'scores.total': -1, totalTimeSpent: 1 }) // Sort by total score (desc) and time (asc)
        .limit(100); // Limit to top 100

        // Update the leaderboard route's formatting logic:

        const formattedLeaderboard = leaderboard.map(entry => {
            const questionStatus = {
                A: { status: 'not-attempted', time: null },
                B: { status: 'not-attempted', time: null },
                C: { status: 'not-attempted', time: null }
            };

            // Map answers to their respective questions
            entry.answers.forEach(answer => {
                const letter = String.fromCharCode(64 + answer.questionId); // Convert 1,2,3 to A,B,C
                questionStatus[letter] = {
                    status: answer.isCorrect ? 'correct' : (answer.attempted ? 'incorrect' : 'not-attempted'),
                    time: answer.totalTimeSpent ? Math.floor(answer.totalTimeSpent/1000) : null, // Convert to seconds
                    score: answer.score // Include the score
                };
            });

            return {
                name: entry.name,
                school: entry.school,
                totalScore: Math.round(entry.scores.total), // Ensure total score is rounded
                totalTime: entry.totalTimeSpent,
                questionA: questionStatus.A,
                questionB: questionStatus.B,
                questionC: questionStatus.C
            };
        });

        res.json({
            showLeaderboard: true,
            data: formattedLeaderboard
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
});

module.exports = router;
