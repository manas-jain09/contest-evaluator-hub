
// Judge0 API endpoints
const API_SUBMISSION_URL = "https://judge0-arenahq-mitwpu.in/submissions";

import { supabase } from "@/integrations/supabase/client";

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
        expected_output: "12",
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

// Get language templates from database
export const getLanguageTemplates = async () => {
  const { data, error } = await supabase
    .from('language_templates')
    .select('*');
  
  if (error) {
    console.error("Error fetching language templates:", error);
    return {};
  }
  
  // Convert array to object with language_id as key
  const templates: Record<number, string> = {};
  if (data) {
    data.forEach(template => {
      templates[template.id] = template.template;
    });
  }
  
  return templates;
};

// Fetch questions from database with all related data
export const fetchQuestions = async () => {
  const { data: questionsData, error: questionsError } = await supabase
    .from('questions')
    .select('*');
  
  if (questionsError || !questionsData) {
    console.error("Error fetching questions:", questionsError);
    return [];
  }
  
  // Get all related data for each question
  const questions = await Promise.all(questionsData.map(async (question) => {
    // Fetch examples
    const { data: examples, error: examplesError } = await supabase
      .from('examples')
      .select('*')
      .eq('question_id', question.id);
    
    if (examplesError) {
      console.error(`Error fetching examples for question ${question.id}:`, examplesError);
      return null;
    }
    
    // Fetch constraints
    const { data: constraints, error: constraintsError } = await supabase
      .from('constraints')
      .select('*')
      .eq('question_id', question.id);
    
    if (constraintsError) {
      console.error(`Error fetching constraints for question ${question.id}:`, constraintsError);
      return null;
    }
    
    // Fetch test cases
    const { data: testCases, error: testCasesError } = await supabase
      .from('test_cases')
      .select('*')
      .eq('question_id', question.id);
    
    if (testCasesError) {
      console.error(`Error fetching test cases for question ${question.id}:`, testCasesError);
      return null;
    }
    
    // Map constraint objects to constraint strings
    const constraintStrings = constraints ? constraints.map(constraint => constraint.description) : [];
    
    return {
      id: question.id,
      title: question.title,
      description: question.description,
      examples: examples || [],
      constraints: constraintStrings,
      testCases: testCases || []
    };
  }));
  
  // Filter out any null values (questions that had errors fetching related data)
  return questions.filter(question => question !== null);
};
