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

// Get language templates from database - updated to fetch templates per question
export const getLanguageTemplates = async (questionId?: number) => {
  let query = supabase
    .from('language_templates')
    .select('*');
  
  if (questionId) {
    // If questionId is provided, get templates specific to that question
    query = query.eq('question_id', questionId.toString());
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
      templates[parseInt(template.id)] = template.template || '';
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

// Fetch questions for a specific contest - Updated to use contest_questions
export const fetchQuestionsByContest = async (contestId: string) => {
  const { data: questionsData, error: questionsError } = await supabase
    .from('contest_questions')
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
    
    // For constraints, we'll handle differently since the table might not exist
    let constraintStrings: string[] = [];
    try {
      // This is a better approach than trying to query a non-existent table
      const constraintsData = []; // Default empty array if no constraints table
      constraintStrings = constraintsData.map((constraint: any) => constraint.description || '');
    } catch (error) {
      console.error(`Error handling constraints for question ${question.id}:`, error);
      constraintStrings = [];
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
    
    return {
      id: question.id,
      title: question.title || '',
      description: question.description || '',
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
  } | null,
  score: number, 
  cheatingDetected: boolean = false,
  submissions: Array<{
    questionId: number,
    languageId: number,
    code: string,
    score: number
  }>,
  prn?: string // Added PRN parameter
) => {
  try {
    // Use provided PRN if available (from URL), otherwise use userInfo PRN
    const submissionPrn = prn || (userInfo ? userInfo.prn : null);
    
    // For practice contest or if we have a PRN without user info
    if (!userInfo && submissionPrn) {
      // If we have a PRN, save the result with minimal info
      const { data: resultData, error: resultError } = await supabase
        .from('results')
        .insert({
          id: crypto.randomUUID(),
          contest_id: contestId,
          prn: submissionPrn,
          name: "Practice User",
          email: `practice_${submissionPrn}@example.com`,
          score: score,
          cheating_detected: cheatingDetected
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
          id: crypto.randomUUID(),
          result_id: resultData.id,
          question_id: sub.questionId.toString(),
          language_id: sub.languageId.toString(),
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
    } else if (!userInfo) {
      // Just return without saving for practice mode without PRN
      if (submissions.length > 0) {
        return { contest_id: contestId, score: score };
      }
      return null;
    }
    
    // Save the result with full user info
    const { data: resultData, error: resultError } = await supabase
      .from('results')
      .insert({
        id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
        result_id: resultData.id,
        question_id: sub.questionId.toString(),
        language_id: sub.languageId.toString(),
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

// Check if a contest is a practice contest
export const isPracticeContest = async (contestId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('contests')
      .select('type')
      .eq('id', contestId)
      .single();
    
    if (error || !data) {
      console.error("Error checking contest type:", error);
      return false;
    }
    
    return data.type === 'practice';
  } catch (error) {
    console.error("Error in isPracticeContest:", error);
    return false;
  }
};

// Save practice progress
export const savePracticeProgress = async (
  contestId: string,
  code: string,
  languageId: number,
  prn?: string
): Promise<void> => {
  try {
    if (!prn) {
      console.error("Missing PRN for saving practice progress");
      return;
    }

    // Check if there's an existing record for this PRN
    const { data: existingData, error: fetchError } = await supabase
      .from('practice_progress')
      .select('id')
      .eq('contest_id', contestId)
      .eq('prn', prn)
      .limit(1);
    
    if (fetchError) {
      console.error("Error fetching practice progress:", fetchError);
      return;
    }
    
    if (existingData && existingData.length > 0) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('practice_progress')
        .update({
          user_code: code,
          language_id: languageId.toString(),
          last_updated: new Date().toISOString()
        })
        .eq('id', existingData[0].id);
      
      if (updateError) {
        console.error("Error updating practice progress:", updateError);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('practice_progress')
        .insert({
          id: crypto.randomUUID(),
          contest_id: contestId,
          user_code: code,
          language_id: languageId.toString(),
          prn: prn
        });
      
      if (insertError) {
        console.error("Error inserting practice progress:", insertError);
      }
    }
  } catch (error) {
    console.error("Error in savePracticeProgress:", error);
  }
};

// Load practice progress
export const loadPracticeProgress = async (contestId: string, prn?: string): Promise<{ code: string | null, languageId: number | null }> => {
  try {
    if (!prn) {
      return { code: null, languageId: null };
    }

    const { data, error } = await supabase
      .from('practice_progress')
      .select('user_code, language_id')
      .eq('contest_id', contestId)
      .eq('prn', prn)
      .maybeSingle();
    
    if (error || !data) {
      return { code: null, languageId: null };
    }
    
    return { 
      code: data.user_code, 
      languageId: data.language_id ? parseInt(data.language_id) : null 
    };
  } catch (error) {
    console.error("Error in loadPracticeProgress:", error);
    return { code: null, languageId: null };
  }
};
