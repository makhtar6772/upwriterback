import dotenv from "dotenv";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import session from "express-session";
import { usersModel, validate } from "./models/users.js";
import joi from "joi";
import path from "path";

const app = express();
dotenv.config();

app.use(express.json());
const _dirname = path.dirname("");
const buildpath = path.join(_dirname, "../client/dist");
app.use(express.static(buildpath));
app.use(express.urlencoded({ extended: true }));
// CORS Middleware
app.use(
  cors({
    origin: "*",
  })
);

app.use(
  session({
    secret: "your_secret_key_here",
    resave: false,
    saveUninitialized: true,
  })
);

mongoose
  .connect('mongodb+srv://upwriterusers31301:makhtar786@upwriter.lyqkila.mongodb.net/Upwriter?retryWrites=true&w=majority&appName=upwriter')
  .then(() => {
    console.log("Connected!");
  })
  .catch((error) => {
    console.log(error);
  });

app.post("/api/signup", async (req, res) => {
  try {
    const { error, value } = validate(req.body); // Destructure error and value from validate function result
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { firstName, lastName, email, password } = value; // Destructure validated data

    const existingUser = await usersModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = 10;
    const hashPass = await bcrypt.hash(password, saltRounds);
    const userData = await usersModel.create({
      firstName,
      lastName,
      email,
      password: hashPass,
    });
    res
      .status(201)
      .json({ message: "User created successfully", user: userData });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { error, value } = validate(req.body); // Validate the request body
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value; // Destructure validated data

    const user = await usersModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid Email or Password" });
    }

    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const token = user.generateAuthToken();
    res.status(200).json({
      message: "User logged in successfully",
      userId: user._id,
      token,
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// index.js
app.post("/plan", async (req, res) => {
  try {
    const { userId, plan, amount, transactionId } = req.body;

    // Update the user document with plan, amount, and transactionId
    await usersModel.findByIdAndUpdate(userId, {
      plan,
      amount,
      transactionId,
    });

    res
      .status(201)
      .json({ message: "Plan created successfully", plan: newPlan });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/credits", async (req, res) => {
  try {
    const { userId, credits, creditsAmount, creditstransactionId } = req.body;

    // Update the user document with credits information
    await usersModel.findByIdAndUpdate(userId, {
      creditsAmount,
      credits,
      creditstransactionId,
    });
    res
      .status(201)
      .json({ message: "Credits added successfully", credits: credits });
  } catch (error) {
    console.error("Error adding credits:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new route to fetch user information
app.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await usersModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User found", user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/decrement-credits/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Implement logic to decrement credits for the user with the given userId
    // For example:
    const user = await usersModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Decrement the credits by 1
    if (user.credits > 0) {
      user.credits -= 1;
      await user.save();
      res.status(200).json({ message: "Credits decremented successfully" });
    }
  } catch (error) {
    console.error("Error decrementing credits:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/save-job-title", async (req, res) => {
  try {
    const { userId, jobTitle } = req.body;

    // Find the user by userId
    const user = await usersModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the new job title to the jobApplications array
    user.jobApplications.push({ title: jobTitle });

    // Save the updated user document
    await user.save();

    res.status(201).json({ message: "Job title saved successfully" });
  } catch (error) {
    console.error("Error saving job title:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/job-titles/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by userId
    const user = await usersModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract job titles and dates from the jobApplications array
    const jobTitlesAndDates = user.jobApplications.map((application) => ({
      title: application.title,
      date: application.date,
    }));

    res.status(200).json({ jobTitlesAndDates });
  } catch (error) {
    console.error("Error fetching job titles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/userinfo", async (req, res) => {
  try {
    const {
      userId,
      firstName,
      lastName,
      experience,
      country,
      upwork,
      fiverr,
      linkedin,
      facebook,
      upworkOverview,
      workSamples,
      skills,
    } = req.body;

    // Update the user document with credits information
    await usersModel.findByIdAndUpdate(userId, {
      userId,
      firstName,
      lastName,
      experience,
      country,
      upwork,
      fiverr,
      linkedin,
      facebook,
      upworkOverview,
      workSamples,
      skills,
    });
    res.status(201).json({ message: "Profel data updated successfully" });
  } catch (error) {
    console.error("Error adding credits:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to handle submission of auto apply criteria
app.post("/api/autoapplycriteria", async (req, res) => {
  try {
    const {
      userId,
      submittedProposal,
      clientTotalSpent,
      clientRating,
      clientLocation,
      clientBudget,
      clientHireRate,
      matchingSkills,
      alreadyHired,
      alreadyInvites,
      alreadyInterviewing,
    } = req.body;

    // Update the user document with auto apply criteria
    const updatedUser = await usersModel.findByIdAndUpdate(
      userId,
      {
        submittedProposal,
        clientTotalSpent,
        clientRating,
        clientLocation,
        clientBudget,
        clientHireRate,
        matchingSkills,
        alreadyHired,
        alreadyInvites,
        alreadyInterviewing,
      },
      { new: true } // Return the updated user document
    );

    res.status(201).json({
      message: "Auto apply criteria saved successfully",
      user: updatedUser, // Send back the updated user document to the client
    });
  } catch (error) {
    console.error("Error saving auto apply criteria:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.listen(8000, () => {
  console.log(`port connected`);
});
