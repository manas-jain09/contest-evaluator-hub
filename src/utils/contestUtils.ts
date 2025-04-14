
// Judge0 API endpoints
const API_SUBMISSION_URL = "https://judge0.arenahq-mitwpu.in/submissions";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/toast";
import { createClient } from '@supabase/supabase-js';

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
  try {
    // Use the existing supabase client instead of creating a new one
    
    // Fetch basic question data
    const { data: questionsData, error } = await supabase
      .from('contest_questions')
      .select('*')
      .eq('contest_id', contestId);
    
    if (error) throw error;
    if (!questionsData) return [];
    
    // Process each question to get complete data
    const questions = await Promise.all(questionsData.map(async (q) => {
      // Determine if this is an MCQ question (check for a special pattern in description)
      const isMcq = q.description.includes('[MCQ]');
      
      if (isMcq) {
        // Extract MCQ data from description
        const mcqData = parseMcqDescription(q.description);
        
        return {
          id: q.id,
          title: q.title,
          description: mcqData.description,
          imageUrl: mcqData.imageUrl,
          options: mcqData.options,
          type: 'mcq',
          points: mcqData.points || 10
        };
      } else {
        // Regular coding question
        const [examples, constraints, testCases] = await Promise.all([
          // Fetch examples
          supabase
            .from('examples')
            .select('*')
            .eq('question_id', q.id)
            .then(({ data, error }) => {
              if (error) throw error;
              return data || [];
            }),
            
          // Fetch constraints
          supabase
            .from('constraints')
            .select('*')
            .eq('question_id', q.id)
            .then(({ data, error }) => {
              if (error) throw error;
              return data?.map(c => c.description) || [];
            }),
            
          // Fetch test cases
          supabase
            .from('test_cases')
            .select('*')
            .eq('question_id', q.id)
            .then(({ data, error }) => {
              if (error) throw error;
              return data || [];
            })
        ]);
        
        return {
          id: q.id,
          title: q.title,
          description: q.description,
          examples,
          constraints,
          testCases,
          type: 'coding'
        };
      }
    }));
    
    return questions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    toast.error("Failed to load questions");
    return [];
  }
};

// Helper function to parse MCQ description
function parseMcqDescription(rawDescription: string) {
  // Format: [MCQ]description[/MCQ][IMAGE]url[/IMAGE][OPTIONS]option1|true,option2|false,option3|false,option4|false[/OPTIONS][POINTS]10[/POINTS]
  
  let description = '';
  let imageUrl = '';
  let options = [];
  let points = 10;
  
  // Extract description
  const descriptionMatch = rawDescription.match(/\[MCQ\](.*?)\[\/MCQ\]/s);
  if (descriptionMatch) {
    description = descriptionMatch[1].trim();
  }
  
  // Extract image URL if present
  const imageMatch = rawDescription.match(/\[IMAGE\](.*?)\[\/IMAGE\]/);
  if (imageMatch) {
    imageUrl = imageMatch[1].trim();
  }
  
  // Extract options
  const optionsMatch = rawDescription.match(/\[OPTIONS\](.*?)\[\/OPTIONS\]/);
  if (optionsMatch) {
    options = optionsMatch[1].split(',').map((opt, index) => {
      const [text, isCorrect] = opt.split('|');
      return {
        id: `opt-${index}`,
        text: text.trim(),
        isCorrect: isCorrect.trim() === 'true'
      };
    });
  }
  
  // Extract points
  const pointsMatch = rawDescription.match(/\[POINTS\](.*?)\[\/POINTS\]/);
  if (pointsMatch) {
    points = parseInt(pointsMatch[1].trim());
  }
  
  return {
    description,
    imageUrl,
    options,
    points
  };
}

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
    if (!userInfo || submissionPrn) {
      // If we have a PRN, save the result with minimal info
      if (submissionPrn) {
        const { data: resultData, error: resultError } = await supabase
          .from('results')
          .insert({
            contest_id: contestId,
            prn: submissionPrn,
            name: "Practice User",
            email: "practice@example.com",
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
      }
      
      // Just return without saving for practice mode without PRN
      if (submissions.length > 0) {
        return { contest_id: contestId, score: score };
      }
      return null;
    }
    
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
    // Check if there's an existing record for this user/PRN
    const { data: existingData, error: fetchError } = await supabase
      .from('practice_progress')
      .select('id')
      .eq('contest_id', contestId)
      .eq('prn', prn || null)
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
          language_id: languageId,
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
          contest_id: contestId,
          user_code: code,
          language_id: languageId,
          prn: prn // Store PRN if available
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
    const { data, error } = await supabase
      .from('practice_progress')
      .select('user_code, language_id')
      .eq('contest_id', contestId)
      .eq('prn', prn || null)
      .limit(1)
      .single();
    
    if (error) {
      return { code: null, languageId: null };
    }
    
    return { 
      code: data.user_code, 
      languageId: data.language_id 
    };
  } catch (error) {
    console.error("Error in loadPracticeProgress:", error);
    return { code: null, languageId: null };
  }
};
