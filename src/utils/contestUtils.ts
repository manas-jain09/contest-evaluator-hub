// Judge0 API endpoints
const API_SUBMISSION_URL = "https://judge0.arenahq-mitwpu.in/submissions";

import { supabase } from "@/integrations/supabase/client";

// Contest code validation
export const validateContestCode = async (code: string): Promise<boolean> => {
  const pattern = /^arenacnst-\d{4}$/;
  if (!pattern.test(code)) {
    return false;
  }
  
  // Check if contest code exists in database
  const { data, error } = await supabase
    .from('contests')
    .select('id')
    .eq('contest_code', code)
    .single();
  
  if (error || !data) {
    return false;
  }
  
  return true;
};

// PRN validation
export const validatePRN = (prn: string): boolean => {
  // Add your PRN validation logic here
  return prn.length > 5;
};

// Format code for submission to Judge0
export function formatCodeForSubmission(code: string, language_id: number, stdin: string = "", expected_output: string = ""): any {
  return {
    source_code: code,
    language_id: language_id,
    stdin: stdin,
    expected_output: expected_output,
  };
}

// Submit code to Judge0
export async function submitCode(code: string, language_id: number, stdin: string = "", expected_output: string = ""): Promise<string> {
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
        expected_output: expected_output,
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
export const getLanguageTemplates = async (questionId?: number) => {
  let query = supabase
    .from('language_templates')
    .select('*');
  
  if (questionId) {
    // If questionId is provided, get templates specific to that question
    query = query.eq('question_id', questionId);
  } else {
    // Otherwise get templates that aren't tied to a specific question
    query = query.is('question_id', null);
  }
  
  const { data, error } = await query;
  
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

// Fetch contest by contest code
export const fetchContestByCode = async (code: string) => {
  const { data, error } = await supabase
    .from('contests')
    .select('*')
    .eq('contest_code', code)
    .single();
  
  if (error) {
    console.error("Error fetching contest:", error);
    throw new Error("Failed to fetch contest information");
  }
  
  return data;
};

// Fetch questions for a specific contest
export const fetchQuestionsByContest = async (contestId: string) => {
  const { data: questionsData, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('contest_id', contestId);
  
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

// Fetch all questions (legacy method, now calls fetchQuestionsByContest with the first contest)
export const fetchQuestions = async () => {
  // Get the first contest
  const { data: contestData } = await supabase
    .from('contests')
    .select('id')
    .limit(1)
    .single();
  
  if (!contestData) {
    console.error("No contests found");
    return [];
  }
  
  return fetchQuestionsByContest(contestData.id);
};

// Save contest results to the database
export const saveContestResults = async (
  contestId: string, 
  userInfo: { 
    name: string, 
    email: string, 
    prn: string, 
    year: string, 
    batch: string 
  }, 
  score: number, 
  cheatingDetected: boolean = false,
  submissions: Array<{
    questionId: number,
    languageId: number,
    code: string,
    score: number
  }>
) => {
  try {
    // Save the result
    const { data: resultData, error: resultError } = await supabase
      .from('results')
      .insert({
        contest_id: contestId,
        name: userInfo.name,
        email: userInfo.email,
        prn: userInfo.prn,
        year: userInfo.year,
        batch: userInfo.batch,
        cheating_detected: cheatingDetected,
        score: score
      })
      .select()
      .single();
    
    if (resultError) {
      console.error("Error saving contest results:", resultError);
      throw new Error("Failed to save contest results");
    }
    
    // Save each submission
    if (submissions.length > 0) {
      const submissionRecords = submissions.map(sub => ({
        result_id: resultData.id,
        question_id: sub.questionId,
        language_id: sub.languageId,
        code: sub.code,
        score: sub.score
      }));
      
      const { error: submissionError } = await supabase
        .from('submissions')
        .insert(submissionRecords);
      
      if (submissionError) {
        console.error("Error saving submissions:", submissionError);
      }
    }
    
    return resultData;
  } catch (error) {
    console.error("Error in saveContestResults:", error);
    throw error;
  }
};
