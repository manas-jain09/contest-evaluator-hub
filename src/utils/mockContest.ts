
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/toast";

export async function createMockContest() {
  try {
    // Check if the contest already exists
    const { data: existingContest } = await supabase
      .from('contests')
      .select('id')
      .eq('contest_code', 'practice123')
      .single();
    
    if (existingContest) {
      toast.info("Mock practice contest already exists");
      return existingContest.id;
    }

    // Create a new practice contest
    const { data: contestData, error: contestError } = await supabase
      .from('contests')
      .insert({
        name: 'Mock Practice Contest',
        contest_code: 'practice123',
        duration_mins: 60,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        public_access: true,
        type: 'practice'
      })
      .select()
      .single();

    if (contestError) {
      throw contestError;
    }

    const contestId = contestData.id;

    // Create coding question
    const { data: codingQuestion, error: codingError } = await supabase
      .from('contest_questions')
      .insert({
        title: 'Two Sum Problem',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        contest_id: contestId,
        question_type: 'coding'
      })
      .select()
      .single();

    if (codingError) {
      throw codingError;
    }

    // Add examples for the coding question
    await supabase
      .from('examples')
      .insert([
        {
          question_id: codingQuestion.id,
          input: '[2,7,11,15]\n9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1].'
        },
        {
          question_id: codingQuestion.id,
          input: '[3,2,4]\n6',
          output: '[1,2]',
          explanation: 'Because nums[1] + nums[2] = 2 + 4 = 6, we return [1, 2].'
        }
      ]);

    // Add constraints for the coding question
    await supabase
      .from('constraints')
      .insert([
        {
          question_id: codingQuestion.id,
          description: '2 <= nums.length <= 10^4'
        },
        {
          question_id: codingQuestion.id,
          description: '-10^9 <= nums[i] <= 10^9'
        },
        {
          question_id: codingQuestion.id,
          description: '-10^9 <= target <= 10^9'
        }
      ]);

    // Add test cases for the coding question
    await supabase
      .from('test_cases')
      .insert([
        {
          question_id: codingQuestion.id,
          input: '[2,7,11,15]\n9',
          expected: '[0,1]',
          points: 10,
          visible: true
        },
        {
          question_id: codingQuestion.id,
          input: '[3,2,4]\n6',
          expected: '[1,2]',
          points: 10,
          visible: true
        },
        {
          question_id: codingQuestion.id,
          input: '[3,3]\n6',
          expected: '[0,1]',
          points: 10,
          visible: false
        }
      ]);

    // Create MCQ question
    const { data: mcqQuestion, error: mcqError } = await supabase
      .from('contest_questions')
      .insert({
        title: 'Time Complexity Analysis',
        description: 'What is the time complexity of the binary search algorithm?',
        contest_id: contestId,
        question_type: 'mcq',
        points: 20
      })
      .select()
      .single();

    if (mcqError) {
      throw mcqError;
    }

    // Add options for the MCQ question
    await supabase
      .from('mcq_options')
      .insert([
        {
          question_id: mcqQuestion.id,
          option_text: 'O(1)',
          is_correct: false
        },
        {
          question_id: mcqQuestion.id,
          option_text: 'O(n)',
          is_correct: false
        },
        {
          question_id: mcqQuestion.id,
          option_text: 'O(log n)',
          is_correct: true
        },
        {
          question_id: mcqQuestion.id,
          option_text: 'O(n log n)',
          is_correct: false
        }
      ]);

    // Create another MCQ question with image
    const { data: mcqQuestion2, error: mcqError2 } = await supabase
      .from('contest_questions')
      .insert({
        title: 'Data Structure Identification',
        description: 'What data structure is shown in the image?',
        contest_id: contestId,
        question_type: 'mcq',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Binary_tree.svg/1200px-Binary_tree.svg.png',
        points: 15
      })
      .select()
      .single();

    if (mcqError2) {
      throw mcqError2;
    }

    // Add options for the second MCQ question
    await supabase
      .from('mcq_options')
      .insert([
        {
          question_id: mcqQuestion2.id,
          option_text: 'Linked List',
          is_correct: false
        },
        {
          question_id: mcqQuestion2.id,
          option_text: 'Binary Tree',
          is_correct: true
        },
        {
          question_id: mcqQuestion2.id,
          option_text: 'Hash Table',
          is_correct: false
        },
        {
          question_id: mcqQuestion2.id,
          option_text: 'Graph',
          is_correct: false
        }
      ]);

    toast.success("Mock contest created successfully!");
    return contestId;
  } catch (error) {
    console.error("Error creating mock contest:", error);
    toast.error("Failed to create mock contest");
    return null;
  }
}
