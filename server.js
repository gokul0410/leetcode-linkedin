/**
 * LeetCode Caption Generator - Backend Server
 * Phase 3: Express Server, Static Hosting, and Request Validation
 */

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// 1. Middleware Configuration
// ============================================================================

// Enable CORS for local file:// previews or external callers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Parse JSON request bodies with a defensive size limit (max 50kb)
// This prevents oversized payloads from exhausting server memory
app.use(express.json({ limit: '50kb' }));

// Serve frontend static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

const { GoogleGenAI } = require('@google/genai');

// Initialize Google Gen AI client with server-side environment key
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Daily Streak Calculation API
 * Base Anchor: 21-10-2026 is Day 234
 * Automatically increments every midnight using Date API
 */
function calculateStreakDay() {
  const anchorDate = new Date(2026, 9, 21); // October 21, 2026 (Month 9 is October, 0-indexed)
  const anchorStreak = 234;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((today.getTime() - anchorDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, anchorStreak + diffDays);
}

/**
 * Builds the caption generation prompt adhering strictly to user format
 */
function buildPrompt({ code, day, problemTitle, submissionLink }) {
  const cleanDay = (day && day.toString().trim()) || '';
  const dayHeader = cleanDay ? `Day ${cleanDay}` : 'Day [Day Number]';
  const dayNumberOnly = cleanDay.replace(/\D/g, '') || cleanDay;
  const dayTag = dayNumberOnly ? `#day${dayNumberOnly}` : '#streak';

  const titleHeader = (problemTitle && problemTitle.trim()) || '';
  const cleanLink = (submissionLink && submissionLink.trim()) || '[Paste submission link here]';

  return `
You are an expert software engineer and competitive programmer.
Generate a concise, ready-to-post LinkedIn solution caption for a LeetCode problem based ONLY on the submitted code.

### Required Output Template:
${dayHeader} : ${titleHeader ? titleHeader : '{identifiable_problem_title}'}
Submission Link : ${cleanLink}

My approach is to {explanation}

Time Complexity: {time_complexity}
Space Complexity: {space_complexity}

#leetcode ${dayTag} #streak #dailyproblem #DSA House Of Programming Expertise (HOPE)

### Guidelines:
1. First line:
   - Format: "${dayHeader} : <Problem Title>".
   - If problem title was not specified by the user, reliably identify the problem title from the method name, class name, or comments.
2. Second line:
   - Format: "Submission Link : ${cleanLink}".
3. Approach paragraph:
   - Must start with: "My approach is to ".
   - Write in clear, natural first-person prose describing the exact steps the submitted code performs.
   - Do not claim an algorithm or optimization that the code does not actually implement.
   - Avoid generic motivational endings, hyperbolic corporate buzzwords, and unnecessary emojis.
4. Complexity:
   - Accurately determine Time Complexity and Space Complexity (auxiliary memory) strictly from the submitted code.
   - State them clearly as "Time Complexity: O(...)" and "Space Complexity: O(...)".
5. Hashtags line:
   - End with: "#leetcode ${dayTag} #streak #dailyproblem #DSA House Of Programming Expertise (HOPE)"
6. Output format:
   - Return ONLY the clean, raw text of the post.
   - Do NOT wrap your output in markdown code fences (\`\`\` or \`\`\`markdown).

User Solution Details:
- Programming Language: Auto-detect from submitted code (e.g. C++, Java, Python, Go, etc.)
${titleHeader ? `- Problem Title: ${titleHeader}` : ''}
${cleanDay ? `- Streak Day: ${cleanDay}` : ''}
- Submitted Code:
\`\`\`
${code}
\`\`\`
`.trim();
}

// ============================================================================
// 2. API Routes
// ============================================================================

/**
 * Health check endpoint to verify server status
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Auto-synced Streak API endpoint based on current date
 * GET /api/streak
 */
app.get('/api/streak', (req, res) => {
  const streakDay = calculateStreakDay();
  const now = new Date();
  res.status(200).json({
    success: true,
    day: streakDay,
    currentDate: now.toISOString().split('T')[0],
    anchorDate: '2026-10-21',
    anchorStreak: 234,
    description: 'Auto-incrementing daily streak based on Date API (21-10-2026 = Day 234)'
  });
});

/**
 * Caption generation endpoint
 * POST /api/generate
 * 
 * Expected JSON Body:
 * {
 *   "code": "string (required, max 10,000 characters)",
 *   "day": "string | number" (optional, e.g. "234"),
 *   "problemTitle": "string" (optional),
 *   "submissionLink": "string" (optional)
 * }
 */
app.post('/api/generate', async (req, res, next) => {
  try {
    const { 
      code, 
      day = '',
      problemTitle = '',
      submissionLink = ''
    } = req.body || {};

    // 1. Validation: Verify code existence and type
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid "code" field. Please provide your solution code as a string.'
      });
    }

    const trimmedCode = code.trim();

    // 2. Validation: Enforce minimum code length
    if (trimmedCode.length < 15) {
      return res.status(400).json({
        error: 'Code snippet is too short. Please provide a complete solution or function.'
      });
    }

    // 3. Validation: Enforce maximum code length (security limit)
    if (trimmedCode.length > 10000) {
      return res.status(400).json({
        error: 'Code snippet exceeds maximum allowed size of 10,000 characters.'
      });
    }

    // 4. Language is automatically detected by Gemini directly from the code!
    // No hardcoded language restrictions needed.

    // 5. Initialize AI Client & Check Secret
    const ai = getAiClient();
    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on the server. Please verify your .env file.'
      });
    }

    // 6. Build the caption prompt
    const prompt = buildPrompt({
      code: trimmedCode,
      day,
      problemTitle,
      submissionLink
    });

    // 7. Call Gemini with automatic model resilience
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    const fallbackModel = primaryModel === 'gemini-3.5-flash-lite' ? 'gemini-3.8-flash' : 'gemini-3.5-flash-lite';

    let rawCaption = '';
    try {
      const response = await ai.models.generateContent({
        model: primaryModel,
        contents: prompt
      });
      rawCaption = response.text || '';
    } catch (primaryError) {
      console.warn(`[AI Notice] Primary model ${primaryModel} failed (${primaryError.message.slice(0, 80)}). Trying fallback ${fallbackModel}...`);
      const fallbackResponse = await ai.models.generateContent({
        model: fallbackModel,
        contents: prompt
      });
      rawCaption = fallbackResponse.text || '';
    }

    // Clean up any stray markdown fences if returned
    let cleanCaption = rawCaption.trim();
    if (cleanCaption.startsWith('```')) {
      cleanCaption = cleanCaption.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
    }

    return res.status(200).json({
      success: true,
      caption: cleanCaption
    });

  } catch (error) {
    // Provide safe, descriptive errors without leaking API keys or secrets
    if (error.status === 401 || error.status === 403 || error.message?.includes('API_KEY_INVALID')) {
      return res.status(401).json({
        error: 'Invalid or unauthorized Gemini API key. Please verify the key in your .env file.'
      });
    }

    if (error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        error: 'Gemini API rate limit exceeded. Please wait a moment before trying again.'
      });
    }

    if (error.status === 503 || error.message?.includes('UNAVAILABLE')) {
      return res.status(503).json({
        error: 'Gemini AI service is temporarily experiencing high demand. Please try again shortly.'
      });
    }

    // Pass unexpected errors to the global error handler

    next(error);
  }
});

// ============================================================================
// 3. Error Handling Middleware
// ============================================================================

// 404 Handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.url} not found.` });
});

// Global Error Handler
// Catches payload parsing errors (e.g. malformed JSON) and unexpected server exceptions
// Crucial security requirement: Never leak internal stack traces or secrets to the client
app.use((err, req, res, next) => {
  // Handle payload too large error from express.json({ limit })
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large. Maximum size is 50KB.' });
  }

  // Handle malformed JSON syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload received.' });
  }

  console.error('[Server Error]:', err.message);

  return res.status(500).json({
    error: 'An internal server error occurred while processing your request.'
  });
});

// ============================================================================
// 4. Server Initialization
// ============================================================================
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Server] LeetCode Caption Generator running at http://localhost:${PORT}`);
  });
}

module.exports = app;
