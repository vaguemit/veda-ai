import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface IQuestion {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  options?: string[];
}

export interface ISection {
  title: string;
  type: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAnswerKeyItem {
  questionIndex: number;
  sectionTitle: string;
  questionText: string;
  answer: string;
}

export interface IQuestionPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  instructions: string;
  sections: ISection[];
  answerKey: IAnswerKeyItem[];
}

export interface IQuestionTypeConfig {
  type: string;
  numQuestions: number;
  marksPerQuestion: number;
}

export interface IAssignment {
  _id: string;
  title: string;
  dueDate: string;
  questionTypes: IQuestionTypeConfig[];
  additionalInstructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  totalQuestions: number;
  totalMarks: number;
  fileName?: string;
  fileText?: string;
  paper?: IQuestionPaper;
  createdAt: string;
  updatedAt: string;
}

interface IGenerationProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  assignmentId?: string;
}

interface AssignmentState {
  // App views: 'no_assignments' (0 state), 'list' (assignments), 'create' (form), 'output' (paper view)
  currentView: 'no_assignments' | 'list' | 'create' | 'output';
  assignments: IAssignment[];
  selectedAssignment: IAssignment | null;
  loading: boolean;
  error: string | null;
  
  // WebSocket
  socket: Socket | null;
  socketConnected: boolean;
  generationProgress: IGenerationProgress | null;

  // Form Inputs
  formTitle: string;
  formDueDate: string;
  formQuestionTypes: IQuestionTypeConfig[];
  formAdditionalInstructions: string;
  formFileName: string | null;
  formFileText: string | null;
  formSubmitting: boolean;

  // Actions
  setView: (view: 'no_assignments' | 'list' | 'create' | 'output') => void;
  setSelectedAssignment: (assignment: IAssignment | null) => void;
  fetchAssignments: () => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  regenerateAssignment: (id: string) => Promise<void>;
  
  // Form Actions
  setFormTitle: (title: string) => void;
  setFormDueDate: (date: string) => void;
  setFormQuestionTypes: (types: IQuestionTypeConfig[]) => void;
  addQuestionType: (type: string) => void;
  removeQuestionType: (type: string) => void;
  updateQuestionTypeQty: (type: string, delta: number) => void;
  updateQuestionTypeMarks: (type: string, delta: number) => void;
  setFormAdditionalInstructions: (instructions: string) => void;
  setFormFile: (name: string | null, text: string | null) => void;
  resetForm: () => void;
  submitAssignment: () => Promise<void>;

  // Socket Actions
  initSocket: () => void;
  disconnectSocket: () => void;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  currentView: 'no_assignments',
  assignments: [],
  selectedAssignment: null,
  loading: false,
  error: null,
  
  socket: null,
  socketConnected: false,
  generationProgress: null,

  formTitle: '',
  formDueDate: '',
  formQuestionTypes: [
    { type: 'Multiple Choice Questions', numQuestions: 4, marksPerQuestion: 1 },
    { type: 'Short Questions', numQuestions: 3, marksPerQuestion: 2 },
    { type: 'Diagram/Graph-Based Questions', numQuestions: 5, marksPerQuestion: 5 },
    { type: 'Numerical Problems', numQuestions: 5, marksPerQuestion: 5 }
  ],
  formAdditionalInstructions: '',
  formFileName: null,
  formFileText: null,
  formSubmitting: false,

  setView: (view) => set({ currentView: view }),
  setSelectedAssignment: (assignment) => set({ selectedAssignment: assignment }),

  fetchAssignments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/assignments`);
      if (!res.ok) throw new Error('Failed to fetch assignments');
      const data = await res.json();
      // Always keep the current view — homepage (no_assignments) stays as homepage.
      // Only switch to no_assignments if there are genuinely no assignments.
      set({ 
        assignments: data,
        currentView: data.length === 0 ? 'no_assignments' : get().currentView
      });
    } catch (err: any) {
      set({ error: err?.message || 'Error loading assignments' });
    } finally {
      set({ loading: false });
    }
  },

  deleteAssignment: async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/assignments/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete assignment');
      
      const updatedAssignments = get().assignments.filter(a => a._id !== id);
      set({ 
        assignments: updatedAssignments,
        currentView: updatedAssignments.length === 0 ? 'no_assignments' : get().currentView
      });

      if (get().selectedAssignment?._id === id) {
        set({ selectedAssignment: null });
      }
    } catch (err) {
      console.error(err);
    }
  },

  regenerateAssignment: async (id) => {
    set({ 
      generationProgress: {
        status: 'pending',
        progress: 0,
        message: 'Requesting regeneration from background worker...'
      }
    });

    try {
      const res = await fetch(`${API_URL}/api/assignments/${id}/regenerate`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to trigger regeneration');
      const data = await res.json();
      
      // Update list
      set({
        assignments: get().assignments.map(a => a._id === id ? data : a)
      });
      
      // Listen over websockets
      const socket = get().socket;
      if (socket) {
        socket.emit('join:assignment', id);
      }
    } catch (err: any) {
      set({ 
        generationProgress: {
          status: 'failed',
          progress: 100,
          message: `Regeneration trigger failed: ${err.message}`
        }
      });
    }
  },

  // Form State Actions
  setFormTitle: (title) => set({ formTitle: title }),
  setFormDueDate: (date) => set({ formDueDate: date }),
  setFormQuestionTypes: (types) => set({ formQuestionTypes: types }),
  
  addQuestionType: (type) => {
    const current = get().formQuestionTypes;
    if (current.some(q => q.type === type)) return;
    set({
      formQuestionTypes: [...current, { type, numQuestions: 1, marksPerQuestion: 1 }]
    });
  },

  removeQuestionType: (type) => {
    set({
      formQuestionTypes: get().formQuestionTypes.filter(q => q.type !== type)
    });
  },

  updateQuestionTypeQty: (type, delta) => {
    set({
      formQuestionTypes: get().formQuestionTypes.map(q => {
        if (q.type === type) {
          const val = Math.max(1, q.numQuestions + delta);
          return { ...q, numQuestions: val };
        }
        return q;
      })
    });
  },

  updateQuestionTypeMarks: (type, delta) => {
    set({
      formQuestionTypes: get().formQuestionTypes.map(q => {
        if (q.type === type) {
          const val = Math.max(1, q.marksPerQuestion + delta);
          return { ...q, marksPerQuestion: val };
        }
        return q;
      })
    });
  },

  setFormAdditionalInstructions: (instructions) => set({ formAdditionalInstructions: instructions }),
  setFormFile: (name, text) => set({ formFileName: name, formFileText: text }),
  
  resetForm: () => set({
    formTitle: '',
    formDueDate: '',
    formAdditionalInstructions: '',
    formFileName: null,
    formFileText: null,
    formSubmitting: false
  }),

  submitAssignment: async () => {
    const { formTitle, formDueDate, formQuestionTypes, formAdditionalInstructions, formFileName, formFileText } = get();
    
    // Validations
    if (!formTitle.trim()) {
      alert('Please enter a title for the assignment.');
      return;
    }
    if (!formDueDate) {
      alert('Please select a due date.');
      return;
    }
    if (formQuestionTypes.length === 0) {
      alert('Please configure at least one question type.');
      return;
    }

    set({ formSubmitting: true, generationProgress: { status: 'pending', progress: 0, message: 'Submitting assignment creation task...' } });

    try {
      const res = await fetch(`${API_URL}/api/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formTitle,
          dueDate: formDueDate,
          questionTypes: formQuestionTypes,
          additionalInstructions: formAdditionalInstructions,
          fileName: formFileName,
          fileText: formFileText
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || 'Failed to submit assignment');
      }

      const assignment: IAssignment = await res.json();
      
      // Update in assignments list
      set({ 
        assignments: [assignment, ...get().assignments],
        selectedAssignment: assignment,
        currentView: 'output' // Show output page (which will render the progress loading overlays)
      });

      // Connect to websocket room for this specific assignment
      const socket = get().socket;
      if (socket) {
        socket.emit('join:assignment', assignment._id);
      }
      
    } catch (err: any) {
      alert(err.message || 'Error submitting assignment.');
      set({ generationProgress: null });
    } finally {
      set({ formSubmitting: false });
    }
  },

  initSocket: () => {
    if (get().socket) return;

    console.log('Initializing Socket.io client...');
    const socket = io(API_URL);

    socket.on('connect', () => {
      console.log('Socket.io connected to server.');
      set({ socketConnected: true });
    });

    socket.on('disconnect', () => {
      console.log('Socket.io disconnected from server.');
      set({ socketConnected: false });
    });

    // Realtime background job update listener
    socket.on('job:update', (progressData: IGenerationProgress & { assignment?: IAssignment }) => {
      console.log('Received WebSocket progress update:', progressData);
      
      set({ generationProgress: progressData });

      if (progressData.status === 'completed' && progressData.assignment) {
        const completedAssignment = progressData.assignment;
        
        // Update assignments list with generated paper
        set({
          assignments: get().assignments.map(a => a._id === completedAssignment._id ? completedAssignment : a),
          selectedAssignment: completedAssignment
        });

        // Trigger confetti celebration on completed paper view
        try {
          if (typeof window !== 'undefined') {
            const confetti = require('canvas-confetti');
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        } catch (e) {
          console.warn(e);
        }
      } else if (progressData.status === 'failed') {
        // Find failed assignment in list and set to failed
        const assignmentId = completedAssignment => completedAssignment?._id; 
        get().fetchAssignments(); // Refetch to align states
      }
    });

    // General updates listener
    socket.on('assignments:updated', (data) => {
      // General handler if needed
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, socketConnected: false });
    }
  }
}));
