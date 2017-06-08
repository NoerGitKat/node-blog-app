const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const Sequelize = require('sequelize');
const db = new Sequelize('nodeblog', 'postgres' /*process.env.POSTGRES_USER*/, 'Blabla_55' /*process.env.POSTGRES_PASSWORD*/, {
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
	secret: 'omg this is too secret to talk about' /*process.env.SECRET_SESSION*/,
	resave: false,
	saveUninitialized: true
}));

/* --------------------------------------------------------------------------------------------- */

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

//Establishing relationships between models
User.hasMany(Post);
User.hasMany(Comment);
Post.belongsTo(User);
Post.hasMany(Comment);
Comment.belongsTo(User);
Comment.belongsTo(Post);

/* --------------------------------------------------------------------------------------------- */

//Routes
app.get('/', (req, res) => {
	res.render('index');			//homepage
});

app.get('/register', (req, res) => {
	res.render('register');			//register page
});

app.post('/register', (req, res) => {						//sync to database for input new row
	User.create({
		username: req.body.username,
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		email: req.body.email,
		password: req.body.password
	})
	.catch(error => console.log('Oh noes! An error has occurred! Kill it with fire!', error));

	res.redirect('/login');
});

app.get('/login', (req, res) => {
	res.render('login');		//login page
});

app.post('/login', (req, res) => {
	if (req.body.username == undefined) {
		res.redirect('/login?message=' + encodeURIComponent("Invalid username or password."));
	} 
	if (req.body.password == undefined) {
		res.redirect('/login?message=' + encodeURIComponent("Invalid username or password."));
	} 
	else {
	// find matching data between input and users in db
		User.findOne({
			where: {
				username: user.username
			}
		})
		.then((user) => {
			if (user !== null && req.body.password === user.password) {
				req.session.user = user;				//this starts session for user
				res.redirect('/profile');
			} else {
				res.redirect('/?message=' + encodeURIComponent("Invalid username or password."));
			}
		})
		.catch( (error) => {
			res.redirect('/?message=' + encodeURIComponent("Invalid username or password."));
		});
	}
});
	

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

app.get('/myposts', (req, res) => {
	var user = req.session.user;
    if (user === undefined) {				//only accessible for logged in users
        res.redirect('/login?message=' + encodeURIComponent("Please log in to view your posts."));
    } else {
		Post.findAll({
			where: {
				user: user.username
			}
		})
		.then((posts) => {
			res.render('myposts', { 
				posts: posts
			});
		})
	}
});

app.get('/newpost', (req,res) => {
	var user = req.session.user;
    if (user === undefined) {				//only accessible for logged in users
        res.redirect('/login?message=' + encodeURIComponent("Please log in to view your posts."));
    } else {
    	res.render('newpost');
    }
})

app.post('/newpost', (req, res) => {				
	Post.create({						//sync to database for input new row Post
		title: req.body.title,
		body: req.body.body,
		userId: req.session.user.id || 0 //if it does not exist it is a 0, which means something is wrong
	})
	.catch(error => console.log('Oh noes! An error has occurred! Kill it with fire!', error));
	res.redirect('/myposts')
});

app.get('/viewall', (req, res) => {
	//query database for all posts, no filter
	//render view w/ all posts
	db.sync()
	.then(() => {
		Post.findAll()
		.then((posts) => {
			res.render('viewall', {
				posts: posts
			})
		})
	})
})

app.get('/logout', (req, res) => {
	req.session.destroy(function(error) {			//destroy session after logout
		if(error) {
			throw error;
		}
		res.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	});
});

/* --------------------------------------------------------------------------------------------- */

const server = app.listen(3000, () => {
	console.log("The server has started at port:" + server.address().port);
});