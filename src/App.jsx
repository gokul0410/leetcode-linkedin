import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

// Pre-configured code templates for instant testing with vibrant colors
const PRESETS = {
  minOpsSort: {
    id: 'minOpsSort',
    title: 'Minimum Operations to Sort a String',
    day: '235',
    language: 'cpp',
    themeColor: 'orange',
    tag: '⚡ Greedy / Sort',
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
  twoSum: {
    id: 'twoSum',
    title: 'Two Sum',
    day: '234',
    language: 'cpp',
    themeColor: 'green',
    tag: '⚡ Hash Map',
    code: `class Solution {
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
  validParentheses: {
    id: 'validParentheses',
    title: 'Valid Parentheses',
    day: '236',
    language: 'cpp',
    themeColor: 'blue',
    tag: '⚡ Stack',
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
  const [day, setDay] = useState('235');
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
  const lineNumbersRef = useRef(null);

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
      }, 1300);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Synchronize line numbers scroll with textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Update cursor position line & col
  const handleCursorUpdate = (e) => {
    handleScroll();
    const text = e.target.value;
    const selStart = e.target.selectionStart;
    const lines = text.substring(0, selStart).split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to generate
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  };

  // Toast notification auto-dismiss
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  // Preset Selection
  const applyPreset = (preset) => {
    setCode(preset.code);
    setLanguage(preset.language);
    setDay(preset.day);
    setProblemTitle(preset.title);
    setError('');
    showToast(`Loaded ${preset.title}`);
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

      // Vibrant Multi-Color Celebration Confetti (Yellow, Green, Red, Orange, Blue, Pink)
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.72 },
        colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#ec4899']
      });

    } catch (err) {
      if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
        setError('Backend server is offline! Please ensure "npm start" is running in your terminal and visit http://localhost:3000');
      } else {
        setError(err.message || 'Failed to connect to backend server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Copy with Vibrant Confetti
  const handleCopy = async () => {
    if (!caption) return;
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      showToast('✓ Caption copied to clipboard!');

      // Rich Multi-Color Rainbow Confetti (Yellow, Green, Red, Orange, Blue, Pink)
      confetti({
        particleCount: 110,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#ec4899', '#a855f7']
      });

      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      setError('Unable to access clipboard. Please copy manually.');
    }
  };

  // Analytics Metrics Calculation
  const getAnalytics = () => {
    if (!caption) return { chars: 0, words: 0, hashtags: 0, lines: 0, score: 0 };
    const words = caption.trim().split(/\s+/).filter(Boolean).length;
    const chars = caption.length;
    const hashtags = (caption.match(/#[a-zA-Z0-9_]+/g) || []).length;
    const lines = caption.split('\n').length;
    
    // Algorithmic optimization score
    let score = 70;
    if (words >= 80 && words <= 250) score += 15;
    if (hashtags >= 3 && hashtags <= 8) score += 10;
    if (caption.includes('Complexity')) score += 5;

    return { chars, words, hashtags, lines, score: Math.min(100, score) };
  };

  // Extract quick complexity lines from caption if available
  const extractComplexities = () => {
    if (!caption) return { time: '', space: '' };
    const timeMatch = caption.match(/Time Complexity:\s*([^\n\r]+)/i);
    const spaceMatch = caption.match(/Space Complexity:\s*([^\n\r]+)/i);
    return {
      time: timeMatch ? timeMatch[1].trim() : '',
      space: spaceMatch ? spaceMatch[1].trim() : ''
    };
  };

  const analytics = getAnalytics();
  const complexities = extractComplexities();
  const lineCount = Math.max(1, code.split('\n').length);

  return (
    <div className="pro-app">
      {/* Vibrant Multi-Color Ambient Mesh Orbs */}
      <div className="ambient-mesh glow-pink" />
      <div className="ambient-mesh glow-blue" />
      <div className="ambient-mesh glow-orange" />
      <div className="ambient-mesh glow-green" />
      <div className="ambient-mesh glow-yellow" />

      {/* Floating Vibrant Toast Notification */}
      {toast && (
        <div className="toast-notification rainbow-border">
          <span className="toast-sparkle">✨</span>
          <span className="toast-text">{toast}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="navbar">
        <div className="nav-container">
          <div className="brand">
            <div className="brand-icon-wrapper rainbow-glow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#ec4899" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#eab308" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="brand-text">
              <div className="brand-title">
                StreakForge <span className="rainbow-badge">PRO</span>
              </div>
              <div className="brand-subtitle">LeetCode & LinkedIn Caption Studio</div>
            </div>
          </div>

          <div className="nav-center-presets">
            <span className="presets-label">⚡ QUICK PRESETS:</span>
            {Object.values(PRESETS).map((p) => (
              <button 
                key={p.id}
                type="button" 
                className={`preset-chip chip-${p.themeColor} ${problemTitle === p.title ? 'active' : ''}`}
                onClick={() => applyPreset(p)}
              >
                <span className="chip-bullet"></span>
                <span>{p.title}</span>
              </button>
            ))}
          </div>

          <div className="nav-right">
            <span className="developer-tag rainbow-tag">Developer Studio</span>
          </div>
        </div>
      </header>

      {/* Main Studio Grid */}
      <main className="studio-container">
        
        {/* LEFT COLUMN: Developer Code Studio */}
        <section className="studio-card code-studio card-glow-blue">
          {/* macOS Style Window Titlebar */}
          <div className="window-header">
            <div className="window-left">
              <div className="window-dots">
                <span className="dot red" title="Close" />
                <span className="dot yellow" title="Minimize" />
                <span className="dot green" title="Maximize" />
              </div>
              <div className="tab-pill">
                <span className={`lang-indicator-dot ${language}`} />
                <span className="tab-filename">Solution.{language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'py'}</span>
              </div>
            </div>

            <div className="window-right">
              <div className="lang-picker-wrapper">
                <select 
                  className={`lang-select lang-tag-${language}`}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="cpp">🔹 C++ (Default)</option>
                  <option value="java">🔸 Java</option>
                  <option value="python">🐍 Python</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vibrant Multi-Color Streak Metadata Control Bar */}
          <div className="meta-strip">
            {/* 1. Day Box in Vibrant Orange Flame */}
            <div className="meta-group day-box theme-orange">
              <label>STREAK DAY</label>
              <div className="input-with-icon day-field">
                <span className="input-badge flame-orange">🔥 Day</span>
                <input 
                  type="text" 
                  value={day} 
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="235"
                  maxLength="10"
                />
              </div>
            </div>

            {/* 2. Problem Title Box in Vibrant Blue */}
            <div className="meta-group title-box theme-blue">
              <label>PROBLEM TITLE <span className="hint">(Optional - auto deduced if empty)</span></label>
              <div className="input-with-icon">
                <span className="input-badge badge-blue">🏷️</span>
                <input 
                  type="text" 
                  value={problemTitle} 
                  onChange={(e) => setProblemTitle(e.target.value)}
                  placeholder="e.g. Minimum Operations to Sort a String"
                />
              </div>
            </div>

            {/* 3. Link Box in Vibrant Green */}
            <div className="meta-group link-box theme-green">
              <label>SUBMISSION LINK <span className="hint">(Optional - leave blank for placeholder)</span></label>
              <div className="input-with-icon">
                <span className="input-badge badge-green">🔗</span>
                <input 
                  type="text" 
                  value={submissionLink} 
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="e.g. https://lnkd.in/... or leave blank"
                />
              </div>
            </div>
          </div>

          {/* Real Code Editor with Visible Line Numbers Gutter */}
          <div className="editor-workspace">
            {/* Synchronized Line Numbers Gutter with Golden Highlights */}
            <div ref={lineNumbersRef} className="line-numbers-gutter" aria-hidden="true">
              {Array.from({ length: lineCount }, (_, i) => (
                <div 
                  key={i + 1} 
                  className={`gutter-line ${cursorPos.line === i + 1 ? 'active-line' : ''}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              ref={textareaRef}
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyUp={handleCursorUpdate}
              onClick={handleCursorUpdate}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              placeholder="// Paste your accepted solution here..."
              spellCheck="false"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>

          {/* IDE Bottom Status Bar with Colorful Badges */}
          <div className="editor-statusbar">
            <div className="status-left">
              <span className="status-badge blue">{language.toUpperCase()}</span>
              <span className="status-badge cyan">UTF-8</span>
              <span className="status-badge pink">Ln {cursorPos.line}, Col {cursorPos.col}</span>
            </div>
            <div className="status-right">
              <span className="status-badge yellow">{code.length} chars</span>
              <span className="status-badge green">{lineCount} lines</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="studio-footer">
            <button 
              type="button" 
              className="btn-ruby-clear" 
              onClick={() => { setCode(''); setDay(''); setProblemTitle(''); setSubmissionLink(''); }}
            >
              Clear All
            </button>

            {/* High-impact Vibrant Rainbow Primary Button */}
            <button 
              type="button" 
              className="btn-rainbow-generate"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-rainbow"></span>
                  <span>Generating Caption...</span>
                </>
              ) : (
                <>
                  <span className="btn-lightning">⚡</span>
                  <span className="btn-label">Generate Caption</span>
                  <span className="key-shortcut">Ctrl+↵</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: Output & Post Studio */}
        <section className="studio-card preview-studio card-glow-pink">
          {/* Header Tabs with Vibrant Colors */}
          <div className="preview-header">
            <div className="tabs-container">
              <button 
                className={`tab-btn tab-blue ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                <span>💼 LinkedIn Preview</span>
              </button>
              <button 
                className={`tab-btn tab-pink ${activeTab === 'raw' ? 'active' : ''}`}
                onClick={() => setActiveTab('raw')}
              >
                <span>📄 Raw Text</span>
              </button>
              <button 
                className={`tab-btn tab-green ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <span>📊 Optimization Stats</span>
                {caption && <span className="badge-score-yellow">{analytics.score}%</span>}
              </button>
            </div>

            {caption && (
              <button 
                className={`btn-copy-vibrant ${copied ? 'copied' : ''}`} 
                onClick={handleCopy}
              >
                {copied ? '✓ Copied to Clipboard!' : '📋 Copy Caption'}
              </button>
            )}
          </div>

          {/* Output Body */}
          <div className="preview-body">
            {/* Error Card */}
            {error && (
              <div className="error-card-vibrant">
                <span className="error-icon">⚠️</span>
                <div className="error-text">
                  <strong>Notice</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Dynamic Rainbow Orbit Loading Animation */}
            {isLoading && (
              <div className="loading-canvas">
                <div className="rainbow-orbit-spinner">
                  <div className="orbit-ring-rainbow"></div>
                  <span className="orbit-sparkle">✨</span>
                </div>
                <h3>Architecting Your Post...</h3>
                <p className="loading-step-live">{loadingMessages[loadingStep]}</p>
                
                <div className="skeleton-grid">
                  <div className="skeleton-bar bar-pink w-80"></div>
                  <div className="skeleton-bar bar-blue w-60"></div>
                  <div className="skeleton-bar bar-green w-95"></div>
                  <div className="skeleton-bar bar-yellow w-75"></div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !caption && !error && (
              <div className="empty-canvas">
                <div className="empty-hologram-rainbow">
                  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="3" width="20" height="14" rx="2" stroke="url(#rainbowGrad)"/>
                    <line x1="8" y1="21" x2="16" y2="21" stroke="#ec4899"/>
                    <line x1="12" y1="17" x2="12" y2="21" stroke="#3b82f6"/>
                    <defs>
                      <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ef4444"/>
                        <stop offset="25%" stop-color="#f97316"/>
                        <stop offset="50%" stop-color="#eab308"/>
                        <stop offset="75%" stop-color="#22c55e"/>
                        <stop offset="100%" stop-color="#3b82f6"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3>Your Next LinkedIn Post Awaits</h3>
                <p>Paste your solution on the left or select a quick preset, then hit <strong>Generate Caption</strong> to produce an authentic, complexity-backed LinkedIn post.</p>
                
                <div className="feature-pills-row">
                  <span className="feature-pill blue">🎯 First-person intuition</span>
                  <span className="feature-pill green">⏱️ O(n) Complexity</span>
                  <span className="feature-pill orange">🔥 Streak Hashtags</span>
                  <span className="feature-pill pink">📋 1-Click Copy</span>
                </div>
              </div>
            )}

            {/* Rendered Output Tabs */}
            {!isLoading && caption && (
              <>
                {/* TAB 1: Colorful Realistic LinkedIn Post Mockup */}
                {activeTab === 'preview' && (
                  <div className="linkedin-post-card">
                    {/* Vibrant Rainbow Banner at top of card */}
                    <div className="post-rainbow-banner" />

                    {/* Author Row */}
                    <div className="post-header-row">
                      <div className="author-avatar-rainbow">
                        <div className="author-avatar-inner">G</div>
                      </div>
                      <div className="author-info">
                        <div className="author-name-row">
                          <span className="author-name">Gokul</span>
                          <span className="verified-shield-gold" title="Verified Solution Architect">✦</span>
                        </div>
                        <div className="author-headline">B.Tech Artificial Intelligence & Data Science | Problem Solver</div>
                        <div className="post-meta-sub">Just now • 🌐 Edited</div>
                      </div>
                    </div>

                    {/* Quick Complexity Callout Strip if found */}
                    {(complexities.time || complexities.space) && (
                      <div className="complexity-callout-strip">
                        {complexities.time && (
                          <div className="callout-pill green-pill">
                            <span className="pill-dot green-dot"></span>
                            <span>Time: <strong>{complexities.time}</strong></span>
                          </div>
                        )}
                        {complexities.space && (
                          <div className="callout-pill cyan-pill">
                            <span className="pill-dot cyan-dot"></span>
                            <span>Space: <strong>{complexities.space}</strong></span>
                          </div>
                        )}
                        <div className="callout-pill orange-pill">
                          <span className="pill-dot orange-dot"></span>
                          <span>Streak: <strong>Day {day || '235'}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Formatted Post Content */}
                    <div className="post-body-text">
                      {caption}
                    </div>

                    {/* Social Engagement Action Bar with Colorful Badges */}
                    <div className="post-social-bar">
                      <div className="social-action action-blue">
                        <span>👍 Like</span>
                        <span className="count-badge blue-bg">64</span>
                      </div>
                      <div className="social-action action-green">
                        <span>💬 Comment</span>
                        <span className="count-badge green-bg">18</span>
                      </div>
                      <div className="social-action action-orange">
                        <span>🔁 Repost</span>
                        <span className="count-badge orange-bg">9</span>
                      </div>
                      <div className="social-action action-pink">
                        <span>📤 Share</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Raw Monospace Text View */}
                {activeTab === 'raw' && (
                  <div className="raw-container">
                    <pre className="raw-text-view">{caption}</pre>
                  </div>
                )}

                {/* TAB 3: Visual Colorful Analytics Dashboard */}
                {activeTab === 'analytics' && (
                  <div className="analytics-dashboard">
                    <div className="score-banner-vibrant">
                      <div className="score-circle-rainbow">
                        <span className="score-number-gold">{analytics.score}%</span>
                        <span className="score-sub-green">OPTIMIZED</span>
                      </div>
                      <div className="score-desc">
                        <h4>High LinkedIn Virality Potential</h4>
                        <p>Includes authentic first-person algorithmic intuition, verified asymptotic complexity, and targeted streak tags.</p>
                      </div>
                    </div>

                    {/* 4 Multi-Color Stat Cards (Blue, Pink, Yellow, Green) */}
                    <div className="metrics-grid">
                      <div className="stat-card-vibrant card-blue">
                        <div className="stat-icon-pill blue">📝</div>
                        <div className="stat-val text-blue">{analytics.words}</div>
                        <div className="stat-label">Word Count</div>
                      </div>
                      <div className="stat-card-vibrant card-pink">
                        <div className="stat-icon-pill pink">🔤</div>
                        <div className="stat-val text-pink">{analytics.chars}</div>
                        <div className="stat-label">Characters</div>
                      </div>
                      <div className="stat-card-vibrant card-yellow">
                        <div className="stat-icon-pill yellow">🏷️</div>
                        <div className="stat-val text-yellow">{analytics.hashtags}</div>
                        <div className="stat-label">Hashtags</div>
                      </div>
                      <div className="stat-card-vibrant card-green">
                        <div className="stat-icon-pill green">⚡</div>
                        <div className="stat-val text-green">~{Math.max(1, Math.ceil(analytics.words / 180))}m</div>
                        <div className="stat-label">Est. Read Time</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Professional Developer Footer with Colorful Accents */}
      <footer className="pro-footer">
        <div className="footer-container">
          <div className="footer-left">
            <div className="footer-credit">
              Designed & Developed by <strong className="gokul-gradient-name">Gokul</strong>
            </div>
            <div className="footer-role">
              B.Tech in Artificial Intelligence & Data Science
            </div>
          </div>

          <div className="footer-right">
            <div className="stack-badges">
              <span className="stack-badge badge-react">React 19</span>
              <span className="stack-badge badge-node">Node.js</span>
              <span className="stack-badge badge-express">Express</span>
              <span className="stack-badge badge-gemini">Gemini API</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
