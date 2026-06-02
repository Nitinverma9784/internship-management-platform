import { Request, Response } from 'express';
import UserProfileModel from '../models/User.js';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserProfileModel.find({});
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updated = await UserProfileModel.findOneAndUpdate({ id }, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, companyName } = req.body;
    const updated = await UserProfileModel.findOneAndUpdate(
      { id }, 
      { role, companyName: role === 'Company' ? companyName : undefined }, 
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = new UserProfileModel(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await UserProfileModel.findOneAndDelete({ id });
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
