import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

const jobApplicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  // Your existing fields
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    default: null, // Default value to null
  },
  amount: {
    type: Number,
    default: null, // Default value to null
  },
  transactionId: {
    type: String,
    default: null, // Default value to null
  },
  creditsAmount: {
    type: Number,
    default: null, // Default value to null
  },
  credits: {
    type: Number,
    default: 0, // Default value to 0
  },
  creditstransactionId: {
    type: String,
    default: null, // Default value to null
  },
  experience: {
    type: Number,
    default: null,
  },
  country: {
    type: String,
    default: null,
  },
  upwork: {
    type: String,
    default: null,
  },
  fiverr: {
    type: String,
    default: null,
  },
  linkedin: {
    type: String,
    default: null,
  },
  facebook: {
    type: String,
    default: null,
  },
  upworkOverview: {
    type: String,
    default: null,
  },
  workSamples: {
    type: String, // Array of strings to store multiple work samples
    default: null,
  },
  skills: {
    type: [String], // Array of strings to store multiple skills
    default: [],
  },
   // New fields
   submittedProposal: {
    type: [String], // Array of strings to store multiple proposal values
    default: [],
  },
  clientTotalSpent: {
    type: Number, // Assuming the client total spent will be stored as a string
    default: null,
  },
  clientRating: {
    type: Number,
    default: null,
  },
  clientLocation: {
    type: [String], // Array of strings to store multiple client locations
    default: [],
  },
  clientBudget: {
    type: Number,
    default: null,
  },
  clientHireRate: {
    type: Number, // Assuming the client hire rate will be stored as a string
    default: null,
  },
  matchingSkills: {
    type: Number,
    default: null,
  },
  alreadyHired: {
    type: Number,
    default: 0,
  },
  alreadyInvites: {
    type: Number,
    default: 0,
  },
  alreadyInterviewing: {
    type: Number,
    default: 0,
  },
  connects:{
    type: Number,
    default: 0,
  },
  // New field for job application history
  jobApplications: [jobApplicationSchema],
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
    expiresIn: "7d",
  });
  return token;
};

export const usersModel = mongoose.model("users", userSchema);

export const validate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email(),
    password: passwordComplexity(),
  });
  return schema.validate(data);
};
