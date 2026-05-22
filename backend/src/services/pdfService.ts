import PDFDocument from 'pdfkit';

export function generateAssignmentPDF(paper: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 54, // 0.75 in
        size: 'A4'
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // --- PAGE 1: QUESTION PAPER ---

      // School Name
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#1A1A1A')
         .text(paper.schoolName, { align: 'center' });
      doc.moveDown(0.3);

      // Subject Name
      doc.fontSize(13)
         .font('Helvetica')
         .text(`Subject: ${paper.subject}`, { align: 'center' });
      doc.moveDown(0.2);

      // Class Name
      doc.fontSize(12)
         .text(`Class: ${paper.className}`, { align: 'center' });
      doc.moveDown(0.8);

      // Metadata Bar (Time Allowed & Max Marks)
      const currentY = doc.y;
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text(`Time Allowed: ${paper.timeAllowed}`, 54, currentY, { align: 'left' });
      
      doc.text(`Maximum Marks: ${paper.maxMarks}`, 54, currentY, { align: 'right' });
      doc.moveDown(0.5);

      // Decorative divider line
      doc.strokeColor('#5E5E5E')
         .lineWidth(1.5)
         .moveTo(54, doc.y)
         .lineTo(doc.page.width - 54, doc.y)
         .stroke();
      doc.moveDown(0.8);

      // General Instructions
      doc.fontSize(11)
         .font('Helvetica-Oblique')
         .fillColor('#444444')
         .text(paper.instructions || 'All questions are compulsory. Read instructions carefully.');
      doc.moveDown(1.2);

      // Student Info Lines
      doc.font('Helvetica')
         .fillColor('#1A1A1A')
         .fontSize(11);
      
      const infoY = doc.y;
      doc.text('Name: __________________________', 54, infoY);
      doc.text('Roll Number: ___________________', 320, infoY);
      doc.moveDown(0.8);
      doc.text(`Class: ${paper.className} Section: ___________`, 54, doc.y);
      doc.moveDown(1.5);

      // Sections & Questions
      paper.sections.forEach((section: any, sIdx: number) => {
        // Section Title
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(section.title, { align: 'center' });
        doc.moveDown(0.4);

        // Section Type and instructions
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text(section.type, 54, doc.y)
           .fontSize(10)
           .font('Helvetica-Oblique')
           .fillColor('#5E5E5E')
           .text(section.instruction);
        doc.moveDown(0.8);

        // Questions List
        doc.fillColor('#1A1A1A').fontSize(11);

        section.questions.forEach((q: any, qIdx: number) => {
          doc.font('Helvetica');
          
          // Question text with tags
          const numberText = `${qIdx + 1}. `;
          const difficultyTag = `[${q.difficulty}] `;
          const marksTag = ` [${q.marks} Mark${q.marks > 1 ? 's' : ''}]`;
          
          // Calculate height of text block for page breaking if needed
          const fullQuestionText = `${difficultyTag}${q.text}${marksTag}`;
          
          doc.font('Helvetica-Bold')
             .fillColor(q.difficulty === 'Easy' ? '#2E7D32' : q.difficulty === 'Moderate' ? '#EF6C00' : '#C62828')
             .text(numberText + difficultyTag, { continued: true })
             .font('Helvetica')
             .fillColor('#1A1A1A')
             .text(q.text, { continued: true })
             .font('Helvetica-Bold')
             .fillColor('#5E5E5E')
             .text(marksTag);
          
          doc.moveDown(0.4);

          // Options if present (MCQ)
          if (q.options && q.options.length > 0) {
            doc.font('Helvetica').fillColor('#333333');
            const abc = ['a', 'b', 'c', 'd'];
            q.options.forEach((opt: string, oIdx: number) => {
              doc.text(`   (${abc[oIdx]}) ${opt}`);
            });
            doc.moveDown(0.4);
          }
          doc.moveDown(0.4);
        });

        doc.moveDown(1.5);
      });

      // End of Question Paper
      doc.moveDown(1.0);
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text('--- End of Question Paper ---', { align: 'center' });

      // --- PAGE 2: ANSWER KEY ---
      doc.addPage();

      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#1A1A1A')
         .text('Answer Key & Solutions', { align: 'center' });
      doc.moveDown(0.3);

      doc.fontSize(11)
         .font('Helvetica')
         .text(`Subject: ${paper.subject} | Class: ${paper.className}`, { align: 'center' });
      doc.moveDown(0.5);

      // Divider line
      doc.strokeColor('#5E5E5E')
         .lineWidth(1)
         .moveTo(54, doc.y)
         .lineTo(doc.page.width - 54, doc.y)
         .stroke();
      doc.moveDown(1.0);

      paper.answerKey.forEach((item: any, idx: number) => {
        // Question header
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor('#5E5E5E')
           .text(`${item.sectionTitle} - Question ${item.questionIndex}:`, { continued: true })
           .font('Helvetica-Oblique')
           .fillColor('#333333')
           .text(` "${item.questionText}"`);
        doc.moveDown(0.2);

        // Answer body
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#1A1A1A')
           .text(`Solution: ${item.answer}`);
        doc.moveDown(0.8);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
