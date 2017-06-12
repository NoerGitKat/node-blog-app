/* --------------------------------------------------------------------------------------------- */
										  /*SETTINGS*/

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const Sequelize = require('sequelize');
const db = new Sequelize('nodeblog', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	host: 'localhost',
	dialect: 'postgres',
	define: {
		timestamps: false
	}
});

app.use('/', bodyParser());
app.use(express.static('public'));

app.set('views', 'views');
app.set('view engine', 'pug');

//Create a session
app.use(session({
	secret: process.env.SECRET_SESSION,
	resave: false,
	saveUninitialized: true
}));

/* --------------------------------------------------------------------------------------------- */
										  /*MODELS*/

//Creating models for user + posts + comments
var User = db.define('user', {
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

var Post = db.define('post', {
	title: {
		type: Sequelize.STRING,
	},
	body: {
		type: Sequelize.TEXT,
		unique: true
	}
});

var Comment = db.define('comment', {
	body: {
		type: Sequelize.STRING
	}
});

/* --------------------------------------------------------------------------------------------- */
										/*RELATIONSHIPS*/

//Establishing relationships between models
User.hasMany(Post);
User.hasMany(Comment);
Post.belongsTo(User);
Post.hasMany(Comment);
Comment.belongsTo(User);
Comment.belongsTo(Post);

db.sync();

/* --------------------------------------------------------------------------------------------- */
										  /*ROUTES*/

//Homepage
app.get('/', (req, res) => {
	var user = req.session.user; 
	if (user == undefined) {
		res.render('index');
		return
	} else {
		res.render('index2');
	}
});

//Register page
app.get('/register', (req, res) => {
	res.render('register');			
});

app.post('/register', (req, res) => {						//Register user info in table User
	User.create({
		username: req.body.username,
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		email: req.body.email,
		password: req.body.password
		})
	.catch((error) => console.log('Oh noes! An error has occurred! Kill it with fire!', error));
	res.redirect('/login');
});

//Login page
app.get('/login', (req, res) => {
	res.render('login');		
});

app.post('/login', (req, res) => {
	// find matching data between input and users in db
		User.findOne({
			where: {
				username: req.body.username
			}
		})
		.then((user) => {
			if (user !== null && req.body.password === user.password) {
				req.session.user = user;				//this starts session for user
				res.redirect('/profile');
			} else {
				res.redirect('/login?message=' + encodeURIComponent("Invalid username or password."));
			}
		})
		.catch((error) => {
			res.redirect('/?message=' + encodeURIComponent('Error has occurred. Please check the server.'));
		});
});
	
//Profile page
app.get('/profile', (req, res) => {
	var user = req.session.user;
    if (user === undefined) {				//only accessible for logged in users
        res.redirect('/login?message=' + encodeURIComponent("Please log in to view your profile."));
    } else {
        res.render('profile', {
            user: user
        });
    }
});

//User's posts page
app.get('/myposts', (req, res) => {
	var user = req.session.user;
    if (user === undefined) {				//only accessible for logged in users
        res.redirect('/login?message=' + encodeURIComponent("Please log in to view your posts."));
        return;
    } else {
    	User.findAll()
    	.then((users) => {
    		Post.findAll({
				where: {
					userId: user.id
				},
				include: [{
					model: Comment,
					as: 'comments'
					}]
			})
			.then((posts) => {
				res.render('myposts', {
					users: users, 
					posts: posts
				})
			})
    	})
		.catch((error) => {
			console.log('Oh noes! An error has occurred! Kill it with fire!', error);
			res.redirect('/?message=' + encodeURIComponent('Error has occurred. Please check the server.'));
		});
	}
});

//Create a new post page
app.get('/newpost', (req,res) => {
	var user = req.session.user;
    if (user === undefined) {				//only accessible for logged in users
        res.redirect('/login?message=' + encodeURIComponent("Please log in to create a new post."));
    } else {
    	res.render('newpost');
    }
})

app.post('/newpost', (req, res) => {				
	var user = req.session.user;
	Post.create({						//sync to database for input new row Post
		title: req.body.title,
		body: req.body.body,
		userId: user.id || 0 //if it does not exist it is a 0, which means something is wrong
		})
	.then(() => {
			res.redirect('/myposts');
	})
	.catch((error) => {
			console.log('Oh noes! An error has occurred! Kill it with fire!', error);
			res.redirect('/?message=' + encodeURIComponent('Error has occurred. Please check the server.'));
	});
});

//View everybody's posts page
app.get('/viewall', (req, res) => {
	var user = req.session.user;
	if (user === undefined) {				//only accessible for logged in users
        res.redirect('/login?message=' + encodeURIComponent("Please log in to view all posts."));
    } else {
    	User.findAll()			//find User and Post data for use in /viewall
    	.then((users) => {
    		Post.findAll({
    			include: [{				//show posts including comments
    				model: Comment,
    				as: 'comments'
    			}]
    		})
			.then((posts) => {
					res.render('viewall', {
						posts: posts,
						users: users,
					})
			})
    	})
		.catch((error) => {
			console.log('Oh noes! An error has occurred! Kill it with fire!', error);
			res.redirect('/?message=' + encodeURIComponent('Error has occurred. Please check the server.'));
		});
	}
});

//Comment route
app.post('/comment', (req, res) => {
	var user = req.session.user;
	User.findOne({
		where: {
			username: user.username
		}
	})
	.then((user) => {
		return Comment.create({
				body: req.body.comment,
				postId: req.body.postId,
				userId: user.id
			})
		.then(() => {
				res.redirect('/viewall');
			})
		})
	.catch((error) => {
			console.log('Oh noes! An error has occurred! Kill it with fire!', error);
			res.redirect('/?message=' + encodeURIComponent('Error has occurred. Please check the server.'));
	})
});

//Log out route that redirects to home
app.get('/logout', (req, res) => {
	req.session.destroy(function(error) {			//destroy session after logout
		if(error) {
			throw error;
		}
		res.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	});
});

/* --------------------------------------------------------------------------------------------- */
											/*SERVER PORT*/

const server = app.listen(3000, () => {
	console.log("The server has started at port:" + server.address().port);
});