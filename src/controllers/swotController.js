// server/src/controllers/swotController.js
import Swot from "../models/swotModel.js";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateSwotPDF } from "../utils/pdfGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1️⃣ Return the 20 SWOT questions
export const getSWOTQuestions = (req, res) => {
  const questions = {
    strengths: [
      "What are your key academic strengths or subjects where you excel?",
      "What personal qualities do you think help you succeed in your studies (e.g., motivation, discipline, creativity)?",
      "Have you received any awards, recognitions, or positive feedback related to your studies or extracurricular activities?",
      "What skills or talents do you possess that make you stand out as a student (e.g., leadership, time management)?",
      "How do you manage your time effectively when handling multiple tasks or assignments?"
    ],
    weaknesses: [
      "What academic subjects do you find most challenging or difficult?",
      "Are there any personal habits or behaviors that negatively impact your studies (e.g., procrastination, lack of focus)?",
      "Have you received any constructive feedback on areas for improvement in your academic performance?",
      "Do you struggle with time management, balancing studies with other responsibilities?",
      "Are there any skills or areas you feel you need to improve to be more successful in your studies?"
    ],
    opportunities: [
      "Are there any new educational opportunities (e.g., advanced courses, internships, workshops) you can pursue to improve your skills?",
      "What resources (e.g., online courses, mentors, clubs, tutoring) are available to you that can enhance your learning?",
      "Are there any trends or developments in your field of study that could benefit you (e.g., emerging career paths, technology)?",
      "How can you leverage your strengths to take advantage of opportunities that arise in your academic or professional life?",
      "Are there any collaborations or networking opportunities available that could help you grow in your field of interest?"
    ],
    threats: [
      "Are there any challenges or obstacles that might negatively affect your academic performance (e.g., family responsibilities, financial constraints)?",
      "Are there any external factors (e.g., competition, changes in the education system) that could limit your academic growth?",
      "Do you face any time management issues that might make it hard to complete assignments or projects on time?",
      "Are there any personal factors (e.g., stress, health issues) that could impact your studies or academic progress?",
      "Is there any potential risk (e.g., changing interests, lack of motivation) that could disrupt your academic success?"
    ]
  };

  res.json({ questions });
};

// 2️⃣ Generate SWOT via AI, save to MongoDB
export const generateSwot = async (req, res) => {
  const { responses, name, email, phone, college, degree } = req.body;

  if (!responses || responses.length !== 20) {
    return res.status(400).json({ error: "Please provide answers to all 20 questions." });
  }

  const prompt = `
        Based on the user's responses, generate a structured SWOT analysis.
        \nFormat the response **strictly in JSON** with the following structure:
        \n{
            "strengths": ["point1", "point2", "point3", "point4", "point5"],
            "weaknesses": ["point1", "point2", "point3", "point4", "point5"],
            "opportunities": ["point1", "point2", "point3", "point4", "point5"],
            "threats": ["point1", "point2", "point3", "point4", "point5"],
            "recommendations": ["point1", "point2", "point3", "point4", "point5"]
        }
        \nEnsure **each section has at least 5 points**. \n\nUser Responses:\n${responses.map((r, i) => `${i + 1}. ${r}`).join("\n")}
    `;

    try {
        const apiResponse = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`
                }
            }
        );

        let aiResponse = apiResponse.data.choices[0].message.content;
        aiResponse = aiResponse.replace(/```json|```/g, '').trim(); // Clean AI response

        let swotAnalysis;
        try {
            swotAnalysis = JSON.parse(aiResponse);
        } catch (jsonError) {
            return res.status(500).json({ error: "Invalid AI response format." });
        }

        // ✅ Ensure each section has at least 5 points
        const ensureMinPoints = (array) => (array.length >= 5 ? array : [...array, ...new Array(5 - array.length).fill("Additional insight needed")]);

        const swotData = {
            strengths: ensureMinPoints(swotAnalysis.strengths || []),
            weaknesses: ensureMinPoints(swotAnalysis.weaknesses || []),
            opportunities: ensureMinPoints(swotAnalysis.opportunities || []),
            threats: ensureMinPoints(swotAnalysis.threats || []),
            recommendations: ensureMinPoints(swotAnalysis.recommendations || [])
        };

        // ✅ Save to MongoDB
        const newSwot = new Swot({ name, email,phone, college, degree, swotAnalysis: swotData });
        await newSwot.save();

        res.json({ message: "SWOT analysis completed and saved", swotAnalysis: swotData });

    } catch (error) {
        console.error("Error generating SWOT:", error);console.log("API Key:", process.env.GROQ_API_KEY);

        res.status(500).json({ error: "Server Error. Try again later." });
    }
};


// 3️⃣ Fetch all saved SWOT reports
export const getAllSwotReports = async (req, res) => {
  try {
    const reports = await Swot.find();
    res.json({ reports });
  } catch (err) {
    console.error("Error fetching SWOT reports:", err);
    res.status(500).json({ error: "Error fetching SWOT reports." });
  }
};

// 4️⃣ Download or generate PDF for a specific user
export const downloadSwotPDF = async (req, res) => {
  try {
    const user = await Swot.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ensure reports folder exists
    const reportsDir = path.join(__dirname, "..", "swot_reports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const fileName = `${user.name.replace(/\s/g, "_")}_SWOT_Report.pdf`;
    const filePath = path.join(reportsDir, fileName);

    if (!fs.existsSync(filePath)) {
      await generateSwotPDF(user, filePath);
    }

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/pdf");
    res.download(filePath);
  } catch (err) {
    console.error("❌ PDF download error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};
