import { Schema, model, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  options?: string[]; // for multiple choice
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

export interface IAssignment extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'], required: true },
  marks: { type: Number, required: true },
  options: [{ type: String }]
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema]
});

const AnswerKeyItemSchema = new Schema<IAnswerKeyItem>({
  questionIndex: { type: Number, required: true },
  sectionTitle: { type: String, required: true },
  questionText: { type: String, required: true },
  answer: { type: String, required: true }
});

const QuestionPaperSchema = new Schema<IQuestionPaper>({
  schoolName: { type: String, required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  timeAllowed: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  instructions: { type: String, required: true },
  sections: [SectionSchema],
  answerKey: [AnswerKeyItemSchema]
});

const QuestionTypeConfigSchema = new Schema<IQuestionTypeConfig>({
  type: { type: String, required: true },
  numQuestions: { type: Number, required: true },
  marksPerQuestion: { type: Number, required: true }
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    dueDate: { type: String, required: true },
    questionTypes: [QuestionTypeConfigSchema],
    additionalInstructions: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    error: { type: String },
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    fileName: { type: String },
    fileText: { type: String },
    paper: { type: QuestionPaperSchema }
  },
  { timestamps: true }
);

export const Assignment = model<IAssignment>('Assignment', AssignmentSchema);
export default Assignment;
