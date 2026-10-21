import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

// Pre-configured code templates for instant testing
const PRESETS = {
  twoSum: {
    title: 'Two Sum',
    day: '234',
    language: 'cpp',
    code: `// Problem: Two Sum (LeetCode #1)
// Goal: Find indices of two numbers that add up to target

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> numMap; // value -> index
        
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            
            if (numMap.find(complement) != numMap.end()) {
                return {numMap[complement], i};
            }
            
            numMap[nums[i]] = i;
        }
        
        return {};
    }
};`
  },
  minOpsSort: {
    title: 'Minimum Operations to Sort a String',
    day: '235',
    language: 'cpp',
    code: `class Solution {
public:
    int minOperations(string s) {
        string sorted_s = s;
        sort(sorted_s.begin(), sorted_s.end());
        
        if (s == sorted_s) return 0;
        if (s.length() == 2) return -1;
        if (s.front() == sorted_s.front() || s.back() == sorted_s.back()) return 1;
        
        return 2;
    }
};`
  },
  validParentheses: {
    title: 'Valid Parentheses',
    day: '236',
    language: 'cpp',
    code: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') {
                st.push(c);
            } else {
                if (st.empty()) return false;
                char top = st.top();
                if ((c == ')' && top != '(') ||
                    (c == '}' && top != '{') ||
                    (c == ']' && top != '[')) {
                    return false;
                }
                st.pop();
            }
        }
        return st.empty();
    }
};`
  }
};

export default function App() {
  const [code, setCode] = useState(PRESETS.minOpsSort.code);
  const [language, setLanguage] = useState('cpp');
  const [day, setDay] = useState('234');
  const [problemTitle, setProblemTitle] = useState('Minimum Operations to Sort a String');
  const [submissionLink, setSubmissionLink] = useState('');
  
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'raw' | 'analytics'
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const textareaRef = useRef(null);

  // Cycling loading feedback steps to give real-time feel
  const loadingMessages = [
    'Parsing AST & inspecting solution logic...',
    'Evaluating algorithmic invariants...',
    'Deducing accurate Time & Auxiliary Space complexities...',
    'Composing LinkedIn streak post...'
  ];

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 1400);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Update cursor position line & col
  const handleCursorUpdate = (e) => {
    const text = e.target.value;
    const selStart = e.target.selectionStart;
    const lines = text.substring(0, selStart).split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };

  // Toast notification auto-dismiss
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Preset Selection
  const applyPreset = (key) => {
    const preset = PRESETS[key];
    if (preset) {
      setCode(preset.code);
      setLanguage(preset.language);
      setDay(preset.day);
      setProblemTitle(preset.title);
      setError('');
      showToast(`Loaded "${preset.title}" preset`);
    }
  };

  // Generate Caption API Call
  const handleGenerate = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Please paste your solution code before clicking Generate.');
      return;
    }
    if (trimmed.length < 15) {
      setError('The provided code is too short. Please provide a full function or solution.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Intelligently route to localhost:3000 if opened directly via file:///
      const apiUrl = window.location.protocol === 'file:' 
        ? 'http://localhost:3000/api/generate' 
        : '/api/generate';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: trimmed,
          language,
          day: day.trim(),
          problemTitle: problemTitle.trim(),
          submissionLink: submissionLink.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred while generating caption.');
      }

      setCaption(data.caption);
      setActiveTab('preview');
      showToast('Caption generated successfully!');

      // Gentle celebratory micro-burst
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#38bdf8', '#10b981']
      });

    } catch (err) {
      if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
        setError('Backend server is offline! Please run "npm start" in your terminal and visit http://localhost:3000 in your browser.');
      } else {
        setError(err.message || 'Failed to connect to backend server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Copy with Confetti
  const handleCopy = async () => {
    if (!caption) return;
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      showToast('✓ Caption copied to clipboard!');

      // Rich Confetti Celebration Effect
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b']
      });

      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      setError('Unable to access clipboard. Please copy manually.');
    }
  };

  // Calculate quick metrics for analytics tab
  const getAnalytics = () => {
    if (!caption) return { chars: 0, words: 0, hashtags: 0, lines: 0 };
    const words = caption.trim().split(/\s+/).filter(Boolean).length;
    const chars = caption.length;
    const hashtags = (caption.match(/#[a-zA-Z0-9_]+/g) || []).length;
    const lines = caption.split('\n').length;
    return { chars, words, hashtags, lines };
  };

  const analytics = getAnalytics();

  return (
    <div className="pro-app">
      {/* Background Ambient Glows */}
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <span className="toast-icon">✨</span>
          <span className="toast-text">{toast}</span>
        </div>
      )}

      {/* Header Navigation */}
      <header className="navbar">
        <div className="nav-container">
          <div className="brand">
            <div className="brand-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="brand-text">
              <div className="brand-title">
                StreakForge <span className="pro-tag">PRO</span>
              </div>
              <div className="brand-subtitle">LeetCode & LinkedIn AI Caption Architect</div>
            </div>
          </div>

          <div className="nav-badges">
            <div className="status-pill">
              <span className="status-dot green"></span>
              <span>Gemini 3.5 Active</span>
            </div>
            <div className="streak-pill">
              <span>🔥 500 Days Streak</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio Layout */}
      <main className="studio-container">
        
        {/* LEFT COLUMN: Developer Code Studio */}
        <section className="studio-card code-studio">
          {/* Window Chrome / Bar */}
          <div className="window-header">
            <div className="window-controls">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
              <span className="window-title">Solution.{language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'py'}</span>
            </div>

            <div className="window-actions">
              <select 
                className="select-preset" 
                onChange={(e) => e.target.value && applyPreset(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>⚡ Load Preset Problem...</option>
                <option value="minOpsSort">Minimum Operations to Sort String (Day 235)</option>
                <option value="twoSum">Two Sum (Day 234)</option>
                <option value="validParentheses">Valid Parentheses (Day 236)</option>
              </select>

              <select 
                className="select-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="cpp">C++ (Default)</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
              </select>
            </div>
          </div>

          {/* Metadata Bar (Streak Day, Title, Link) */}
          <div className="meta-strip">
            <div className="meta-input-group day-group">
              <label>STREAK DAY</label>
              <div className="input-with-prefix">
                <span className="prefix">Day</span>
                <input 
                  type="text" 
                  value={day} 
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="234"
                  maxLength="10"
                />
              </div>
            </div>

            <div className="meta-input-group title-group">
              <label>PROBLEM TITLE <span className="hint">(Optional - auto deduced if empty)</span></label>
              <input 
                type="text" 
                value={problemTitle} 
                onChange={(e) => setProblemTitle(e.target.value)}
                placeholder="e.g. Minimum Operations to Sort a String"
              />
            </div>

            <div className="meta-input-group link-group">
              <label>SUBMISSION LINK <span className="hint">(Optional - leave blank for placeholder)</span></label>
              <input 
                type="text" 
                value={submissionLink} 
                onChange={(e) => setSubmissionLink(e.target.value)}
                placeholder="e.g. https://lnkd.in/... or leave blank"
              />
            </div>
          </div>

          {/* Code Editor Body */}
          <div className="editor-wrapper">
            <textarea
              ref={textareaRef}
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyUp={handleCursorUpdate}
              onClick={handleCursorUpdate}
              placeholder="// Paste your accepted LeetCode solution here..."
              spellCheck="false"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>

          {/* Editor Status Bar */}
          <div className="editor-statusbar">
            <div className="status-left">
              <span>UTF-8</span>
              <span className="divider">•</span>
              <span>Spaces: 4</span>
              <span className="divider">•</span>
              <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
            </div>
            <div className="status-right">
              <span>{code.length} chars</span>
              <span className="divider">•</span>
              <span>{code.split('\n').length} lines</span>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="studio-footer">
            <button 
              type="button" 
              className="btn-text-ghost" 
              onClick={() => { setCode(''); setDay(''); setProblemTitle(''); setSubmissionLink(''); }}
            >
              Clear All
            </button>

            <button 
              type="button" 
              className="btn-shimmer"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loader-ring"></span>
                  <span>Generating Caption...</span>
                </>
              ) : (
                <>
                  <span className="btn-glow-icon">✨</span>
                  <span>Generate Caption</span>
                  <span className="shortcut-tag">⌘↵</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: Output & Post Studio */}
        <section className="studio-card preview-studio">
          {/* Header Tabs */}
          <div className="preview-header">
            <div className="tabs-container">
              <button 
                className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                LinkedIn Feed Preview
              </button>
              <button 
                className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
                onClick={() => setActiveTab('raw')}
              >
                Raw Text
              </button>
              <button 
                className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                Post Stats {caption && <span className="stat-badge">{analytics.words}w</span>}
              </button>
            </div>

            {caption && (
              <button 
                className={`btn-copy ${copied ? 'copied' : ''}`} 
                onClick={handleCopy}
              >
                {copied ? '✓ Copied to Clipboard' : '📋 Copy Caption'}
              </button>
            )}
          </div>

          {/* Dynamic Content Area */}
          <div className="preview-body">
            {/* Error Message */}
            {error && (
              <div className="error-card">
                <span className="error-icon">⚠️</span>
                <div className="error-text">
                  <strong>Validation Notice</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="loading-card">
                <div className="pulsing-brain">
                  <div className="pulse-ring"></div>
                  <span className="brain-icon">⚡</span>
                </div>
                <h3>Crafting Your Professional Caption</h3>
                <p className="loading-step-text">{loadingMessages[loadingStep]}</p>
                <div className="skeleton-container">
                  <div className="skeleton-bar w-70"></div>
                  <div className="skeleton-bar w-50"></div>
                  <div className="skeleton-bar w-90"></div>
                  <div className="skeleton-bar w-80"></div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !caption && !error && (
              <div className="empty-studio">
                <div className="empty-sparkle-box">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <h3>Ready to Draft Your Next Post</h3>
                <p>Paste your solution code on the left or select a preset problem, then click <strong>Generate Caption</strong> to see a ready-to-post LinkedIn update.</p>
                <div className="quick-tip">
                  <span className="tip-badge">TIP</span>
                  <span>Streak day, title, and approach are seamlessly structured to build your personal brand.</span>
                </div>
              </div>
            )}

            {/* Generated Output */}
            {!isLoading && caption && (
              <>
                {/* TAB 1: LinkedIn Realistic Feed Preview */}
                {activeTab === 'preview' && (
                  <div className="linkedin-post-mock">
                    {/* User Header */}
                    <div className="post-author-row">
                      <div className="author-avatar">G</div>
                      <div className="author-meta">
                        <div className="author-name">Gokul</div>
                        <div className="author-bio">B.Tech Artificial Intelligence & Data Science | Problem Solver</div>
                        <div className="post-timestamp">Just now • 🌐</div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="post-text-content">
                      {caption}
                    </div>

                    {/* LinkedIn Action Bar Mock */}
                    <div className="linkedin-actions-mock">
                      <div className="action-item">👍 Like</div>
                      <div className="action-item">💬 Comment</div>
                      <div className="action-item">🔁 Repost</div>
                      <div className="action-item">📤 Send</div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Raw Text View */}
                {activeTab === 'raw' && (
                  <div className="raw-text-container">
                    <pre className="raw-pre">{caption}</pre>
                  </div>
                )}

                {/* TAB 3: Analytics View */}
                {activeTab === 'analytics' && (
                  <div className="analytics-grid">
                    <div className="metric-card">
                      <div className="metric-val">{analytics.words}</div>
                      <div className="metric-label">Words</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-val">{analytics.chars}</div>
                      <div className="metric-label">Characters</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-val">{analytics.hashtags}</div>
                      <div className="metric-label">Hashtags</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-val">~{Math.max(1, Math.ceil(analytics.words / 180))}m</div>
                      <div className="metric-label">Est. Read Time</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Production Grade Footer */}
      <footer className="pro-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-heart">Made with ❤️ by <strong>Gokul</strong></span>
            <span className="footer-tagline">B.Tech Artificial Intelligence and Data Science</span>
          </div>

          <div className="footer-center">
            <div className="tech-pills">
              <span className="tech-pill">React 19</span>
              <span className="tech-pill">Node.js</span>
              <span className="tech-pill">Express</span>
              <span className="tech-pill">Google Gemini AI</span>
            </div>
          </div>

          <div className="footer-right">
            <span className="version-tag">StreakForge v2.0 • Personal AI Tool</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
