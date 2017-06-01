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

module.exports = 