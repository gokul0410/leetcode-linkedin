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

// Parse JSON request bodies with a defensive size limit (max 50kb)
// This prevents oversized payloads from exhausting server memory
app.use(express.json({ limit: '50kb' }));

// Serve frontend static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Supported programming languages
const SUPPORTED_LANGUAGES = ['cpp', 'java', 'python'];

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
 * Caption generation endpoint
 * POST /api/generate
 * 
 * Expected JSON Body:
 * {
 *   "code": "string (required, max 10,000 characters)",
 *   "language": "cpp" | "java" | "python" (optional, defaults to "cpp")
 * }
 */
app.post('/api/generate', async (req, res, next) => {
  try {
    const { code, language = 'cpp' } = req.body || {};

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

    // 4. Validation: Verify programming language
    const normalizedLanguage = language.toLowerCase();
    if (!SUPPORTED_LANGUAGES.includes(normalizedLanguage)) {
      return res.status(400).json({
        error: `Unsupported language "${language}". Supported options: ${SUPPORTED_LANGUAGES.join(', ')}.`
      });
    }

    // Phase 3 Backend Verification Mock
    // In Phase 5, this will call the official Google Gen AI SDK
    const mockCaption = 
`🚀 Solved LeetCode Problem in ${normalizedLanguage.toUpperCase()}!

💡 Intuition:
Optimal approach utilizing efficient data structures to minimize redundant computations.

⚙️ Approach:
1. Parse and process input constraints.
2. Maintain state using optimal auxiliary data structures.
3. Return the calculated result within expected constraints.

⏱️ Complexity:
- Time Complexity: O(n) (Identified from submitted code structure)
- Space Complexity: O(n) (Auxiliary storage for state tracking)

#LeetCode #${normalizedLanguage === 'cpp' ? 'Cpp' : normalizedLanguage.toUpperCase()} #Algorithms #DataStructures #CodingInterview`;

    return res.status(200).json({
      success: true,
      language: normalizedLanguage,
      caption: mockCaption
    });

  } catch (error) {
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
