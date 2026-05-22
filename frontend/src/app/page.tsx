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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {currentView === 'create' && (
              <button className="back-btn" onClick={() => setView(assignments.length === 0 ? 'no_assignments' : 'list')}>
                ← Assignment
              </button>
            )}
            {currentView === 'output' && (
              <button className="back-btn" onClick={() => setView('list')}>
                ← Assignment
              </button>
            )}
            {(currentView === 'list' || currentView === 'no_assignments') && (
              <>
                <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>&#8592;</span>
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Assignment</span>
              </>
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
          
          {/* SCREEN 0: NO ASSIGNMENTS YET (homepage) */}
          {currentView === 'no_assignments' && (
            <div className="empty-state-container">
              {/* Illustrated SVG - magnifying glass with X, matching Figma */}
              <div className="empty-state-illustration">
                <svg width="180" height="160" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Background circle */}
                  <circle cx="100" cy="95" r="72" fill="#EEEEF5" />
                  {/* Document */}
                  <rect x="62" y="34" width="76" height="96" rx="6" fill="white" stroke="#C8C8D8" strokeWidth="1.5"/>
                  <rect x="74" y="50" width="40" height="5" rx="2.5" fill="#333" />
                  <rect x="74" y="62" width="52" height="4" rx="2" fill="#DDDDE8" />
                  <rect x="74" y="72" width="44" height="4" rx="2" fill="#DDDDE8" />
                  <rect x="74" y="82" width="48" height="4" rx="2" fill="#DDDDE8" />
                  <rect x="74" y="92" width="36" height="4" rx="2" fill="#DDDDE8" />
                  {/* Squiggle line top left */}
                  <path d="M52 42 Q56 36 60 42 Q64 48 68 42" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  {/* Magnifying glass */}
                  <circle cx="118" cy="108" r="30" fill="white" stroke="#C8C8D8" strokeWidth="2"/>
                  <circle cx="118" cy="108" r="22" fill="#EEEEF5" />
                  {/* X inside magnifying glass */}
                  <line x1="108" y1="98" x2="128" y2="118" stroke="#E8470A" strokeWidth="5" strokeLinecap="round"/>
                  <line x1="128" y1="98" x2="108" y2="118" stroke="#E8470A" strokeWidth="5" strokeLinecap="round"/>
                  {/* Handle */}
                  <line x1="140" y1="130" x2="156" y2="148" stroke="#999" strokeWidth="6" strokeLinecap="round"/>
                  {/* Sparkle dots */}
                  <path d="M68 130 L70 124 L72 130 L78 132 L72 134 L70 140 L68 134 L62 132 Z" fill="#6C8EEF" opacity="0.7"/>
                  <circle cx="152" cy="82" r="5" fill="#6C8EEF" opacity="0.6"/>
                </svg>
              </div>

              <h3 className="empty-state-title">No assignments yet</h3>
              <p className="empty-state-desc">
                Create your first assignment to start collecting and grading student submissions.
                You can set up rubrics, define marking criteria, and let AI assist with grading.
              </p>
              <button
                className="empty-state-create-btn"
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
            <div className="create-form-page">
              {/* Form card */}
              <div className="create-form-card">
                {/* Progress bar at top */}
                <div className="form-progress-bar">
                  <div className="form-progress-fill"></div>
                </div>

                <div className="form-header-container">
                  <div>
                    <h3 className="form-title">Create Assignment</h3>
                    <span className="form-subtitle">Set up a new assignment for your students</span>
                  </div>
                </div>

                {/* Upload Zone - Large Centered (Figma style) */}
                <div className="form-group">
                  <div
                    className={`upload-zone-large ${dragOver ? 'drag-over' : ''}`}
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
                      accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    {formFileName ? (
                      <div className="file-pill-large" onClick={e => e.stopPropagation()}>
                        <FileText size={18} />
                        <span>{formFileName}</span>
                        <button className="remove-file-btn" onClick={() => setFormFile(null, null)}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="upload-cloud-icon">
                          <Upload size={28} />
                        </div>
                        <p className="upload-text-primary">Choose a file or drag &amp; drop it here</p>
                        <p className="upload-text-secondary">JPEG, PNG, upto 10MB</p>
                        <button
                          className="browse-files-btn"
                          onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        >
                          Browse Files
                        </button>
                      </>
                    )}
                  </div>
                  <p className="upload-hint-text">Upload images of your preferred document/image</p>
                </div>

                {/* Due Date */}
                <div className="form-group">
                  <label className="form-label" htmlFor="due-date">Due Date</label>
                  <div className="date-picker-wrapper">
                    <input
                      id="due-date"
                      type="date"
                      className="input-date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      placeholder="DD-MM-YYYY"
                    />
                    <Calendar size={18} className="calendar-icon-btn" />
                  </div>
                </div>

                {/* Question Types Configurator - Figma style */}
                <div className="form-group">
                  <div className="qconfig-header-row">
                    <span className="form-label" style={{ flex: 1 }}>Question Type</span>
                    <span className="form-label" style={{ width: 130, textAlign: 'center' }}>No. of Questions</span>
                    <span className="form-label" style={{ width: 100, textAlign: 'center' }}>Marks</span>
                    <span style={{ width: 32 }}></span>
                  </div>

                  <div className="qconfig-rows">
                    {formQuestionTypes.map((qConfig) => (
                      <div key={qConfig.type} className="qconfig-row-figma">
                        {/* Dropdown selector */}
                        <div className="qtype-select-wrapper">
                          <select
                            className="qtype-select-dropdown"
                            value={qConfig.type}
                            onChange={(e) => {
                              if (e.target.value && e.target.value !== qConfig.type) {
                                removeQuestionType(qConfig.type);
                                addQuestionType(e.target.value);
                              }
                            }}
                          >
                            <option value={qConfig.type}>{qConfig.type}</option>
                            {availableQuestionTypes
                              .filter(t => !formQuestionTypes.some(q => q.type === t))
                              .map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                          </select>
                          <button
                            className="qtype-x-btn"
                            onClick={() => removeQuestionType(qConfig.type)}
                            title="Remove"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* Questions counter */}
                        <div className="qty-counter-figma">
                          <button className="counter-btn-figma" onClick={() => updateQuestionTypeQty(qConfig.type, -1)}>
                            <Minus size={13} />
                          </button>
                          <span className="counter-val-figma">{qConfig.numQuestions}</span>
                          <button className="counter-btn-figma" onClick={() => updateQuestionTypeQty(qConfig.type, 1)}>
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Marks counter */}
                        <div className="qty-counter-figma">
                          <button className="counter-btn-figma" onClick={() => updateQuestionTypeMarks(qConfig.type, -1)}>
                            <Minus size={13} />
                          </button>
                          <span className="counter-val-figma">{qConfig.marksPerQuestion}</span>
                          <button className="counter-btn-figma" onClick={() => updateQuestionTypeMarks(qConfig.type, 1)}>
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Question Type pill button */}
                  {formQuestionTypes.length < availableQuestionTypes.length && (
                    <div className="add-qtype-figma">
                      <select
                        className="add-qtype-select-hidden"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            addQuestionType(e.target.value);
                          }
                        }}
                      >
                        <option value=""></option>
                        {availableQuestionTypes
                          .filter(t => !formQuestionTypes.some(q => q.type === t))
                          .map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                      </select>
                      <div className="add-qtype-pill">
                        <div className="add-qtype-circle">
                          <Plus size={14} />
                        </div>
                        <span>Add Question Type</span>
                      </div>
                    </div>
                  )}

                  {/* Totals - right-aligned */}
                  <div className="form-totals-right">
                    <span>Total Questions : <strong>{totalQuestions}</strong></span>
                    <span>Total Marks : <strong>{totalMarks}</strong></span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="form-group">
                  <label className="form-label" htmlFor="additional-info">Additional Information (For better output)</label>
                  <div className="textarea-instructions-wrapper">
                    <textarea
                      id="additional-info"
                      placeholder="e.g Generate a question paper for a 3 hour exam duration..."
                      className="textarea-instructions"
                      value={formAdditionalInstructions}
                      onChange={(e) => setFormAdditionalInstructions(e.target.value)}
                    />
                    <button
                      type="button"
                      className="textarea-mic-btn"
                      onClick={handleMicClick}
                      title="Autofill example"
                    >
                      <Mic size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Previous / Next bottom navigation */}
              <div className="create-form-footer">
                <button
                  className="btn-footer-prev"
                  onClick={() => setView(assignments.length === 0 ? 'no_assignments' : 'list')}
                >
                  ← Previous
                </button>
                <button
                  className="btn-footer-next"
                  onClick={submitAssignment}
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Generating...' : 'Next →'}
                </button>
              </div>
            </div>
          )}


          {/* SCREEN 3: EXAM PAPER OUTPUT VIEW */}
          {currentView === 'output' && selectedAssignment && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>

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
                      <button className="btn-secondary" onClick={() => setView('list')}>Back to List</button>
                      <button className="btn-primary" onClick={() => regenerateAssignment(selectedAssignment._id)}>
                        <RefreshCw size={14} />
                        <span>Retry Generation</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* COMPLETED - Dark AI Banner + Paper Sheet */}
              {selectedAssignment.status === 'completed' && selectedAssignment.paper && (
                <>
                  {/* Dark AI banner matching Figma */}
                  <div className="ai-output-banner">
                    <div className="ai-banner-text">
                      <Sparkles size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>
                        Here is your AI-generated question paper for <strong>{selectedAssignment.title}</strong>. 
                        Review the paper below and download as PDF when ready.
                      </span>
                    </div>
                    <div className="ai-banner-actions">
                      <button
                        className="btn-banner-regen"
                        onClick={() => {
                          if (confirm('Regenerate this assignment? Current questions will be replaced.')) {
                            regenerateAssignment(selectedAssignment._id);
                          }
                        }}
                      >
                        <RefreshCw size={14} />
                        <span>Regenerate</span>
                      </button>
                      <a
                        href={`http://localhost:5000/api/assignments/${selectedAssignment._id}/pdf`}
                        download
                        className="btn-banner-pdf"
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
