const path = require('path');
const fs = require('fs');
const express = require('express');
const hbs = require('hbs');
const app = express();

const publicDirectoryPath = path.join(__dirname, '/public');
const viewPath = path.join(__dirname, '/templet/views');
const partialPath = path.join(__dirname, '/templet/partials');

const port = process.env.PORT||3000;

app.set('view engine', 'hbs');
app.set('views', viewPath);
hbs.registerPartials(partialPath);
app.use(express.static(publicDirectoryPath));

hbs.registerHelper('addOne', function(value) {
    return value + 1;
});

const loadDataQuestion = () => {
    try {
        const dataString = fs.readFileSync('questions.json');
        return JSON.parse(dataString);
    }
    catch (error) {
        console.error('Error reading questions.json');
        return [];
    }
};

const loadDataQuizAppData = () => {
    try {
        const dataString = fs.readFileSync('quiz_app_data.json');
        return JSON.parse(dataString);
    }
    catch (error) {
        console.error('Error reading quiz_app_data.json');
        return [];
    }
};

app.get('', (req, res) =>
{
    res.render('index',{
        title: 'Arcade Quiz'
    })
})

app.get('/startquiz', (req, res) => {
    const name = req.query.name;

    const existingData = loadDataQuizAppData();
    const jsonData = loadDataQuestion();

    const isDuplicate = existingData.some((data) => data.name === name);

    if (isDuplicate) {
        res.redirect(`/startquiz?duplicate=true`);
    } else {
        res.render('startquiz', {
            title: 'Arcade Quiz',
            jsonData: jsonData
        });
    }
});

app.get('/result', (req, res) => {
    const hiddenName = req.query.hiddenName;
    const givenAnswers = [];

    // Collect all answers from the query parameters (assuming questions start with 'q')
    for (const key in req.query) {
        if (key.startsWith('q')) {
            givenAnswers.push(req.query[key]);
        }
    }

    const jsonData = loadDataQuestion();

    let score = 0;
    jsonData.forEach((question, index) => {
        const correctAnswer = question.options[question.correctAns - 1];
        if (correctAnswer === givenAnswers[index]) {
            score++;
        }
    });

    const percentage = (score / jsonData.length) * 100;

    const existingData = loadDataQuizAppData();

    const updatedData = { name: hiddenName, percentage: percentage };

    const newData = [...existingData, updatedData];

    fs.writeFileSync('quiz_app_data.json', JSON.stringify(newData));

    newData.sort((a, b) => b.percentage - a.percentage);

    res.render('result', {
        title: 'Arcade Quiz',
        name: hiddenName,
        score: score,
        totalQuestions: jsonData.length,
        percentage: percentage,
        score_data: newData,
        jsonData: jsonData
    });
});


app.get('/about', (req, res) =>
{
    res.render('about',{
        title: 'Arcade Quiz'
    })
})

app.listen(port, () =>{
    console.log("server is up on port 3000");
})

app.get('*', (req, res) => {
    res.render('404',{
        title: 'Arcade Quiz',
        errorMessage1: 'Error 404: Page Not Found.',
        errorMessage2: 'Please Check the URL again.'
    })
})