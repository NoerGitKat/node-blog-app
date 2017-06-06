//require express, pg, sequelize, bodyparser
const express = require('express');
const app = express();
const Sequelize = require('sequelize');
const db = new Sequelize('postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/nodeblog');
const bodyParser = require('body-parser')();
const session = require('express-sessions');

app.use('/', bodyParser);
app.use(express.static('public'));

app.set('views', 'views');
app.set('view engine', 'pug');

//Creating tables necessary for login + posts/comments
const User = db.define('user', {
	username: Sequelize.STRING,
	firstname: Sequelize.STRING,
	lastname: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING
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
	res.render('index');			//homepage
});

app.get('/register', (req, res) => {
	res.render('register');			//register page
});

app.post('/register', (req, res) => {
	//connect to database
	//insert new data in db
	//redirect to members area w/ posts

});

app.get('/login', (req, res) => {
	//render login file
});

app.post('/login', (req, res) => {
	//connect to database
	//find match data

});

app.get('/posts', (req, res) => {
	//render posts file with variable
	//connect to database
	//show all posts
	//create option to post new post in posts pug file
});


const server = app.listen(3000, () => {
	console.log("The server has started at port:" + server.address().port);
});