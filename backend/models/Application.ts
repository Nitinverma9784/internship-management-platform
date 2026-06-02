import mongoose, { Schema } from 'mongoose';

const ApplicationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentCollege: { type: String },
  internshipId: { type: String, required: true },
  internshipTitle: { type: String, required: true },
  companyName: { type: String, required: true },
  status: { type: String, required: true, enum: ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'], default: 'Applied' },
  dateApplied: { type: String, required: true },
  coverLetter: { type: String },
  resumeName: { type: String },
  resumeUrl: { type: String },
  offerDetails: { type: String },
  interviewsCount: { type: Number, default: 0 }
}, { timestamps: true });

export const ApplicationModel = mongoose.model('Application', ApplicationSchema);
export default ApplicationModel;
