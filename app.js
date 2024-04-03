const path = require('path');
const fs = require('fs');
const express = require('express');
const hbs = require('hbs');

const app = express();

const port = process.env.PORT||3000;

const publicDirectoryPath = path.join(__dirname, '/public');
const viewPath = path.join(__dirname, '/templet/views');
const partialPath = path.join(__dirname, '/templet/partials');

app.set('view engine', 'hbs');
app.set('views', viewPath);
hbs.registerPartials(partialPath);

app.use(express.static(publicDirectoryPath));

const jsonData = JSON.parse(fs.readFileSync('questions.json'));

app.get('', (req, res) =>
{
    res.render('index',{
        title: 'Arcade Quiz'
    })
})


app.get('/startquiz', (req, res) => {
    fs.readFile('questions.json', (err, data) => {
        if (err) throw err;
        const jsonData = JSON.parse(data);
        res.render('startquiz', { jsonData: jsonData, title: 'Arcade Quiz' });
    });
});

app.get('/result', (req, res) => {
    // Extracting URL parameters
    const name = req.query.hiddenName;
    const givenAnswers = [];
    for (const key in req.query) {
        if (key.startsWith('q')) {
            givenAnswers.push(req.query[key]);
        }
    }

    // Comparing given answers with correct answers
    let score = 0;
    jsonData.forEach((question, index) => {
        if (question.options[question.correctAns - 1] === givenAnswers[index]) {
            score++;
        }
    });

    const percentage = (score / jsonData.length) * 100;

    // Rendering the result page with the score
    res.render('result', {
        title: 'Arcade Quiz',
        name: name,
        score: score,
        totalQuestions: jsonData.length,
        percentage: percentage
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