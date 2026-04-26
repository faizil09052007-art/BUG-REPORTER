import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
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
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Exclude password from queries by default
  },
  role: {
    type: String,
    enum: ['admin', 'developer', 'qa', 'stakeholder'],
    default: 'developer'
  },
  avatar: {
    type: String,
    default: 'no-photo.jpg'
  },
  notificationPreferences: {
    ticketCreated:  { type: Boolean, default: true },
    statusChanged:  { type: Boolean, default: true },
    commented:      { type: Boolean, default: false },
    assigned:       { type: Boolean, default: true },
  }
}, { timestamps: true });

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
