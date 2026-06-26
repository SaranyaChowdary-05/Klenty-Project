const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { isJsonFallback } = require('../config/database');
const { getModels } = require('../models/index');
const jsonStore = require('../utils/jsonStore');

const JWT_SECRET = process.env.JWT_SECRET || 'sprinthub_super_secret_jwt_key_2024';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Helper to sign JWT token
const signToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'user' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// Register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, profession, organization, bio, skills, profilePicture } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    let parsedSkills = [];
    if (skills) {
      try {
        parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
      } catch (err) {
        parsedSkills = [skills];
      }
    }

    // Check if profile picture was uploaded as a file
    let profilePicUrl = profilePicture || null;
    if (req.file) {
      // Normalize upload file path
      profilePicUrl = `/uploads/${req.file.filename}`;
    }

    if (isJsonFallback()) {
      const existing = jsonStore.findOneByField('users', 'email', email.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already registered.' });
      }

      const hashedPassword = bcrypt.hashSync(password, 12);
      const newUser = jsonStore.create('users', {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        profession: profession || 'Student',
        organization: organization || null,
        bio: bio || '',
        skills: parsedSkills,
        profilePicture: profilePicUrl,
        role: 'user',
        isActive: true,
        lastLogin: null
      });

      const token = signToken(newUser);
      const userResponse = { ...newUser };
      delete userResponse.password;

      return res.status(201).json({
        success: true,
        message: 'Registration successful (JSON Mode)',
        token,
        user: userResponse
      });
    } else {
      const { User } = getModels();
      const existing = await User.findOne({ where: { email: email.toLowerCase() } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already registered.' });
      }

      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phone: phone || null,
        profession: profession || 'Student',
        organization: organization || null,
        bio: bio || '',
        skills: parsedSkills,
        profilePicture: profilePicUrl,
        role: 'user',
        isActive: true
      });

      const token = signToken(newUser);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: newUser.toJSON()
      });
    }
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    if (isJsonFallback()) {
      const user = jsonStore.findOneByField('users', 'email', email.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      // Update last login
      jsonStore.update('users', user.id, { lastLogin: new Date().toISOString() });

      const token = signToken(user);
      const userResponse = { ...user };
      delete userResponse.password;

      return res.status(200).json({
        success: true,
        message: 'Login successful (JSON Mode)',
        token,
        user: userResponse
      });
    } else {
      const { User } = getModels();
      const user = await User.findOne({ where: { email: email.toLowerCase() } });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = signToken(user);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: user.toJSON()
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get Profile
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (isJsonFallback()) {
      const user = jsonStore.findById('users', userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const userResponse = { ...user };
      delete userResponse.password;
      return res.status(200).json({ success: true, user: userResponse });
    } else {
      const { User } = getModels();
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      return res.status(200).json({ success: true, user: user.toJSON() });
    }
  } catch (error) {
    next(error);
  }
};

// Update Profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phone, profession, organization, bio, skills, profilePicture } = req.body;

    let parsedSkills = undefined;
    if (skills) {
      try {
        parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
      } catch (err) {
        parsedSkills = [skills];
      }
    }

    let profilePicUrl = profilePicture;
    if (req.file) {
      profilePicUrl = `/uploads/${req.file.filename}`;
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (profession !== undefined) updates.profession = profession;
    if (organization !== undefined) updates.organization = organization;
    if (bio !== undefined) updates.bio = bio;
    if (parsedSkills !== undefined) updates.skills = parsedSkills;
    if (profilePicUrl !== undefined) updates.profilePicture = profilePicUrl;

    if (isJsonFallback()) {
      const updated = jsonStore.update('users', userId, updates);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      const userResponse = { ...updated };
      delete userResponse.password;
      return res.status(200).json({ success: true, message: 'Profile updated.', user: userResponse });
    } else {
      const { User } = getModels();
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      await user.update(updates);
      return res.status(200).json({ success: true, message: 'Profile updated.', user: user.toJSON() });
    }
  } catch (error) {
    next(error);
  }
};

// Change Password
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new passwords.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    if (isJsonFallback()) {
      const user = jsonStore.findById('users', userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const isMatch = bcrypt.compareSync(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 12);
      jsonStore.update('users', userId, { password: hashedPassword });

      return res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } else {
      const { User } = getModels();
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }

      user.password = newPassword; // Hooks will automatically hash it
      await user.save();

      return res.status(200).json({ success: true, message: 'Password changed successfully.' });
    }
  } catch (error) {
    next(error);
  }
};

// List Users
exports.listUsers = async (req, res, next) => {
  try {
    if (isJsonFallback()) {
      const users = jsonStore.findAll('users').map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        profession: u.profession,
        profilePicture: u.profilePicture
      }));
      return res.status(200).json({ success: true, users });
    } else {
      const { User } = getModels();
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'profession', 'profilePicture']
      });
      return res.status(200).json({ success: true, users });
    }
  } catch (error) {
    next(error);
  }
};
