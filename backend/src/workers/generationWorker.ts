import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { AssignmentRepository } from '../models/AssignmentRepo';
import { generateMockQuestionPaper } from './mockGenerator';
import { emitToAssignmentRoom } from '../services/socketService';

dotenv.config();

// Delay helper to create smooth progressive UI animations
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function processGenerationJob(jobId: string, data: any) {
  console.log(`Starting job processing: ${jobId}`);
  
  try {
    // 1. Fetch assignment
    const assignment = await AssignmentRepository.findById(jobId);
    if (!assignment) {
      console.error(`Assignment ${jobId} not found in database.`);
      return;
    }

    // 2. Set to processing
    await AssignmentRepository.update(jobId, { status: 'processing' });
    emitToAssignmentRoom(jobId, 'job:update', {
      status: 'processing',
      progress: 10,
      message: 'Initializing AI model parameters...'
    });
    await delay(1000);

    // 3. Analyzing content upload
    const fileUploaded = !!data.fileText;
    if (fileUploaded) {
      emitToAssignmentRoom(jobId, 'job:update', {
        status: 'processing',
        progress: 30,
        message: 'Parsing uploaded study materials and reference guides...'
      });
      await delay(1000);
    } else {
      emitToAssignmentRoom(jobId, 'job:update', {
        status: 'processing',
        progress: 30,
        message: 'Formulating assessment topics...'
      });
      await delay(800);
    }

    emitToAssignmentRoom(jobId, 'job:update', {
      status: 'processing',
      progress: 60,
      message: 'Structuring exam paper sections and writing questions...'
    });

    let generatedPaper: any = null;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      try {
        console.log('Invoking Gemini API...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' }
        });

        const prompt = `You are an AI assessment generator.
Create a structured exam question paper based on the following input parameters:
Title/Topic: ${data.title}
Due Date: ${data.dueDate}
Additional Instructions: ${data.additionalInstructions || 'None'}
Study Material Text: ${data.fileText || 'None'}

Structure the question paper according to these sections:
${data.questionTypes.map((q: any) => `- Section: "${q.type}", number of questions: ${q.numQuestions}, marks per question: ${q.marksPerQuestion}`).join('\n')}

Output a single JSON object strictly matching this structure:
{
  "schoolName": "Delhi Public School, Bokaro Steel City", // A realistic school name matching the topic, or default
  "subject": "Physics", // Inferred subject name based on prompt
  "className": "Grade 8th",  // Inferred class name (e.g. Grade 8th, Grade 10th)
  "timeAllowed": "45 minutes", // Inferred exam duration based on question types and instructions
  "maxMarks": 20,   // Sum of marks of all questions in all sections
  "instructions": "All questions are compulsory. Read instructions carefully.", // General instructions
  "sections": [
    {
      "title": "Section A", // e.g. "Section A", "Section B"
      "type": "Multiple Choice Questions",  // e.g. "Multiple Choice Questions", "Short Questions", "Numerical Problems"
      "instruction": "Attempt all questions. Each question carries 2 marks",
      "questions": [
        {
          "text": "Define electroplating...",
          "difficulty": "Easy", // Must be one of 'Easy' | 'Moderate' | 'Challenging'
          "marks": 2,
          "options": ["Option A", "Option B", "Option C", "Option D"] // Include ONLY if section type is Multiple Choice
        }
      ]
    }
  ],
  "answerKey": [
    {
      "questionIndex": 1, // 1-based index in the section
      "sectionTitle": "Section A",
      "questionText": "Define electroplating...",
      "answer": "Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current..." // detailed step-by-step solution
    }
  ]
}

Ensure questions cover different difficulty levels (Easy, Moderate, Challenging) based on the marks and types.
Return ONLY valid JSON. Do not include markdown code block ticks.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log('Gemini API response received.');

        // Clean response text just in case markdown is returned
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.substring(7);
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.substring(3);
        }
        if (cleanText.endsWith('```')) {
          cleanText = cleanText.substring(0, cleanText.length - 3);
        }
        cleanText = cleanText.trim();

        generatedPaper = JSON.parse(cleanText);
        console.log('Successfully parsed Gemini JSON.');
      } catch (aiErr) {
        console.warn('Gemini Generation failed. Falling back to template generation.', aiErr);
        generatedPaper = null;
      }
    }

    // 4. Fallback if Gemini key is missing or failed
    if (!generatedPaper) {
      console.log('Using mock question paper generator...');
      await delay(1200); // simulate some thinking
      generatedPaper = generateMockQuestionPaper(
        data.title,
        data.questionTypes,
        data.additionalInstructions
      );
    }

    emitToAssignmentRoom(jobId, 'job:update', {
      status: 'processing',
      progress: 90,
      message: 'Compiling final question paper and formatting answers...'
    });
    await delay(1000);

    // 5. Update DB
    const updated = await AssignmentRepository.update(jobId, {
      status: 'completed',
      paper: generatedPaper
    });

    // 6. Emit Success
    emitToAssignmentRoom(jobId, 'job:update', {
      status: 'completed',
      progress: 100,
      message: 'Question paper generated successfully!',
      assignment: updated
    });
    console.log(`Job ${jobId} finished successfully.`);

  } catch (error: any) {
    console.error(`Error processing job ${jobId}:`, error);
    
    // Set to failed in DB
    await AssignmentRepository.update(jobId, {
      status: 'failed',
      error: error?.message || 'Unknown processing error'
    });

    emitToAssignmentRoom(jobId, 'job:update', {
      status: 'failed',
      progress: 100,
      message: `Generation failed: ${error?.message || 'Unknown error'}`
    });
  }
}
