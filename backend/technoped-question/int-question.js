const temporaryTechnopediaContest = {
    contest: 'Temporary Technopedia Practice Contest',
    year: '2025',
    startTime: new Date('2026-05-10T09:00:00+05:30'),
    endTime: new Date('2027-05-10T18:00:00+05:30'),
    questions: [
        {
            questionId: 1,
            letter: 'A',
            title: 'Switch Mapping',
            content: "The switch box in your new house is in an inconvenient corner of your basement. None of the 250 switches is labeled, and each switch maps to exactly one light. To start, all 250 lights are on. On every trip to your basement, you can switch any number of switches on or off, then inspect the house to see which lights are on and off. What is the minimum number of basement trips needed to map every switch to every light?",
            answer: 8,
            points: 300
        },
        {
            questionId: 2,
            letter: 'B',
            title: 'Pizza Boxes',
            content: 'At a restaurant, pizzas can be ordered only in boxes of 6, 9, and 20. What is the highest number of pizzas that cannot be bought using any combination of these boxes?',
            answer: 43,
            points: 300
        },
        {
            questionId: 3,
            letter: 'C',
            title: 'Pie Cuts',
            content: 'Amber and Bosco each have a pie and may make 81 straight cuts with a knife. Stacking is not allowed, but pieces without crust are allowed. What is the maximum number of pieces that can be made with 81 cuts?',
            answer: 3322,
            points: 300
        },
        {
            questionId: 4,
            letter: 'D',
            title: 'Battleship Guarantee',
            content: 'What is the minimum number of blind shots needed to guarantee hitting a battleship on a 10 by 10 board? The ship is a 4 by 1 rectangle and may be placed anywhere horizontally or vertically.',
            answer: 24,
            points: 300
        },
        {
            questionId: 5,
            letter: 'E',
            title: 'Bridge And Torch',
            content: 'Four superheroes must cross a bridge at night with one torch. Their crossing times are 1, 2, 7, and 10 minutes. At most two can cross at once, and anyone crossing must carry the torch. What is the minimum total time for all four to cross?',
            answer: 17,
            points: 300
        },
        {
            questionId: 6,
            letter: 'F',
            title: 'Prime Circle',
            content: 'Consider a circle containing the numbers from 1 to n, arranged so every adjacent pair sums to a prime. For n = 10, find the total number of valid free circular permutations.',
            answer: 48,
            points: 300
        },
        {
            questionId: 7,
            letter: 'G',
            title: 'Ants On A Rod',
            content: 'Twenty-four ants are placed randomly on a meter-long rod, each facing east or west. They walk at 1 cm/sec. Whenever two ants collide, they reverse directions. How many seconds are needed before you can be certain all ants are off the rod?',
            answer: 100,
            points: 300
        },
        {
            questionId: 8,
            letter: 'H',
            title: 'Rectangle-Free Sticks',
            content: 'Place a stick on each edge of each 1 by 1 cell of an 8 by 8 chessboard. On an edge common to two cells, place exactly one stick. Find the minimum number of sticks to delete so that the remaining sticks do not form any rectangle.',
            answer: 43,
            points: 300
        },
        {
            questionId: 9,
            letter: 'I',
            title: 'Digit Lock',
            content: 'A three-digit lock code has digits that add to 15. The tens digit is twice the hundreds digit, and the ones digit is 3 more than the hundreds digit. What is the code?',
            answer: 369,
            points: 300
        },
        {
            questionId: 10,
            letter: 'J',
            title: 'Robot Grid Walk',
            content: 'A robot starts at (0, 0) and must reach (4, 3), moving only right or up one unit at a time. How many different shortest paths are possible?',
            answer: 35,
            points: 300
        }
    ]
};

module.exports = {
    temporaryTechnopediaContest,
    questions: temporaryTechnopediaContest.questions,
    answers: temporaryTechnopediaContest.questions.map((question) => question.answer)
};
