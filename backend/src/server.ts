import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './models/db';
import { initRedis, setupQueue, addJobToQueue, localQueueEvents } from './queues/queueManager';
import { processGenerationJob } from './workers/generationWorker';
import { initSocket } from './services/socketService';
import { AssignmentRepository } from './models/AssignmentRepo';
import { generateAssignmentPDF } from './services/pdfService';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io WebSockets
initSocket(server);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// REST API Endpoints

// 1. Create Assignment
app.post('/api/assignments', async (req, res) => {
  try {
    const { title, dueDate, questionTypes, additionalInstructions, fileName, fileText } = req.body;

    // Validation
    if (!title || !dueDate || !questionTypes || !Array.isArray(questionTypes) || questionTypes.length === 0) {
      return res.status(400).json({ error: 'Title, due date, and at least one question type configuration are required.' });
    }

    // Double check values
    let totalQuestions = 0;
    let totalMarks = 0;
    for (const qType of questionTypes) {
      if (!qType.type || typeof qType.numQuestions !== 'number' || typeof qType.marksPerQuestion !== 'number') {
        return res.status(400).json({ error: 'Invalid question type configurations. Type, number of questions, and marks must be specified.' });
      }
      if (qType.numQuestions <= 0 || qType.marksPerQuestion <= 0) {
        return res.status(400).json({ error: 'Question counts and marks must be positive values.' });
      }
      totalQuestions += qType.numQuestions;
      totalMarks += (qType.numQuestions * qType.marksPerQuestion);
    }

    // Create entry in Repository
    const assignment = await AssignmentRepository.create({
      title,
      dueDate,
      questionTypes,
      additionalInstructions,
      fileName,
      fileText,
      totalQuestions,
      totalMarks,
      status: 'pending'
    });

    // Add job to background worker queue
    await addJobToQueue(assignment._id.toString(), {
      title,
      dueDate,
      questionTypes,
      additionalInstructions,
      fileText
    });

    return res.status(201).json(assignment);
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ error: error?.message || 'Server error creating assignment' });
  }
});

// 2. Get All Assignments
app.get('/api/assignments', async (req, res) => {
  try {
    const assignments = await AssignmentRepository.findAll();
    return res.json(assignments);
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ error: 'Server error fetching assignments' });
  }
});

// 3. Get Assignment by ID
app.get('/api/assignments/:id', async (req, res) => {
  try {
    const assignment = await AssignmentRepository.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    return res.json(assignment);
  } catch (error: any) {
    console.error('Error fetching assignment:', error);
    return res.status(500).json({ error: 'Server error fetching assignment' });
  }
});

// 4. Delete Assignment
app.delete('/api/assignments/:id', async (req, res) => {
  try {
    const success = await AssignmentRepository.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    return res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    return res.status(500).json({ error: 'Server error deleting assignment' });
  }
});

// 5. Regenerate Assignment
app.post('/api/assignments/:id/regenerate', async (req, res) => {
  try {
    const assignment = await AssignmentRepository.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Reset status to pending
    const updated = await AssignmentRepository.update(req.params.id, {
      status: 'pending',
      error: undefined,
      paper: undefined
    });

    // Re-queue job
    await addJobToQueue(assignment._id.toString(), {
      title: assignment.title,
      dueDate: assignment.dueDate,
      questionTypes: assignment.questionTypes,
      additionalInstructions: assignment.additionalInstructions,
      fileText: assignment.fileText
    });

    return res.json(updated);
  } catch (error: any) {
    console.error('Error triggering regeneration:', error);
    return res.status(500).json({ error: 'Server error triggering regeneration' });
  }
});

// 6. Download Assignment PDF
app.get('/api/assignments/:id/pdf', async (req, res) => {
  try {
    const assignment = await AssignmentRepository.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    if (assignment.status !== 'completed' || !assignment.paper) {
      return res.status(400).json({ error: 'Question paper generation not completed yet. Cannot download PDF.' });
    }

    const pdfBuffer = await generateAssignmentPDF(assignment.paper);
    
    // Set headers
    const safeTitle = assignment.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=assessment_${safeTitle}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    return res.end(pdfBuffer);
  } catch (error: any) {
    console.error('Error generating PDF download:', error);
    return res.status(500).json({ error: 'Server error generating PDF' });
  }
});

// Bootstrap dependencies and start server
async function bootstrap() {
  // Connect MongoDB
  await connectDB();

  // Connect Redis
  await initRedis();

  // Setup Background Worker Queue
  setupQueue(async (jobId, data) => {
    await processGenerationJob(jobId, data);
  });

  // If in local queue fallback mode, hook memory events to process jobs
  localQueueEvents.on('active', (info) => {
    console.log(`Local Job ${info.jobId} is now active.`);
  });

  server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` VEDA AI BACKEND SERVER RUNNING ON PORT ${PORT} `);
    console.log(`===============================================`);
  });
}

bootstrap().catch((err) => {
  console.error('Bootstrap failure:', err);
});
