'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  useAssignmentStore, 
  IAssignment, 
  IQuestionTypeConfig 
} from '../store/useAssignmentStore';
import { 
  Plus, 
  Minus, 
  Calendar, 
  FileText, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Download, 
  Mic, 
  Search, 
  BookOpen, 
  Clock, 
  Award, 
  Eye, 
  Settings, 
  LayoutDashboard, 
  BookOpenCheck,
  FileCheck,
  Library,
  Users,
  ChevronDown,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function Home() {
  const {
    currentView,
    assignments,
    selectedAssignment,
    loading,
    generationProgress,
    setView,
    setSelectedAssignment,
    fetchAssignments,
    deleteAssignment,
    regenerateAssignment,
    
    // Form States
    formTitle,
    formDueDate,
    formQuestionTypes,
    formAdditionalInstructions,
    formFileName,
    formSubmitting,
    
    // Form Setters
    setFormTitle,
    setFormDueDate,
    addQuestionType,
    removeQuestionType,
    updateQuestionTypeQty,
    updateQuestionTypeMarks,
    setFormAdditionalInstructions,
    setFormFile,
    resetForm,
    submitAssignment,
    
    // Socket
    initSocket,
    disconnectSocket
  } = useAssignmentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize socket connection and load assignments list on mount
  useEffect(() => {
    initSocket();
    fetchAssignments();
    return () => {
      disconnectSocket();
    };
  }, []);

  // Sync selected assignment with changes in store (e.g. status changes via WS)
  useEffect(() => {
    if (selectedAssignment) {
      const updated = assignments.find(a => a._id === selectedAssignment._id);
      if (updated) {
        setSelectedAssignment(updated);
      }
    }
  }, [assignments, selectedAssignment, setSelectedAssignment]);

  // Handle local text file reading
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Store filename and content text
      setFormFile(file.name, text || `Document Name: ${file.name}`);
    };

    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      // Mock parsing for non-text files in client env (standard PDF metadata tag)
      setFormFile(
        file.name, 
        `[Parsed Document Meta]\nFilename: ${file.name}\nSize: ${Math.round(file.size / 1024)} KB\nType: ${file.type}\nUploaded on: ${new Date().toLocaleDateString()}`
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFormFile(file.name, text || `Document Name: ${file.name}`);
    };

    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      setFormFile(
        file.name, 
        `[Parsed Document Meta]\nFilename: ${file.name}\nSize: ${Math.round(file.size / 1024)} KB\nType: ${file.type}`
      );
    }
  };

  // Triggers quick default template for text-area instruction
  const handleMicClick = () => {
    const speechTemplates = [
      "Generate an electricity assessment test for 8th grade science covering electric currents and basic circuits.",
      "Create a mathematics quiz on algebraic equations and ratios with easy and moderate sections.",
      "Design a history quiz covering the major events of World War II with 10 questions.",
      "Formulate a vocabulary exam targeting advanced English reading comprehension."
    ];
    const rand = speechTemplates[Math.floor(Math.random() * speechTemplates.length)];
    setFormAdditionalInstructions(rand);
  };

  // Form helpers
  const totalQuestions = formQuestionTypes.reduce((acc, curr) => acc + curr.numQuestions, 0);
  const totalMarks = formQuestionTypes.reduce((acc, curr) => acc + (curr.numQuestions * curr.marksPerQuestion), 0);

  const availableQuestionTypes = [
    'Multiple Choice Questions',
    'Short Questions',
    'Diagram/Graph-Based Questions',
    'Numerical Problems',
    'Long Essay Questions'
  ];

  // Search filter
  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="app-container">
      {/* 1. PERSISTENT SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          {/* Logo */}
          <div className="logo-container">
            <div className="logo-box">V</div>
            <h1 className="logo-text">VedaAI</h1>
          </div>

          {/* AI Teacher Tool button */}
          <button 
            className="toolkit-btn" 
            onClick={() => {
              resetForm();
              setView('create');
            }}
          >
            <Sparkles size={16} />
            <span>AI Teacher's Toolkit</span>
          </button>

          {/* Menu Items */}
          <nav className="sidebar-menu">
            <button 
              className={`menu-item ${currentView === 'list' || currentView === 'no_assignments' ? 'active' : ''}`}
              onClick={() => setView(assignments.length === 0 ? 'no_assignments' : 'list')}
            >
              <LayoutDashboard size={18} />
              <span>Home</span>
            </button>
            <button className="menu-item">
              <Users size={18} />
              <span>My Groups</span>
            </button>
            <button 
              className={`menu-item ${currentView === 'list' || currentView === 'no_assignments' || currentView === 'output' ? 'active' : ''}`}
              onClick={() => setView(assignments.length === 0 ? 'no_assignments' : 'list')}
            >
              <FileCheck size={18} />
              <span>Assignments</span>
              {assignments.length > 0 && (
                <span className="assignments-count">{assignments.length}</span>
              )}
            </button>
            <button className="menu-item">
              <BookOpenCheck size={18} />
              <span>AI Teacher's Toolkit</span>
            </button>
            <button className="menu-item">
              <Library size={18} />
              <span>My Library</span>
            </button>
          </nav>
        </div>

        {/* Settings link */}
        <button className="menu-item" style={{ marginBottom: 6 }}>
          <Settings size={18} />
          <span>Settings</span>
        </button>

        {/* School Info Footer Card */}
        <div className="school-card">
          <div className="school-avatar">🏫</div>
          <div className="school-info">
            <h4 className="school-name">Delhi Public School</h4>
            <span className="school-location">Bokaro Steel City</span>
          </div>
        </div>
      </aside>

      {/* 2. DYNAMIC WORKSPACE CONTENT PANEL */}
      <section className="main-content">
        {/* Top Floating Header */}
        <header className="top-header">
          <div>
            {currentView === 'create' && (
              <button className="back-btn" onClick={() => setView(assignments.length === 0 ? 'no_assignments' : 'list')}>
                ← Back to Dashboard
              </button>
            )}
            {currentView === 'output' && (
              <button className="back-btn" onClick={() => setView('list')}>
                ← Back to Assignments
              </button>
            )}
            {(currentView === 'list' || currentView === 'no_assignments') && (
              <h2 className="logo-text" style={{ fontSize: '18px' }}>Dashboard Overview</h2>
            )}
          </div>

          <div className="profile-section">
            <div className="notification-bell">
              <span className="notification-badge"></span>
              🔔
            </div>
            <div className="profile-card">
              <div className="profile-avatar">👨‍🏫</div>
              <span className="profile-name">John Doe</span>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        </header>

        {/* Sub-View Switcher inside content card */}
        <div className="content-card">
          
          {/* SCREEN 0: NO ASSIGNMENTS YET */}
          {currentView === 'no_assignments' && (
            <div className="empty-state-container">
              <div style={{ fontSize: '80px' }}>📄</div>
              <h3 className="empty-state-title">No assignments yet</h3>
              <p className="empty-state-desc">
                Create your first assignment to start collecting and grading student submissions. 
                You can set up rubrics, define marking criteria, and let AI assist with grading.
              </p>
              <button 
                className="btn-primary" 
                onClick={() => {
                  resetForm();
                  setView('create');
                }}
              >
                <Plus size={18} />
                <span>Create Your First Assignment</span>
              </button>
            </div>
          )}

          {/* SCREEN 1: ASSIGNMENTS LIST VIEW */}
          {currentView === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="list-view-header">
                <div className="list-view-title-container">
                  <h3 className="list-view-title">Assignments</h3>
                  <span className="list-view-subtitle">Manage and create assessments for your classes.</span>
                </div>

                <div className="search-filter-container">
                  <div className="search-input-wrapper">
                    <Search size={16} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search Assignment..." 
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      resetForm();
                      setView('create');
                    }}
                  >
                    <Plus size={18} />
                    <span>Create Assignment</span>
                  </button>
                </div>
              </div>

              {filteredAssignments.length === 0 ? (
                <div className="empty-state-container" style={{ flexGrow: 1 }}>
                  <p className="empty-state-desc">No assignments found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="assignments-grid">
                  {filteredAssignments.map((assign) => (
                    <div 
                      key={assign._id} 
                      className="assignment-card"
                      onClick={() => {
                        setSelectedAssignment(assign);
                        setView('output');
                      }}
                    >
                      <div className="card-header">
                        <h4 className="card-title">{assign.title}</h4>
                        <div 
                          className={`status-indicator ${
                            assign.status === 'completed' 
                              ? 'status-completed' 
                              : assign.status === 'processing' || assign.status === 'pending'
                              ? 'status-processing' 
                              : 'status-failed'
                          }`}
                          title={`Status: ${assign.status}`}
                        />
                      </div>

                      <div className="card-metadata">
                        <div className="metadata-row">
                          <Calendar size={14} />
                          <span>Due: {assign.dueDate}</span>
                        </div>
                        <div className="metadata-row">
                          <BookOpen size={14} />
                          <span>{assign.totalQuestions} Questions</span>
                        </div>
                        <div className="metadata-row">
                          <Award size={14} />
                          <span>{assign.totalMarks} Total Marks</span>
                        </div>
                      </div>

                      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="card-action-btn"
                          onClick={() => {
                            setSelectedAssignment(assign);
                            setView('output');
                          }}
                        >
                          <Eye size={14} />
                          <span>View Paper</span>
                        </button>
                        <button 
                          className="card-action-btn delete"
                          onClick={() => deleteAssignment(assign._id)}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Floating bottom create button matching Figma */}
              <button
                className="fab-create-btn"
                onClick={() => {
                  resetForm();
                  setView('create');
                }}
              >
                <Plus size={18} />
                <span>Create Assignment</span>
              </button>
            </div>
          )}

          {/* SCREEN 2: ASSIGNMENT CREATION FORM */}
          {currentView === 'create' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="form-header-container">
                <h3 className="form-title">Assignment Details</h3>
                <span className="form-subtitle">Basic information about your assignment</span>
              </div>

              <div className="form-body">
                {/* Title */}
                <div className="form-group">
                  <label className="form-label" htmlFor="assignment-title">Assignment Title</label>
                  <input 
                    id="assignment-title"
                    type="text" 
                    placeholder="e.g. Quiz on Electricity" 
                    className="input-text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                {/* Due Date & Material Upload */}
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" htmlFor="due-date">Due Date</label>
                    <div className="date-picker-wrapper">
                      <input 
                        id="due-date"
                        type="date" 
                        className="input-date"
                        value={formDueDate}
                        onChange={(e) => setFormDueDate(e.target.value)}
                      />
                      <Calendar size={18} className="calendar-icon-btn" />
                    </div>
                  </div>

                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Reference Material (Optional)</label>
                    <div 
                      className={`upload-container ${dragOver ? 'drag-over' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept=".txt,.pdf,.doc,.docx"
                      />
                      {formFileName ? (
                        <div className="file-pill" onClick={(e) => e.stopPropagation()}>
                          <FileText size={16} />
                          <span>{formFileName}</span>
                          <button className="remove-file-btn" onClick={() => setFormFile(null, null)}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="upload-icon-box">
                            <Upload size={20} />
                          </div>
                          <div>
                            <p className="upload-text-primary">Choose a file or drag & drop it here</p>
                            <p className="upload-text-secondary">TXT, PDF or Word documents up to 10MB</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Question Types Configurator */}
                <div className="form-group question-config-container">
                  <label className="form-label">Question Configurator</label>
                  
                  <div className="question-config-grid">
                    {/* Table Header */}
                    <div className="question-config-row" style={{ borderBottom: '1.5px solid #ECECEC' }}>
                      <span className="question-config-header">Question Type</span>
                      <span className="question-config-header">No. of Questions</span>
                      <span className="question-config-header">Marks Per Q</span>
                      <span className="question-config-header"></span>
                    </div>

                    {/* Table Rows */}
                    {formQuestionTypes.map((qConfig) => (
                      <div key={qConfig.type} className="question-config-row">
                        <div className="qtype-name-card">
                          <span>{qConfig.type}</span>
                        </div>
                        
                        {/* Questions count */}
                        <div className="qty-counter">
                          <button className="counter-btn" onClick={() => updateQuestionTypeQty(qConfig.type, -1)}>
                            <Minus size={14} />
                          </button>
                          <span className="counter-value">{qConfig.numQuestions}</span>
                          <button className="counter-btn" onClick={() => updateQuestionTypeQty(qConfig.type, 1)}>
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Marks */}
                        <div className="qty-counter">
                          <button className="counter-btn" onClick={() => updateQuestionTypeMarks(qConfig.type, -1)}>
                            <Minus size={14} />
                          </button>
                          <span className="counter-value">{qConfig.marksPerQuestion}</span>
                          <button className="counter-btn" onClick={() => updateQuestionTypeMarks(qConfig.type, 1)}>
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Delete Row button */}
                        <button className="qtype-delete-btn" onClick={() => removeQuestionType(qConfig.type)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Dropdown to add new types */}
                  {formQuestionTypes.length < availableQuestionTypes.length && (
                    <div className="add-qtype-row">
                      <select 
                        className="select-qtype"
                        onChange={(e) => {
                          if (e.target.value) {
                            addQuestionType(e.target.value);
                            e.target.value = ''; // Reset select
                          }
                        }}
                      >
                        <option value="">+ Add Question Type...</option>
                        {availableQuestionTypes
                          .filter(t => !formQuestionTypes.some(q => q.type === t))
                          .map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))
                        }
                      </select>
                    </div>
                  )}

                  {/* Table Footer Totals */}
                  <div className="form-totals-summary">
                    <span>Total Questions: {totalQuestions}</span>
                    <span>Total Marks: {totalMarks}</span>
                  </div>
                </div>

                {/* Additional Guidelines text area */}
                <div className="form-group">
                  <label className="form-label" htmlFor="additional-info">Additional Guidelines (For customized prompt)</label>
                  <div className="textarea-instructions-wrapper">
                    <textarea 
                      id="additional-info"
                      placeholder="e.g. Generate a question paper for a 3-hour exam duration. Invert options, focus heavily on NCERT Grade 8 chapter 12..."
                      className="textarea-instructions"
                      value={formAdditionalInstructions}
                      onChange={(e) => setFormAdditionalInstructions(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="textarea-mic-btn"
                      onClick={handleMicClick}
                      title="Microphone (Autofill speech guideline templates)"
                    >
                      <Mic size={16} />
                    </button>
                  </div>
                </div>

                {/* Wizard actions */}
                <div className="form-actions-footer">
                  <button 
                    className="btn-secondary" 
                    onClick={() => setView(assignments.length === 0 ? 'no_assignments' : 'list')}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={submitAssignment}
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? 'Submitting...' : 'Generate Questions'}
                    <Sparkles size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 3: EXAM PAPER OUTPUT VIEW */}
          {currentView === 'output' && selectedAssignment && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              
              {/* REALTIME WS GENERATION PROGRESS LOADER OVERLAY */}
              {(selectedAssignment.status === 'processing' || selectedAssignment.status === 'pending') && (
                <div className="generation-loading-overlay">
                  <div className="loader-card">
                    <div className="loader-spinner"></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <h4 className="loader-title">Generating Question Paper</h4>
                      <p className="loader-message">
                        {generationProgress?.message || 'Queuing job task to background BullMQ worker...'}
                      </p>
                    </div>

                    <div className="loader-bar-bg">
                      <div 
                        className="loader-bar-fill" 
                        style={{ width: `${generationProgress?.progress || 10}%` }}
                      ></div>
                    </div>

                    <div className="metadata-row" style={{ justifyContent: 'center' }}>
                      <Clock size={14} />
                      <span>Est. time remaining: 15-30 seconds</span>
                    </div>
                  </div>
                </div>
              )}

              {/* GENERATION FAILED SCREEN */}
              {selectedAssignment.status === 'failed' && (
                <div className="generation-loading-overlay">
                  <div className="loader-card" style={{ borderTop: '4px solid #C62828' }}>
                    <div className="loader-error-icon">
                      <AlertCircle size={28} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <h4 className="loader-title" style={{ color: '#C62828' }}>Generation Failed</h4>
                      <p className="loader-message" style={{ color: '#E74C3C' }}>
                        {selectedAssignment.error || 'The background worker encountered an unexpected execution crash.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'center' }}>
                      <button 
                        className="btn-secondary" 
                        onClick={() => setView('list')}
                      >
                        Back to List
                      </button>
                      <button 
                        className="btn-primary" 
                        onClick={() => regenerateAssignment(selectedAssignment._id)}
                      >
                        <RefreshCw size={14} />
                        <span>Retry Generation</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUCCESSFUL COMPLETED QUESTION PAPER SHEET VIEW */}
              {selectedAssignment.status === 'completed' && selectedAssignment.paper && (
                <>
                  {/* Top Control Bar */}
                  <div className="output-control-bar">
                    <div className="output-title-section">
                      <h3 className="list-view-title">{selectedAssignment.title}</h3>
                      <span className="list-view-subtitle">AI Generated paper matching standard school test format</span>
                    </div>

                    <div className="paper-actions-group">
                      {/* Regenerate Action button */}
                      <button 
                        className="btn-secondary"
                        onClick={() => {
                          if (confirm('Are you sure you want to regenerate this assignment? This will rewrite current questions.')) {
                            regenerateAssignment(selectedAssignment._id);
                          }
                        }}
                      >
                        <RefreshCw size={14} />
                        <span>Regenerate</span>
                      </button>

                      {/* Download PDF Action button */}
                      <a 
                        href={`http://localhost:5000/api/assignments/${selectedAssignment._id}/pdf`}
                        download
                        className="btn-primary"
                        style={{ textDecoration: 'none' }}
                      >
                        <Download size={14} />
                        <span>Download as PDF</span>
                      </a>
                    </div>
                  </div>

                  {/* Main realistic printable sheet paper */}
                  <div className="paper-sheet">
                    {/* Header */}
                    <div className="paper-school-header">
                      <h2 className="paper-school-name">{selectedAssignment.paper.schoolName}</h2>
                      <span className="paper-subject-sub">Subject: {selectedAssignment.paper.subject}</span>
                      <span className="paper-class-sub">Class: {selectedAssignment.paper.className}</span>
                    </div>

                    {/* Meta info block */}
                    <div className="paper-metadata-row">
                      <span>Time Allowed: {selectedAssignment.paper.timeAllowed}</span>
                      <span>Maximum Marks: {selectedAssignment.paper.maxMarks}</span>
                    </div>

                    <div className="paper-divider"></div>

                    {/* Basic Instructions */}
                    <p className="paper-instructions">
                      {selectedAssignment.paper.instructions}
                    </p>

                    {/* Student Info lines */}
                    <div className="paper-student-info">
                      <div className="info-line">
                        <span>Name:</span>
                        <input type="text" className="info-blank-input" readOnly placeholder="_________________________________________" />
                      </div>
                      <div className="info-line">
                        <span>Roll Number:</span>
                        <input type="text" className="info-blank-input" readOnly placeholder="_______________________________" />
                      </div>
                      <div className="info-line" style={{ gridColumn: 'span 2' }}>
                        <span>Class Section:</span>
                        <input type="text" className="info-blank-input" readOnly placeholder="____________________________________________________________________________________" />
                      </div>
                    </div>

                    {/* Render Sections */}
                    {selectedAssignment.paper.sections.map((section, sIdx) => (
                      <div key={section.title} className="paper-section">
                        <h4 className="paper-section-title">{section.title}</h4>
                        <div className="paper-section-subinfo">
                          <span className="paper-section-type">{section.type}</span>
                          <span className="paper-section-instruction">{section.instruction}</span>
                        </div>

                        <div className="paper-questions-list">
                          {section.questions.map((q, qIdx) => (
                            <div key={qIdx} className="paper-question-item">
                              <div className="paper-question-header-row">
                                <span>{qIdx + 1}.</span>
                                <div className="question-text-wrapper">
                                  {/* Visual Difficulty Tag Badges */}
                                  <span className={`difficulty-badge ${
                                    q.difficulty === 'Easy' 
                                      ? 'difficulty-easy' 
                                      : q.difficulty === 'Moderate'
                                      ? 'difficulty-moderate'
                                      : 'difficulty-challenging'
                                  }`}>
                                    {q.difficulty}
                                  </span>
                                  <span>{q.text}</span>
                                </div>
                                <span className="question-marks">[{q.marks} Mark{q.marks > 1 ? 's' : ''}]</span>
                              </div>

                              {/* Render Options for MCQ */}
                              {q.options && q.options.length > 0 && (
                                <div className="paper-question-options">
                                  {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="option-item">
                                      <span>({['a','b','c','d'][oIdx]}) {opt}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="paper-end-line">
                      End of Question Paper
                    </div>
                  </div>

                  {/* Toggle Show Answer Key button */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <button 
                      className="btn-secondary" 
                      onClick={() => setShowAnswerKey(!showAnswerKey)}
                    >
                      {showAnswerKey ? 'Hide Answer Key' : 'Reveal Answer Key'}
                    </button>
                  </div>

                  {/* Answer Key block */}
                  {showAnswerKey && selectedAssignment.paper.answerKey && (
                    <div className="answer-key-box">
                      <h4 className="answer-key-title">Answer Key & Explanations</h4>
                      <div className="answer-key-list">
                        {selectedAssignment.paper.answerKey.map((item, index) => (
                          <div key={index} className="answer-key-item">
                            <span className="answer-key-question">
                              {item.sectionTitle} - Question {item.questionIndex}: "{item.questionText}"
                            </span>
                            <p className="answer-key-solution">
                              <strong>Correct answer/steps:</strong> {item.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
