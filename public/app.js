/**
 * LeetCode AI Caption Generator - Frontend Logic
 * Phase 2: UI State Management and Mock Output Simulation
 */

// 1. Cache DOM Elements
const codeInput = document.getElementById('code-input');
const languageSelect = document.getElementById('language-select');
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

// 2. Helper: Set UI State (clean state transitions)
function setUiState(state) {
  // Reset all dynamic blocks
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

// 4. Mock Caption Generator (Phase 2 Simulation)
// In Phase 5, this will be replaced with our live Express fetch('/api/generate') call.
function generateMockCaption(code, language) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create a realistic sample caption formatted for LinkedIn / LeetCode
      const mockCaption = 
`🚀 Solved LeetCode 1: Two Sum in ${language.toUpperCase()}!

💡 Intuition:
Instead of checking all pairs with a brute-force O(n²) search, we can use a hash map to remember numbers we have already seen. As we iterate through the array, we check if the complement (target - current number) already exists in our map.

⚙️ Approach:
1. Initialize an unordered_map to store values and their indices.
2. For each element at index i, calculate 'complement = target - nums[i]'.
3. If the complement is in the map, return the saved index and i.
4. Otherwise, insert the current number and index into the map.

⏱️ Complexity:
- Time Complexity: O(n) — single pass through the array with average O(1) hash map lookups.
- Space Complexity: O(n) — stores up to n elements in the hash map.

#LeetCode #Cpp #CodingInterview #DataStructures #Algorithms #SoftwareEngineering`;

      resolve(mockCaption);
    }, 1200); // Simulate 1.2 second latency
  });
}

// 5. Event: Generate Caption Click
generateBtn.addEventListener('click', async () => {
  const code = codeInput.value.trim();
  const language = languageSelect.value;

  // Validation: Check for empty input
  if (!code) {
    showError('Please paste your solution code before clicking "Generate Caption".');
    return;
  }

  // Minimum length check (avoid single-character or trivial input)
  if (code.length < 15) {
    showError('The provided code snippet is too short. Please paste a complete function or solution.');
    return;
  }

  // Switch to Loading state
  setUiState('loading');

  try {
    // Phase 2: Use mock generation
    const caption = await generateMockCaption(code, language);

    // Render result
    captionOutput.textContent = caption;
    setUiState('result');
  } catch (err) {
    showError('Failed to generate caption. Please try again.');
  }
});

// 6. Event: Copy Caption to Clipboard
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
  }
});

// 7. Event: Clear Button
clearBtn.addEventListener('click', () => {
  codeInput.value = '';
  setUiState('empty');
  codeInput.focus();
});

// 8. Event: Insert Sample Button
sampleBtn.addEventListener('click', () => {
  codeInput.value = SAMPLE_CPP_CODE;
  setUiState('empty');
});
