const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true, minlength: 6 },
		name: { type: String, required: true, trim: true },
	},
	{ timestamps: true }
);

UserSchema.pre('save', async function hashPassword(next) {
	if (!this.isModified('password')) return next();
	const saltRounds = 10;
	this.password = await bcrypt.hash(this.password, saltRounds);
	return next();
});

UserSchema.methods.comparePassword = function comparePassword(candidate) {
	return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);


