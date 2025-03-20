
// Judge0 API endpoints
const API_SUBMISSION_URL = "http://judge0-arenahq-mitwpu.in/submissions";

// Contest code validation
export const validateContestCode = (code: string): boolean => {
  const pattern = /^arenacnst-\d{4}$/;
  return pattern.test(code);
};

// PRN validation
export const validatePRN = (prn: string): boolean => {
  // Add your PRN validation logic here
  return prn.length > 5;
};

// Format code for submission to Judge0
export function formatCodeForSubmission(code: string, language_id: number): any {
  return {
    source_code: code,
    language_id: language_id,
    stdin: "",
    expected_output: "",
  };
}

// Submit code to Judge0
export async function submitCode(code: string, language_id: number): Promise<string> {
  try {
    const response = await fetch(API_SUBMISSION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formatCodeForSubmission(code, language_id)),
    });
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error submitting code:", error);
    throw new Error("Failed to submit code. Please try again.");
  }
}

// Get submission results from Judge0
export async function getSubmissionResult(token: string): Promise<any> {
  try {
    const response = await fetch(`${API_SUBMISSION_URL}/${token}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting submission result:", error);
    throw new Error("Failed to get submission result. Please try again.");
  }
}

// Mock questions data
export const questions = [
  {
    id: 1,
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
    
You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    templateCode: `function twoSum(nums, target) {
  // Your code here
};`,
    testCases: [
      {
        input: [2, 7, 11, 15],
        target: 9,
        expected: [0, 1],
        visible: true,
        points: 5
      },
      {
        input: [3, 2, 4],
        target: 6,
        expected: [1, 2],
        visible: true,
        points: 5
      },
      {
        input: [3, 3],
        target: 6,
        expected: [0, 1],
        visible: false,
        points: 10
      }
    ]
  },
  {
    id: 2,
    title: "Palindrome Number",
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.
    
A palindrome is a number that reads the same backward as forward.`,
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left."
      },
      {
        input: "x = -121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
      }
    ],
    constraints: [
      "-2^31 <= x <= 2^31 - 1"
    ],
    templateCode: `function isPalindrome(x) {
  // Your code here
};`,
    testCases: [
      {
        input: 121,
        expected: true,
        visible: true,
        points: 5
      },
      {
        input: -121,
        expected: false,
        visible: true,
        points: 5
      },
      {
        input: 10,
        expected: false,
        visible: false,
        points: 10
      }
    ]
  }
];
