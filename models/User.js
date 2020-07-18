const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please use a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password: {
    type: String, 
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false  // Basically, we do not want to show password in a query
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enctypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next()
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
})

// Sign JWT and return - (methods - (call instance of User), not static)
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database (log in)
UserSchema.methods.matchPassword = async function(enteredPassword) {
  // bcrypt returns promise
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash pasword token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token - create randomBytes - see crypto documentation
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPassswordToken field
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expire 10min
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;

}

module.exports = mongoose.model('User', UserSchema);