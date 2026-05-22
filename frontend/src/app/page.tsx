'use client';

import React, { useEffect, useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
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
  AlertCircle,
  ArrowLeft,
  LayoutGrid,
  Bell,
  Book,
  Contact,
  PieChart,
  MoreVertical,
  Menu,
  Moon,
  Sun
} from 'lucide-react';

// Custom SVGs matching the Figma screenshot exactly
const HomeIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const MyGroupsIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    {/* Left Person (Solid Silhouette Waving) */}
    <circle cx="8" cy="8.5" r="3" fill="currentColor" />
    <path d="M3 19c0-2.5 2-4.5 4.5-4.5h1c1.2 0 2.2.5 3 1.2V19H3z" fill="currentColor" />
    <path d="M4.5 14.5C3.3 13 2.5 11 3 9.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Right Person (Outlined Foreground) */}
    <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M12 19c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

const AssignmentsIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <circle cx="8" cy="13" r="1.2" fill="currentColor" stroke="none" />
    <line x1="11" y1="13" x2="16" y2="13" />
    <circle cx="8" cy="17" r="1.2" fill="currentColor" stroke="none" />
    <line x1="11" y1="17" x2="16" y2="17" />
  </svg>
);

const BookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
    <path d="M6 18h10" />
  </svg>
);

const VedaLogo = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    {/* Left fold (black) */}
    <path d="M5 4H10L14 18H9L5 4Z" fill="#1A1A1A" />
    {/* Right fold (black/grey) */}
    <path d="M14 18L19 4H14L10 18H14Z" fill="#1A1A1A" />
    {/* Top orange accent */}
    <circle cx="12" cy="7" r="2.5" fill="#E8470A" />
  </svg>
);

const PieChartIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);



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
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Live elapsed timer during generation — must be after store destructuring
  useEffect(() => {
    if (!selectedAssignment || (selectedAssignment.status !== 'processing' && selectedAssignment.status !== 'pending')) {
      setElapsedSeconds(0);
      return;
    }
    setElapsedSeconds(0);
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedAssignment?.status, selectedAssignment?._id]);

  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  // Initialize socket connection and load assignments list on mount
  useEffect(() => {
    initSocket();
    fetchAssignments();

    const handleDocumentClick = (e: MouseEvent) => {
      // Only close if the click is outside a card-menu-wrapper
      if (!(e.target as Element).closest('.card-menu-wrapper')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);

    return () => {
      disconnectSocket();
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '20-06-2025';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '20-06-2025';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return '20-06-2025';
    }
  };

  const formatDueDate = (dateStr: string) => {
    if (!dateStr) return '21-06-2025';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return dateStr;
  };

  // Sync selected assignment with changes in store (e.g. status changes via WS)
  useEffect(() => {
    if (selectedAssignment) {
      const updated = assignments.find(a => a._id === selectedAssignment._id);
      if (updated) {
        setSelectedAssignment(updated);
      }
    }
  }, [assignments, selectedAssignment, setSelectedAssignment]);

  const [isExtractingText, setIsExtractingText] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);

  // Helper to process uploaded file (text or image)
  const processUploadedFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
      try {
        setIsExtractingText(true);
        setExtractionProgress(0);
        
        // Use Tesseract to perform OCR directly in the browser
        const result = await Tesseract.recognize(file, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text') {
              setExtractionProgress(Math.round(m.progress * 100));
            }
          }
        });
        
        const extractedText = result.data.text;
        setFormFile(file.name, extractedText || `[No text found in image]`);
      } catch (err) {
        console.error("OCR Error:", err);
        setFormFile(file.name, `[Error extracting text from image]`);
      } finally {
        setIsExtractingText(false);
        setExtractionProgress(0);
      }
    } else if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setFormFile(file.name, text || `Document Name: ${file.name}`);
      };
      reader.readAsText(file);
    } else {
      // Mock parsing for non-text/non-image files in client env
      setFormFile(
        file.name, 
        `[Parsed Document Meta]\nFilename: ${file.name}\nSize: ${Math.round(file.size / 1024)} KB\nType: ${file.type}\nUploaded on: ${new Date().toLocaleDateString()}`
      );
    }
  };

  // Handle local text file reading
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
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
    processUploadedFile(file);
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
            <div className="logo-box">
              <VedaLogo size={22} />
            </div>
            <h1 className="logo-text">VedaAI</h1>
          </div>

          {/* Create Assignment button */}
          <button 
            className="toolkit-btn" 
            onClick={() => {
              resetForm();
              setView('create');
            }}
          >
            <Sparkles size={16} />
            <span>{currentView === 'output' ? "AI Teacher's Toolkit" : "Create Assignment"}</span>
          </button>

          {/* Menu Items */}
          <nav className="sidebar-menu">
            <button 
              className={`menu-item ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => setView('home')}
            >
              <HomeIcon size={20} />
              <span>Home</span>
            </button>
            <button 
              className={`menu-item ${currentView === 'groups' ? 'active' : ''}`}
              onClick={() => setView('groups')}
            >
              <MyGroupsIcon size={20} />
              <span>My Groups</span>
            </button>
            <button 
              className={`menu-item ${currentView === 'list' || currentView === 'create' ? 'active' : ''}`}
              onClick={() => setView(assignments.length === 0 ? 'no_assignments' : 'list')}
            >
              <AssignmentsIcon size={20} />
              <span>Assignments</span>
              {currentView === 'output' && (
                <span className="assignments-count">32</span>
              )}
              {currentView !== 'output' && assignments.length > 0 && (
                <span className="assignments-count">{assignments.length}</span>
              )}
            </button>
            <button 
              className={`menu-item ${currentView === 'toolkit' ? 'active' : ''}`}
              onClick={() => setView('toolkit')}
            >
              <BookIcon size={20} />
              <span>AI Teacher's Toolkit</span>
            </button>
            <button 
              className={`menu-item ${currentView === 'library' ? 'active' : ''}`}
              onClick={() => setView('library')}
            >
              <PieChartIcon size={20} />
              <span>My Library</span>
              {currentView === 'create' && (
                <span className="assignments-count">32</span>
              )}
            </button>
          </nav>
        </div>

        {/* Settings link */}
        <button 
          className={`menu-item ${currentView === 'settings' ? 'active' : ''}`} 
          style={{ marginBottom: 6 }}
          onClick={() => setView('settings')}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>

        {/* School Info Footer Card */}
        <div className="school-card">
          <img 
            src={currentView === 'create' ? "/john_doe_avatar.png" : "/school_avatar.png"} 
            alt="School Avatar" 
            className="school-avatar-img" 
          />
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
          {/* Mobile Logo */}
          <div className="mobile-header-logo">
            <div className="mobile-logo-box">
              <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '18px', fontFamily: 'Inter, sans-serif', lineHeight: 1, letterSpacing: '-1px' }}>V</span>
            </div>
            <h1 className="mobile-logo-text">VedaAI</h1>
          </div>

          {/* Desktop Breadcrumb */}
          <div className="header-breadcrumb">
              {currentView === 'create' || currentView === 'output' ? (
                <button 
                  className="breadcrumb-back-btn" 
                  onClick={() => setView('list')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', fontSize: '13.5px', fontWeight: '500' }}
                >
                  <ArrowLeft size={16} />
                  <Sparkles size={14} style={{ color: '#9B9B9B' }} />
                  <span>Create New</span>
                </button>
              ) : (
                <>
                  <span className="breadcrumb-muted">VedaAI</span>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-active">Assignment Creator</span>
                </>
              )}
            </div>

          <div className="profile-section">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%' }}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={18} style={{ color: 'var(--text-primary)' }} /> : <Moon size={18} style={{ color: 'var(--text-primary)' }} />}
            </button>
            <div className="notification-bell">
              <span className="notification-badge"></span>
              <Bell size={18} style={{ color: 'var(--text-primary)' }} />
            </div>
            <div className="profile-card">
              <img src="/john_doe_avatar.png" alt="User Profile" className="profile-avatar-img" />
              <span className="profile-name">John Doe</span>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} className="profile-name" />
            </div>
            <button className="mobile-menu-btn">
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Sub-View Switcher inside content card */}
        <div className="content-card">
          
          {/* SCREEN 0: NO ASSIGNMENTS YET (homepage) */}
          {currentView === 'no_assignments' && (
            <div className="empty-state-container">
              {/* Illustrated SVG - magnifying glass with X, matching Figma */}
              <div className="empty-state-illustration">
                <svg width="220" height="200" viewBox="0 0 260 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Large background circle */}
                  <circle cx="125" cy="125" r="90" fill="#F0F0F6" />

                  {/* Squiggle thread — top left */}
                  <path d="M42 68 C46 54, 52 54, 54 64 C56 74, 62 76, 66 66 C70 56, 76 58, 76 66" stroke="#3A3A50" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

                  {/* Small notification card — top right */}
                  <rect x="172" y="52" width="48" height="30" rx="6" fill="white" stroke="#E0E0EA" strokeWidth="1.2"/>
                  <rect x="180" y="60" width="24" height="3" rx="1.5" fill="#C8C8D4" />
                  <rect x="180" y="67" width="16" height="3" rx="1.5" fill="#DDDDE6" />

                  {/* Document — white paper, slightly tilted */}
                  <g transform="rotate(-4, 115, 115)">
                    <rect x="68" y="50" width="94" height="120" rx="10" fill="white" filter="url(#docShadow)"/>
                    {/* Title bar */}
                    <rect x="86" y="72" width="48" height="6" rx="3" fill="#2A2A3A" />
                    {/* Content lines */}
                    <rect x="86" y="88" width="60" height="4" rx="2" fill="#E8E8F0" />
                    <rect x="86" y="100" width="52" height="4" rx="2" fill="#E8E8F0" />
                    <rect x="86" y="112" width="56" height="4" rx="2" fill="#E8E8F0" />
                    <rect x="86" y="124" width="40" height="4" rx="2" fill="#E8E8F0" />
                  </g>

                  {/* Magnifying glass */}
                  <circle cx="152" cy="148" r="36" fill="white" stroke="#C4C4D8" strokeWidth="3"/>
                  <circle cx="152" cy="148" r="28" fill="#F4F4FA" />
                  {/* Red X inside */}
                  <line x1="140" y1="136" x2="164" y2="160" stroke="#E74C3C" strokeWidth="6" strokeLinecap="round"/>
                  <line x1="164" y1="136" x2="140" y2="160" stroke="#E74C3C" strokeWidth="6" strokeLinecap="round"/>
                  {/* Handle */}
                  <line x1="178" y1="174" x2="198" y2="196" stroke="#B0B0BE" strokeWidth="7" strokeLinecap="round"/>

                  {/* Blue sparkle star — bottom left */}
                  <path d="M52 178 L54.5 170 L57 178 L65 180.5 L57 183 L54.5 191 L52 183 L44 180.5 Z" fill="#6C8EEF" opacity="0.8"/>

                  {/* Blue dot — right */}
                  <circle cx="212" cy="160" r="5" fill="#3B5998" opacity="0.7"/>

                  {/* Shadow filter for document */}
                  <defs>
                    <filter id="docShadow" x="-4" y="-2" width="108" height="132" filterUnits="userSpaceOnUse">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#00000010"/>
                    </filter>
                  </defs>
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

              {/* Mobile FAB — fixed circle plus button */}
              <button
                className="fab-create-btn"
                onClick={() => {
                  resetForm();
                  setView('create');
                }}
              >
                <Plus size={22} />
              </button>
            </div>
          )}

          {/* SCREEN 1: ASSIGNMENTS LIST VIEW */}
          {currentView === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              {/* Mobile-only sub-header: ← Assignments (centered) */}
              <div className="mobile-list-subheader">
                <button className="mobile-back-btn" onClick={() => setView('no_assignments')}>
                  <ArrowLeft size={18} />
                </button>
                <span className="mobile-list-title">Assignments</span>
              </div>

              {/* Desktop header */}
              <div className="list-view-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="green-check-dot"></div>
                  <div className="list-view-title-container">
                    <h3 className="list-view-title" style={{ margin: 0 }}>Assignments</h3>
                    <span className="list-view-subtitle">Manage and create assignments for your classes.</span>
                  </div>
                </div>
              </div>

              <div className="filter-search-bar">
                <div className="filter-group">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="filter-icon">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  <span className="filter-text">Filter By</span>
                </div>
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search Assignment" 
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
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
                        {/* Top Row: Title and Three-Dot dropdown menu */}
                        <div className="card-top-row">
                          <h4 className="card-title">{assign.title}</h4>
                          <div className="card-menu-wrapper" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="card-menu-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(activeDropdownId === assign._id ? null : assign._id);
                              }}
                            >
                              <MoreVertical size={16} />
                            </button>
                            
                            {activeDropdownId === assign._id && (
                              <div className="card-dropdown-menu">
                                <button 
                                  className="dropdown-item"
                                  onClick={() => {
                                    setSelectedAssignment(assign);
                                    setView('output');
                                    setActiveDropdownId(null);
                                  }}
                                >
                                  View Assignment
                                </button>
                                <button 
                                  className="dropdown-item delete"
                                  onClick={() => {
                                    deleteAssignment(assign._id);
                                    setActiveDropdownId(null);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Row: Assigned on and Due dates */}
                        <div className="card-bottom-row">
                          <span className="card-date">Assigned on : {formatDate(assign.createdAt)}</span>
                          <span className="card-date">Due : {formatDueDate(assign.dueDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              {/* Mobile-only "← Create Assignment" sub-header */}
              <div className="mobile-list-subheader" style={{ marginBottom: '16px' }}>
                <button className="mobile-back-btn" onClick={() => setView(assignments.length === 0 ? 'no_assignments' : 'list')}>
                  <ArrowLeft size={18} />
                </button>
                <span className="mobile-list-title">Create Assignment</span>
              </div>

              {/* Outer Header with green dot */}
              <div className="form-outer-header">
                <div className="green-check-dot"></div>
                <div>
                  <h3 className="form-title-outer">Create Assignment</h3>
                  <span className="form-subtitle-outer">Set up a new assignment for your students</span>
                </div>
              </div>

              {/* Progress bar outside card */}
              <div className="form-progress-bar-outer">
                <div className="progress-step-segment active"></div>
                <div className="progress-step-segment"></div>
              </div>

              {/* Form card */}
              <div className="create-form-card">
                <div className="form-inner-header">
                  <h4 className="form-inner-title">Assignment Details</h4>
                  <span className="form-inner-subtitle">Basic information about your assignment</span>
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
                    {isExtractingText ? (
                      <div className="flex flex-col items-center justify-center gap-2" style={{ padding: '20px' }}>
                        <RefreshCw size={28} className="text-brand-primary" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--brand-primary)' }} />
                        <p className="upload-text-primary" style={{ marginTop: '8px' }}>Extracting text from image...</p>
                        <p className="upload-text-secondary">{extractionProgress}% complete</p>
                      </div>
                    ) : formFileName ? (
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
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="calendar-icon-btn" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="4" ry="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="12" y1="13" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="9" y1="16" x2="15" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                {/* Question Types Configurator - Figma style */}
                <div className="form-group">
                  <div className="qconfig-header-row">
                    <span className="form-label">Question Type</span>
                    <span className="form-label"></span>
                    <span className="form-label text-center">No. of Questions</span>
                    <span className="form-label text-center">Marks</span>
                  </div>

                  <div className="qconfig-rows">
                    {formQuestionTypes.map((qConfig) => (
                      <div key={qConfig.type} className="qconfig-row-figma">
                        {/* Dropdown selector */}
                        <div className="qtype-select-wrapper" style={{ position: 'relative' }}>
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
                          <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B6B6B' }} />
                        </div>

                        {/* X button outside */}
                        <button
                          className="qtype-x-btn-outside"
                          onClick={() => removeQuestionType(qConfig.type)}
                          title="Remove"
                        >
                          <X size={16} />
                        </button>

                        {/* Counters: side by side with labels on mobile */}
                        <div className="qconfig-counters-row">
                          <div style={{ flex: 1 }}>
                            <div className="qconfig-counter-label">No. of Questions</div>
                            <div className="qty-counter-figma" style={{ width: '100%' }}>
                              <button className="counter-btn-figma" onClick={() => updateQuestionTypeQty(qConfig.type, -1)}>
                                <Minus size={13} />
                              </button>
                              <span className="counter-val-figma">{qConfig.numQuestions}</span>
                              <button className="counter-btn-figma" onClick={() => updateQuestionTypeQty(qConfig.type, 1)}>
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="qconfig-counter-label">Marks</div>
                            <div className="qty-counter-figma" style={{ width: '100%' }}>
                              <button className="counter-btn-figma" onClick={() => updateQuestionTypeMarks(qConfig.type, -1)}>
                                <Minus size={13} />
                              </button>
                              <span className="counter-val-figma">{qConfig.marksPerQuestion}</span>
                              <button className="counter-btn-figma" onClick={() => updateQuestionTypeMarks(qConfig.type, 1)}>
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>
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
            <div className={selectedAssignment.status === 'completed' ? "output-view-container" : ""} style={selectedAssignment.status !== 'completed' ? { display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' } : undefined}>

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
                      <span>{elapsedSeconds < 5 ? 'Starting generation...' : `Processing for ${elapsedSeconds}s...`}</span>
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
                    <div className="ai-banner-text" style={{ fontSize: '15px', fontWeight: '500', color: '#FFFFFF' }}>
                      Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:
                    </div>
                    <div className="ai-banner-actions">
                      <button 
                        className="btn-banner-regen" 
                        onClick={() => regenerateAssignment(selectedAssignment._id)}
                        style={{ marginRight: '8px' }}
                      >
                        <RefreshCw size={14} />
                        <span>Regenerate</span>
                      </button>
                      <a
                        href={`http://localhost:5000/api/assignments/${selectedAssignment._id}/pdf`}
                        download
                        className="btn-banner-pdf"
                        style={{ borderRadius: '999px', padding: '10px 20px', background: 'white', color: '#333333', fontWeight: '500' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
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
                    <div className="paper-student-info" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: '#1A1A1A', margin: '16px 0', border: 'none', borderRadius: 0, padding: 0 }}>
                      <div style={{ fontWeight: '600' }}>Name: ______________________</div>
                      <div style={{ fontWeight: '600' }}>Roll Number: _______________</div>
                      <div style={{ fontWeight: '600' }}>Class: {selectedAssignment.paper.className} Section: ________</div>
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
                              <div className="paper-question-header-row" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.6', marginBottom: 4 }}>
                                <span style={{ fontWeight: '500' }}>{qIdx + 1}.</span>
                                <span style={{ 
                                  padding: '2px 8px', 
                                  borderRadius: '4px', 
                                  fontSize: '11px', 
                                  fontWeight: '600', 
                                  backgroundColor: q.difficulty.toLowerCase() === 'easy' ? '#E8F5E9' : q.difficulty.toLowerCase() === 'medium' || q.difficulty.toLowerCase() === 'moderate' ? '#FFF8E1' : '#FFEBEE',
                                  color: q.difficulty.toLowerCase() === 'easy' ? '#2E7D32' : q.difficulty.toLowerCase() === 'medium' || q.difficulty.toLowerCase() === 'moderate' ? '#F57F17' : '#C62828'
                                }}>
                                  {q.difficulty}
                                </span>
                                <span style={{ flex: 1 }}>{q.text}</span>
                                <span style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '12.5px' }}>[{q.marks} Mark{q.marks > 1 ? 's' : ''}]</span>
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

                    {/* Answer Key block directly on sheet */}
                    {selectedAssignment.paper.answerKey && (
                      <div className="paper-answer-key-section" style={{ marginTop: '24px' }}>
                        <h4 style={{ fontSize: '15px', color: '#1A1A1A', marginBottom: '12px', fontWeight: 'bold' }}>Answer Key:</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#1A1A1A', lineHeight: '1.6' }}>
                          {selectedAssignment.paper.answerKey.map((item, index) => (
                            <div key={index}>
                              <span>{index + 1}. {item.answer}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* DUMMY VIEWS FOR SIDEBAR */}
          {['home', 'groups', 'toolkit', 'library', 'settings'].includes(currentView) && (
            <div className="empty-state-container" style={{ flexGrow: 1 }}>
              <div className="empty-state-illustration" style={{ opacity: 0.5 }}>
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#C8C8D8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
              </div>
              <h3 className="empty-state-title" style={{ textTransform: 'capitalize' }}>
                {currentView.replace('_', ' ')}
              </h3>
              <p className="empty-state-desc">
                This feature is coming soon. Stay tuned!
              </p>
            </div>
          )}

        </div>
      </section>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="mobile-bottom-nav">
        <button 
          className={`mobile-nav-item ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => setView('home')}
        >
          <HomeIcon size={22} />
          <span>Home</span>
        </button>
        <button 
          className={`mobile-nav-item ${currentView === 'list' || currentView === 'no_assignments' || currentView === 'create' || currentView === 'output' ? 'active' : ''}`}
          onClick={() => setView(assignments.length === 0 ? 'no_assignments' : 'list')}
        >
          <AssignmentsIcon size={22} />
          <span>Assignments</span>
        </button>
        <button 
          className={`mobile-nav-item ${currentView === 'library' ? 'active' : ''}`}
          onClick={() => setView('library')}
        >
          <PieChartIcon size={22} />
          <span>Library</span>
        </button>
        <button 
          className={`mobile-nav-item ${currentView === 'toolkit' ? 'active' : ''}`}
          onClick={() => setView('toolkit')}
        >
          <Sparkles size={22} />
          <span>AI Toolkit</span>
        </button>
      </nav>
    </main>
  );
}
