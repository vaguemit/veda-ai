import fs from 'fs';
import path from 'path';
import Assignment, { IAssignment } from './Assignment';
import { isDbConnected } from './db';

const FALLBACK_FILE_PATH = path.join(__dirname, '../../../assignments_db.json');

// Memory storage for assignments when DB is offline
let localAssignments: any[] = [];

// Load from file if exists
function loadLocalData() {
  try {
    if (fs.existsSync(FALLBACK_FILE_PATH)) {
      const raw = fs.readFileSync(FALLBACK_FILE_PATH, 'utf-8');
      localAssignments = JSON.parse(raw);
    } else {
      localAssignments = [];
      saveLocalData();
    }
  } catch (error) {
    console.error('Error loading fallback JSON DB:', error);
    localAssignments = [];
  }
}

function saveLocalData() {
  try {
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(localAssignments, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving fallback JSON DB:', error);
  }
}

// Initialize local database
loadLocalData();

export class AssignmentRepository {
  static async create(data: any): Promise<any> {
    if (isDbConnected()) {
      const assignment = new Assignment(data);
      return await assignment.save();
    } else {
      const newAssignment = {
        _id: 'local_' + Math.random().toString(36).substring(2, 11),
        ...data,
        status: data.status || 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      localAssignments.unshift(newAssignment); // Add to beginning
      saveLocalData();
      return newAssignment;
    }
  }

  static async findById(id: string): Promise<any> {
    if (isDbConnected() && !id.startsWith('local_')) {
      try {
        return await Assignment.findById(id);
      } catch (err) {
        return null;
      }
    } else {
      const found = localAssignments.find(a => a._id === id);
      return found || null;
    }
  }

  static async findAll(): Promise<any[]> {
    if (isDbConnected()) {
      try {
        // Return latest first
        return await Assignment.find().sort({ createdAt: -1 });
      } catch (err) {
        return localAssignments;
      }
    } else {
      return localAssignments;
    }
  }

  static async update(id: string, updateData: any): Promise<any> {
    if (isDbConnected() && !id.startsWith('local_')) {
      try {
        return await Assignment.findByIdAndUpdate(id, updateData, { new: true });
      } catch (err) {
        // Fallback
      }
    }
    
    // Update local DB
    const idx = localAssignments.findIndex(a => a._id === id);
    if (idx !== -1) {
      localAssignments[idx] = {
        ...localAssignments[idx],
        ...updateData,
        updatedAt: new Date()
      };
      saveLocalData();
      return localAssignments[idx];
    }
    return null;
  }

  static async delete(id: string): Promise<boolean> {
    if (isDbConnected() && !id.startsWith('local_')) {
      try {
        const res = await Assignment.findByIdAndDelete(id);
        return !!res;
      } catch (err) {
        return false;
      }
    } else {
      const idx = localAssignments.findIndex(a => a._id === id);
      if (idx !== -1) {
        localAssignments.splice(idx, 1);
        saveLocalData();
        return true;
      }
      return false;
    }
  }
}
