/**
 * LeetCode AI Caption Generator - Frontend Logic
 * Phase 5: Live Gemini API Integration with LinkedIn Streak Formatting
 */

// 1. Cache DOM Elements
const codeInput = document.getElementById('code-input');
const languageSelect = document.getElementById('language-select');
const dayInput = document.getElementById('day-input');
const titleInput = document.getElementById('title-input');
const linkInput = document.getElementById('link-input');

const generateBtn = document.getElementById('generate-btn');
const clearBtn = document.getElementById('clear-btn');
const sampleBtn = document.getElementById('sample-btn');

const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const resultState = document.getElementById('result-state');
const captionOutput = document.getElementById('caption-output');
const copyBtn = document.getElementById('copy-btn');
const copyBtnText = document.getElementById('copy-btn-text');

// Sample C++ Solution (Two Sum) for quick testing
const SAMPLE_CPP_CODE = `// Problem: Two Sum (LeetCode #1)
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
};`;

// 2. Helper: Set UI State
function setUiState(state) {
  emptyState.style.display = 'none';
  loadingState.style.display = 'none';
  errorState.style.display = 'none';
  resultState.style.display = 'none';

  switch (state) {
    case 'empty':
      emptyState.style.display = 'flex';
      copyBtn.style.display = 'none';
      generateBtn.disabled = false;
      break;

    case 'loading':
      loadingState.style.display = 'flex';
      copyBtn.style.display = 'none';
      generateBtn.disabled = true;
      break;

    case 'error':
      errorState.style.display = 'flex';
      generateBtn.disabled = false;
      break;

    case 'result':
      resultState.style.display = 'block';
      copyBtn.style.display = 'inline-flex';
      generateBtn.disabled = false;
      break;
  }
}

// 3. Helper: Display Error Message
function showError(message) {
  errorMessage.textContent = message;
  setUiState('error');
}

// 4. Event: Generate Caption Click (Live API Call)
generateBtn.addEventListener('click', async () => {
  const code = codeInput.value.trim();
  const language = languageSelect.value;
  const day = dayInput.value.trim();
  const problemTitle = titleInput.value.trim();
  const submissionLink = linkInput.value.trim();

  // Client-Side Validation
  if (!code) {
    showError('Please paste your solution code before clicking "Generate Caption".');
    return;
  }

  if (code.length < 15) {
    showError('The provided code snippet is too short. Please paste a complete function or solution.');
    return;
  }

  // Switch to Loading state
  setUiState('loading');

  try {
    // Live call to Express backend POST /api/generate
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        language,
        day,
        problemTitle,
        submissionLink
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server responded with status ${response.status}`);
    }

    // Render generated caption
    captionOutput.textContent = data.caption;
    setUiState('result');

  } catch (err) {
    console.error('[Generate Error]:', err);
    showError(err.message || 'Failed to generate caption. Please check the backend connection and try again.');
  }
});

// 5. Event: Copy Caption to Clipboard
copyBtn.addEventListener('click', async () => {
  const textToCopy = captionOutput.textContent;
  if (!textToCopy) return;

  try {
    await navigator.clipboard.writeText(textToCopy);
    copyBtnText.textContent = 'Copied! ✓';
    copyBtn.classList.add('btn-primary');
    copyBtn.classList.remove('btn-secondary');

    setTimeout(() => {
      copyBtnText.textContent = 'Copy Caption';
      copyBtn.classList.remove('btn-primary');
      copyBtn.classList.add('btn-secondary');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    // Fallback: select text manually
    const range = document.createRange();
    range.selectNodeContents(captionOutput);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
});

// 6. Event: Clear Button
clearBtn.addEventListener('click', () => {
  codeInput.value = '';
  dayInput.value = '';
  titleInput.value = '';
  linkInput.value = '';
  setUiState('empty');
  codeInput.focus();
});

// 7. Event: Insert Sample Button
sampleBtn.addEventListener('click', () => {
  dayInput.value = '234';
  titleInput.value = 'Two Sum';
  linkInput.value = '';
  codeInput.value = SAMPLE_CPP_CODE;
  setUiState('empty');
});
