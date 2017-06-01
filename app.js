//require express, pg, sequelize, bodyparser
const express = require('express');
const app = express();
const Sequelize = require('sequelize');
const db = new Sequelize('postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/nodeblog');
const bodyParser = require('body-parser')();

app.use('/', bodyParser);
app.use(express.static('public'));

app.set('views', 'views');
app.set('view engine', 'pug');

//Creating tables necessary for login + posts/comments
const User = db.define('user', {
	username: Sequelize.STRING,
	firstname: Sequelize.STRING,
	lastname: Sequelize.STRING,
	email: Sequelize.STRING
});

const Post = db.define('post', {
	title: Sequelize.STRING,
	body: Sequelize.STRING
})

const Comment = db.define('comment', {
	body: Sequelize.STRING
})

//Creating all routes first
app.get('/', (req, res) => {
	//homepage
	res.render('index');
});

app.get('/register', (req, res) => {
	//register account route
});

app.post('/register', (req, res) => {
	//register account route
});

app.get('/login', (req, res) => {
	//login account get route
});

app.post('/login', (req, res) => {
	//login area
});

app.get('/', (req, res) => {
	//redirect to homepage when logout
});

app.get('/', (req, res) => {
	//view all own posts
});

app.get('/', (req, res) => {
	//view specific post + ajax
});

const server = app.listen(3000, () => {
	console.log("The server has started at port:" + server.address().port);
});