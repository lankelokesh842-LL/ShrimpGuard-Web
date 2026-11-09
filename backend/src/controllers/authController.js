import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'shrimpguard_jwt_super_secret_key_2026_secure', {
    expiresIn: '30d'
  });
};

// @desc    Register a new farmer
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, mobile, email, password, farmLocation } = req.body;

    if (!name || !mobile || !email || !password || !farmLocation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, mobile, email, password, farmLocation'
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    const user = await User.create({
      name,
      mobile,
      email: email.toLowerCase().trim(),
      password,
      farmLocation,
      role: 'farmer'
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        farmLocation: user.farmLocation,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && (await user.matchPassword(password))) {
      if (user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Account suspended. Please contact administrator.'
        });
      }

      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          farmLocation: user.farmLocation,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update farmer profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, mobile, farmLocation, password } = req.body;
    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (farmLocation) user.farmLocation = farmLocation;
    if (password && password.trim().length >= 6) {
      user.password = password;
    }

    const updatedUser = await user.save();
    return res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        farmLocation: updatedUser.farmLocation,
        role: updatedUser.role
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
