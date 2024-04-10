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
    const jsonData = loadDataQuestion();
    res.render('startquiz', { jsonData: jsonData, title: 'Arcade Quiz' });
});

app.get('/result', (req, res) => {
    const name = req.query.hiddenName;
    const givenAnswers = [];

    for (const key in req.query) {
        if (key.startsWith('q')) {
            givenAnswers.push(req.query[key]);
        }
    }

    const jsonData = loadDataQuestion();

    let score = 0;
    jsonData.forEach((question, index) => {
        if (question.options[question.correctAns - 1] === givenAnswers[index]) {
            score++;
        }
    });

    const percentage = (score / jsonData.length) * 100;

    var name_data = loadDataQuizAppData();

    // var duplicateData = name_data.find((data) => data.name === name);
    // if (duplicateData) {
    //     return res.redirect('/404.hbs');
    // }

    var updatedData = { name: name, percentage: percentage };

    fs.writeFileSync('quiz_app_data.json', JSON.stringify([...name_data, updatedData]));

    name_data.sort((a, b) => b.percentage - a.percentage);

    res.render('result', {
        title: 'Arcade Quiz',
        name: name,
        score: score,
        totalQuestions: jsonData.length,
        percentage: percentage,
        score_data: name_data,
        jsonData:jsonData
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