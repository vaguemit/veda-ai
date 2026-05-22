import { IQuestionPaper, ISection, IQuestion, IAnswerKeyItem } from '../models/Assignment';

interface IQuestionDatabase {
  subject: string;
  className: string;
  schoolName: string;
  timeAllowed: string;
  mcq: { text: string; difficulty: string; options: string[] }[];
  short: { text: string; difficulty: string }[];
  numerical: { text: string; difficulty: string }[];
  diagram: { text: string; difficulty: string }[];
  answers: Record<string, string>;
}

// Pre-defined question databases for realistic subject generation
const ELECTRICITY_QUESTIONS: IQuestionDatabase = {
  subject: 'Science (Physics & Chemistry)',
  className: 'Grade 8th',
  schoolName: 'Delhi Public School, Bokaro Steel City',
  timeAllowed: '45 minutes',
  mcq: [
    { text: 'Which of the following is a good conductor of electricity?', difficulty: 'Easy', options: ['Plastic', 'Rubber', 'Copper', 'Glass'] },
    { text: 'The process of depositing a layer of any desired metal on another material by means of electricity is called:', difficulty: 'Easy', options: ['Electrolysis', 'Electroplating', 'Galvanization', 'Rusting'] },
    { text: 'During electrolysis of water, oxygen gas is evolved at which electrode?', difficulty: 'Moderate', options: ['Cathode', 'Anode', 'Both Anode and Cathode', 'None of the above'] },
    { text: 'Which of the following liquids conduct electricity?', difficulty: 'Easy', options: ['Lemon juice', 'Vinegar', 'Tap water', 'All of the above'] },
    { text: 'A substance that allows electricity to flow through it easily is called a(n):', difficulty: 'Easy', options: ['Insulator', 'Conductor', 'Resistor', 'Semiconductor'] }
  ],
  short: [
    { text: 'Define electroplating. Explain its main purpose.', difficulty: 'Easy' },
    { text: 'What is the role of a conductor in the process of electrolysis?', difficulty: 'Moderate' },
    { text: 'Why does a solution of copper sulfate conduct electricity?', difficulty: 'Easy' },
    { text: 'Describe one example of the chemical effect of electric current in daily life.', difficulty: 'Moderate' },
    { text: 'Explain why electric current is said to have chemical effects.', difficulty: 'Moderate' }
  ],
  numerical: [
    { text: 'An electric current of 0.5 A flows through a conductor for 10 minutes. Calculate the total charge that passes through the circuit.', difficulty: 'Moderate' },
    { text: 'If a potential difference of 12V is applied across a wire with resistance 6 ohms, calculate the current flowing through it using Ohm\'s law.', difficulty: 'Easy' }
  ],
  diagram: [
    { text: 'Sketch a labeled diagram showing the process of electroplating a copper spoon with silver. State the electrolyte used.', difficulty: 'Challenging' },
    { text: 'Draw the experimental setup to test the conductivity of lemon juice. Label cathode, anode, and battery.', difficulty: 'Moderate' }
  ],
  answers: {
    'Define electroplating. Explain its main purpose.': 'Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current. Its purpose is to prevent corrosion, improve appearance, or increase thickness.',
    'What is the role of a conductor in the process of electrolysis?': 'A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes at the electrodes.',
    'Why does a solution of copper sulfate conduct electricity?': 'Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus conducting electricity.',
    'Describe one example of the chemical effect of electric current in daily life.': 'An example is the electroplating of silver on jewelry to prevent tarnishing.',
    'Explain why electric current is said to have chemical effects.': 'Electric current causes the movement of ions leading to chemical changes at the electrodes, hence it shows chemical effects.',
    'Which of the following is a good conductor of electricity?': 'Copper is a good conductor of electricity. Plastics, rubber, and glass are insulators.',
    'The process of depositing a layer of any desired metal on another material by means of electricity is called:': 'Electroplating is the correct answer.',
    'During electrolysis of water, oxygen gas is evolved at which electrode?': 'Oxygen is negatively charged and is evolved at the Anode (positive electrode).',
    'Which of the following liquids conduct electricity?': 'All of the above (Lemon juice, vinegar, and tap water all contain ions that conduct electricity).',
    'A substance that allows electricity to flow through it easily is called a(n):': 'Conductor.',
    'An electric current of 0.5 A flows through a conductor for 10 minutes. Calculate the total charge that passes through the circuit.': 'Q = I * t. Current (I) = 0.5 A. Time (t) = 10 minutes = 600 seconds. Charge (Q) = 0.5 * 600 = 300 Coulombs.',
    'If a potential difference of 12V is applied across a wire with resistance 6 ohms, calculate the current flowing through it using Ohm\'s law.': 'V = I * R. Current (I) = V / R = 12V / 6 ohms = 2 Amperes.',
    'Sketch a labeled diagram showing the process of electroplating a copper spoon with silver. State the electrolyte used.': 'The diagram should show: Anode = Silver plate, Cathode = Copper spoon, Electrolyte = Silver nitrate solution. Silver ions deposit on the cathode.',
    'Draw the experimental setup to test the conductivity of lemon juice. Label cathode, anode, and battery.': 'Diagram includes a beaker containing lemon juice, a battery, an LED bulb, and connecting copper wires acting as electrodes dipped in the juice.'
  }
};

const MATH_QUESTIONS: IQuestionDatabase = {
  subject: 'Mathematics (Algebra & Geometry)',
  className: 'Grade 7th',
  schoolName: 'Delhi Public School, Bokaro Steel City',
  timeAllowed: '60 minutes',
  mcq: [
    { text: 'What is the value of x in the equation 3x + 5 = 20?', difficulty: 'Easy', options: ['3', '5', '15', '4'] },
    { text: 'The sum of all interior angles of a triangle is:', difficulty: 'Easy', options: ['90 degrees', '180 degrees', '360 degrees', '270 degrees'] },
    { text: 'If a square has a perimeter of 24 cm, its area is:', difficulty: 'Moderate', options: ['24 sq cm', '36 sq cm', '16 sq cm', '48 sq cm'] }
  ],
  short: [
    { text: 'Solve for y: 2(y - 3) = 14.', difficulty: 'Easy' },
    { text: 'Explain the difference between a prime number and a composite number with examples.', difficulty: 'Easy' },
    { text: 'Define parallel lines and transversal with a diagram.', difficulty: 'Moderate' }
  ],
  numerical: [
    { text: 'Find the simple interest on a principal of $1,000 at an annual interest rate of 5% for 3 years.', difficulty: 'Moderate' },
    { text: 'The ratio of length to width of a rectangle is 5:3. If the perimeter is 64 cm, find its dimensions.', difficulty: 'Moderate' }
  ],
  diagram: [
    { text: 'Draw a triangle ABC where AB = 5cm, BC = 6cm, and angle B = 60 degrees. Construct its perpendicular bisectors.', difficulty: 'Challenging' }
  ],
  answers: {
    'What is the value of x in the equation 3x + 5 = 20?': '3x = 15 => x = 5.',
    'The sum of all interior angles of a triangle is:': '180 degrees.',
    'If a square has a perimeter of 24 cm, its area is:': 'Side = 24 / 4 = 6 cm. Area = side * side = 6 * 6 = 36 sq cm.',
    'Solve for y: 2(y - 3) = 14.': '2y - 6 = 14 => 2y = 20 => y = 10.',
    'Explain the difference between a prime number and a composite number with examples.': 'Prime numbers have exactly two factors (1 and itself, e.g., 2, 3, 5). Composite numbers have more than two factors (e.g., 4, 6, 8).',
    'Define parallel lines and transversal with a diagram.': 'Parallel lines never intersect. A transversal is a line that cuts across two or more parallel lines creating equal alternate angles.',
    'Find the simple interest on a principal of $1,000 at an annual interest rate of 5% for 3 years.': 'I = P * R * T / 100 = 1000 * 5 * 3 / 100 = $150.',
    'The ratio of length to width of a rectangle is 5:3. If the perimeter is 64 cm, find its dimensions.': 'Perimeter = 2(l + w) = 2(5x + 3x) = 16x = 64 => x = 4. Length = 20 cm, Width = 12 cm.',
    'Draw a triangle ABC where AB = 5cm, BC = 6cm, and angle B = 60 degrees. Construct its perpendicular bisectors.': 'Requires using a ruler and compass to draw line BC, measure 60 degrees at B, mark A at 5cm, join AC, and construct bisectors for all sides.'
  }
};

const GENERIC_QUESTIONS: IQuestionDatabase = {
  subject: 'General Knowledge & Reasoning',
  className: 'Grade 8th',
  schoolName: 'Veda AI Assessment Academy',
  timeAllowed: '45 minutes',
  mcq: [
    { text: 'Which planet is known as the Red Planet?', difficulty: 'Easy', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'] },
    { text: 'Who is the author of the book "Harry Potter"?', difficulty: 'Easy', options: ['J.K. Rowling', 'George R.R. Martin', 'Stephen King', 'J.R.R. Tolkien'] },
    { text: 'What is the chemical symbol for water?', difficulty: 'Easy', options: ['H2O', 'CO2', 'O2', 'NaCl'] }
  ],
  short: [
    { text: 'Explain why conservation of water resources is critical for our future.', difficulty: 'Moderate' },
    { text: 'Describe the three main branches of government in a democracy.', difficulty: 'Moderate' }
  ],
  numerical: [
    { text: 'A train travels at a speed of 60 km/h. How far will it travel in 2.5 hours?', difficulty: 'Easy' }
  ],
  diagram: [
    { text: 'Draw a flowchart illustrating the water cycle. Label Evaporation, Condensation, and Precipitation.', difficulty: 'Moderate' }
  ],
  answers: {
    'Which planet is known as the Red Planet?': 'Mars is known as the Red Planet due to its iron oxide-rich soil.',
    'Who is the author of the book "Harry Potter"?': 'J.K. Rowling.',
    'What is the chemical symbol for water?': 'H2O.',
    'Explain why conservation of water resources is critical for our future.': 'Water is essential for life, agriculture, and industry. Only a tiny fraction is fresh water, so conservation prevents droughts and water wars.',
    'Describe the three main branches of government in a democracy.': 'Legislature (makes laws), Executive (enforces laws), and Judiciary (interprets laws).',
    'A train travels at a speed of 60 km/h. How far will it travel in 2.5 hours?': 'Distance = Speed * Time = 60 * 2.5 = 150 km.',
    'Draw a flowchart illustrating the water cycle. Label Evaporation, Condensation, and Precipitation.': 'The flowchart should start with solar heating of oceans (evaporation), condensation into clouds, precipitation onto land, and runoffs returning to water bodies.'
  }
};

export function generateMockQuestionPaper(
  title: string,
  questionTypes: { type: string; numQuestions: number; marksPerQuestion: number }[],
  additionalInstructions?: string
): IQuestionPaper {
  // Infer subject template from title or instructions
  const content = (title + ' ' + (additionalInstructions || '')).toLowerCase();
  
  let db = GENERIC_QUESTIONS;
  if (content.includes('electr') || content.includes('science') || content.includes('physic') || content.includes('chemistry')) {
    db = ELECTRICITY_QUESTIONS;
  } else if (content.includes('math') || content.includes('algebra') || content.includes('geometr') || content.includes('calculus')) {
    db = MATH_QUESTIONS;
  }

  const sections: ISection[] = [];
  const answerKey: IAnswerKeyItem[] = [];
  
  let maxMarks = 0;
  let sectionIndex = 0;
  const sectionLetters = ['A', 'B', 'C', 'D', 'E'];

  for (const config of questionTypes) {
    const sectionLetter = sectionLetters[sectionIndex % sectionLetters.length];
    const sectionTitle = `Section ${sectionLetter}`;
    sectionIndex++;

    const numQuestions = config.numQuestions;
    const marks = config.marksPerQuestion;
    
    // Choose appropriate question source based on config type
    const typeLower = config.type.toLowerCase();
    let sourcePool: any[] = [];
    
    if (typeLower.includes('multiple choice') || typeLower.includes('mcq')) {
      sourcePool = db.mcq;
    } else if (typeLower.includes('numerical')) {
      sourcePool = db.numerical;
    } else if (typeLower.includes('diagram') || typeLower.includes('graph')) {
      sourcePool = db.diagram;
    } else {
      sourcePool = db.short;
    }

    // If source pool is empty, use generic short pool
    if (sourcePool.length === 0) {
      sourcePool = db.short;
    }

    const sectionQuestions: IQuestion[] = [];
    
    for (let i = 0; i < numQuestions; i++) {
      // Pick question from pool, reuse if we exceed the pool limit
      const template = sourcePool[i % sourcePool.length];
      const qText = `${template.text} (Variated Q${i+1})`;
      const qDiff = template.difficulty;
      
      const question: IQuestion = {
        text: template.text, // keep standard text
        difficulty: qDiff as any,
        marks: marks
      };

      if (template.options) {
        question.options = template.options;
      }

      sectionQuestions.push(question);
      maxMarks += marks;

      // Add to answer key
      const baseAnswer = (db.answers as any)[template.text] || 'Perform calculation/reasoning based on instructions.';
      answerKey.push({
        questionIndex: i + 1,
        sectionTitle: sectionTitle,
        questionText: template.text,
        answer: baseAnswer
      });
    }

    sections.push({
      title: sectionTitle,
      type: config.type,
      instruction: `Attempt all questions. Each question carries ${marks} marks.`,
      questions: sectionQuestions
    });
  }

  return {
    schoolName: db.schoolName,
    subject: title || db.subject,
    className: db.className,
    timeAllowed: db.timeAllowed,
    maxMarks: maxMarks,
    instructions: 'All questions are compulsory. Scientific calculators are not allowed. Read instructions carefully.',
    sections: sections,
    answerKey: answerKey
  };
}
