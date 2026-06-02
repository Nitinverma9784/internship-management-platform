import { Request, Response } from 'express';
import ApplicationModel from '../models/Application.js';

export const getApplications = async (req: Request, res: Response) => {
  try {
    const apps = await ApplicationModel.find({}).sort({ createdAt: -1 });
    res.json(apps);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createApplication = async (req: Request, res: Response) => {
  try {
    const newApp = new ApplicationModel(req.body);
    await newApp.save();
    res.status(201).json(newApp);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, offerDetails } = req.body;
    const updateObj: any = { status };
    if (offerDetails !== undefined) {
      updateObj.offerDetails = offerDetails;
    }
    const updated = await ApplicationModel.findOneAndUpdate({ id }, updateObj, { new: true });
    if (!updated) return res.status(404).json({ error: 'Application not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const uploadResumePdf = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or invalid file format.' });
    }
    const publicUrl = `/uploads/${req.file.filename}`;
    return res.json({ 
      success: true, 
      filename: req.file.originalname, 
      url: publicUrl 
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
