//require express, pg, sequelize, bodyparser
const app = require('express')();
const Sequelize = require('sequelize');
const db = new Sequelize('postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/nodeblog');
const bodyParser = require('body-parser')();

app.use('/', bodyParser);

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

//