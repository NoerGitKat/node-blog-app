const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const Sequelize = require('sequelize');
const db = new Sequelize('nodeblog', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	host: 'localhost',
	dialect: 'postgres',
	define: {
		timestampts: false
	}
});

app.use('/', bodyParser());
app.use(express.static('public'));

app.set('views', 'views');
app.set('view engine', 'pug');

//Create a session
app.use(session({
	secret: 'omg this is too secret to talk about',
	resave: false,
	saveUninitialized: true
}));

//Creating models for user + posts + comments
const User = db.define('user', {
	username: {
		type: Sequelize.STRING,
    	unique: true
	},
	firstname: {
		type: Sequelize.STRING,
    	unique: true
	},
	lastname: {
		type: Sequelize.STRING,
    	unique: true
	},
	email: {
		type: Sequelize.STRING,
    	unique: true
	}, 
	password: {
		type: Sequelize.STRING
	}
});

const Post = db.define('post', {
	title: {
		type: Sequelize.STRING,
	},
	body: {
		type: Sequelize.TEXT,
		unique: true
	}
});

const Comment = db.define('comment', {
	body: {
		type: Sequelize.STRING
	}
});

//Establishing relationships between models
User.hasMany(Post);
User.hasMany(Comment);
Post.belongsTo(User);
Post.hasMany(Comment);
Comment.belongsTo(User);
Comment.belongsTo(Post);

//Routes
app.get('/', (req, res) => {
	res.render('index');			//homepage
});

app.get('/register', (req, res) => {
	res.render('register');			//register page
});

app.post('/register', (req, res) => {
	db.sync()						//sync to database for input new row
	.then(() => User.create({
		username: req.body.username,
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		email: req.body.email,
		password: req.body.password
	}))
	.catch(error => console.log('Oh noes! An error has occurred! Destroy it with fire!', error));
	//connect to database through sequelize w/ promise
	//insert new data in db
	//redirect to members area w/ posts

});

app.get('/login', (req, res) => {
	res.render('login');		//login page
});

app.post('/login', (req, res) => {
	//check for valid form input 
	//connect to database
	//find match data
	if(req.body.username.length < 3) {
		res.redirect('/', () => { alert('Fill in username!')})
	} else if (req.body.password == undefined) {
		res.redirect('/', () => { alert('Fill in your password!')})
	}

	db.sync()
	.then(() => {
		
	})

});

app.get('/profile', (req, res) => {
	//render profile
	res.render('profile');
});

app.get('/posts', (req, res) => {
	//render posts file with variable
	//connect to database
	//show all posts
	//create option to post new post in posts pug file
	res.render('posts');
});


const server = app.listen(3000, () => {
	console.log("The server has started at port:" + server.address().port);
});