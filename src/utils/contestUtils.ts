
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
export async function submitCode(code: string, language_id: number, stdin: string = ""): Promise<string> {
  try {
    const response = await fetch(API_SUBMISSION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_code: code,
        language_id: language_id,
        stdin: stdin,
        expected_output: "",
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
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
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting submission result:", error);
    throw new Error("Failed to get submission result. Please try again.");
  }
}

// Get language templates
export const getLanguageTemplates = () => {
  return {
    50: `#include <stdio.h>

int add(int a, int b) {
    // Your code here
    return 0;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\\n", add(a, b));
    return 0;
}`,
    54: `#include <iostream>
using namespace std;

int add(int a, int b) {
    // Your code here
    return 0;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << add(a, b) << endl;
    return 0;
}`,
  };
};

// Mock questions data
export const questions = [
  {
    id: 1,
    title: "Add Two Numbers",
    description: `Write a function that takes two integers as input and returns their sum.

Your task is to implement the 'add' function that takes two integers 'a' and 'b' as parameters and returns their sum.`,
    examples: [
      {
        input: "a = 5, b = 7",
        output: "12",
        explanation: "5 + 7 = 12"
      },
      {
        input: "a = -3, b = 8",
        output: "5",
        explanation: "-3 + 8 = 5"
      }
    ],
    constraints: [
      "-1000 <= a, b <= 1000"
    ],
    testCases: [
      {
        input: "5 7",
        expected: 12,
        visible: true,
        points: 5
      },
      {
        input: "-3 8",
        expected: 5,
        visible: true,
        points: 5
      },
      {
        input: "100 -50",
        expected: 50,
        visible: false,
        points: 10
      }
    ]
  },
  {
    id: 2,
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
    testCases: [
      {
        input: "[2,7,11,15] 9",
        expected: [0, 1],
        visible: true,
        points: 5
      },
      {
        input: "[3,2,4] 6",
        expected: [1, 2],
        visible: true,
        points: 5
      },
      {
        input: "[3,3] 6",
        expected: [0, 1],
        visible: false,
        points: 10
      }
    ]
  }
];
