import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserProfileModel from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'incipio_secret_key_107';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, college, graduationYear, companyName } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Please enter all required fields.' });
    }

    const existingUser = await UserProfileModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create unique ID prefix
    const rolePrefix = role.toLowerCase();
    const id = `${rolePrefix}-${Date.now()}`;

    const newUser = new UserProfileModel({
      id,
      name,
      email,
      password: hashedPassword,
      role,
      college,
      graduationYear,
      companyName,
      skills: [],
      bio: ''
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    // Exclude password from return
    const userObj = newUser.toObject() as any;
    delete userObj.password;

    res.status(201).json({
      success: true,
      token,
      user: userObj
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password coordinates.' });
    }

    const user = await UserProfileModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email credentials. Account not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password credentials.' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    const userObj = user.toObject() as any;
    delete userObj.password;

    res.json({
      success: true,
      token,
      user: userObj
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userObj = req.user.toObject() as any;
    delete userObj.password;
    res.json(userObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const simulate = async (req: Request, res: Response) => {
  try {
    const { roleType } = req.body;
    if (!roleType || !['admin', 'company', 'faculty'].includes(roleType)) {
      return res.status(400).json({ error: 'Invalid or missing roleType coordinate.' });
    }

    const profiles: Record<string, any> = {
      admin: {
        id: 'sim-admin-101',
        email: 'admin.simulator@spsu.edu',
        name: 'Admin SPSU',
        role: 'Admin',
        studentProfileVerificationStatus: 'Verified',
      },
      company: {
        id: 'sim-company-xebia-101',
        email: 'recruiter.xebia@xebia.com',
        name: 'Xebia Recruiter',
        role: 'Company',
        companyName: 'Xebia',
        recruiterVerificationStatus: 'Genuine',
      },
      faculty: {
        id: 'sim-faculty-spsu-101',
        email: 'facultyspsu@spsu.edu',
        name: 'Faculty SPSU Coordinator',
        role: 'Faculty',
        college: 'SPSU',
        studentProfileVerificationStatus: 'Verified',
      }
    };

    const targetProfile = profiles[roleType];
    let user = await UserProfileModel.findOne({ id: targetProfile.id });

    if (!user) {
      // Create user if not exists
      const hashedPassword = await bcrypt.hash('simulation_password_123', 10);
      user = new UserProfileModel({
        ...targetProfile,
        password: hashedPassword,
        skills: [],
        bio: 'Simulated profile for role testing.'
      });
      await user.save();
    } else {
      // Ensure roles and key verification fields are reset to working states
      user.role = targetProfile.role;
      user.name = targetProfile.name;
      user.email = targetProfile.email;
      if (targetProfile.companyName) {
        user.companyName = targetProfile.companyName;
      }
      if (targetProfile.recruiterVerificationStatus) {
        user.recruiterVerificationStatus = targetProfile.recruiterVerificationStatus;
      }
      if (targetProfile.studentProfileVerificationStatus) {
        user.studentProfileVerificationStatus = targetProfile.studentProfileVerificationStatus;
      }
      if (targetProfile.college) {
        user.college = targetProfile.college;
      }
      await user.save();
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const userObj = user.toObject() as any;
    delete userObj.password;

    res.json({
      success: true,
      token,
      user: userObj
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
