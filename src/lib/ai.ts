export type ContractMilestone = {
  id: string;
  label: string;
  durationMinutes: number;
  description: string;
  done: boolean;
};

export type StudyContract = {
  title: string;
  milestones: ContractMilestone[];
  coachTip: string;
};

/**
 * Clean helper to extract subject or topic keywords from user goals
 */
function extractKeywords(goal: string): string {
  const clean = goal.toLowerCase();
  // Strip out common verbs and fillers
  const stopWords = new Set([
    "solve", "read", "write", "complete", "finish", "study", "learn", "do",
    "pages", "problems", "questions", "chapter", "mcqs", "essay", "revision",
    "a", "an", "the", "of", "to", "for", "in", "on", "with", "and", "some", "my"
  ]);
  
  const words = clean
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
    
  if (words.length === 0) return "General Study";
  // Capitalize first letters and join up to 3 words
  return words
    .slice(0, 3)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Intelligent client-side fallback that creates a highly tailored contract structure.
 * This guarantees the feature works perfectly out-of-the-box for localhost/demo modes.
 */
function generateHeuristicsContract(
  myGoal: string,
  partnerGoal: string,
  durationMinutes: number,
  mode: "silent" | "collaborative" | "quizzing"
): StudyContract {
  const myTopic = extractKeywords(myGoal);
  const partnerTopic = extractKeywords(partnerGoal);
  
  let title = `${myTopic} & ${partnerTopic} Sprint`;
  if (myTopic === partnerTopic) {
    title = `Collaborative ${myTopic} Workshop`;
  }
  
  // Distribute time budgets (default total = durationMinutes)
  let setupTime = 5;
  let reviewTime = 5;
  
  if (durationMinutes >= 75) {
    setupTime = 10;
    reviewTime = 15;
  } else if (durationMinutes >= 50) {
    setupTime = 10;
    reviewTime = 10;
  }
  
  const focusTime = durationMinutes - setupTime - reviewTime;
  
  const milestones: ContractMilestone[] = [];
  let coachTip = "";
  
  // Phase 1: Setup
  milestones.push({
    id: "setup",
    label: "Session Kickoff & Strategy Sync",
    durationMinutes: setupTime,
    description: `Set expectation: You will work on "${myGoal}" while your partner focuses on "${partnerGoal}". Agree on mute preferences.`,
    done: false
  });
  
  // Phase 2: Focus block depending on study habit mode
  if (mode === "silent") {
    milestones.push({
      id: "focus",
      label: "Deep Work Silent Sprint",
      durationMinutes: focusTime,
      description: `Keep cameras ON, microphones MUTED. Focus on your respective goals: "${myGoal}" and "${partnerGoal}". No distractions.`,
      done: false
    });
    coachTip = "Tip: Silent deep-work with visual presence mimics a library setting, boosting accountability by up to 50%. Keep cameras on!";
  } else if (mode === "quizzing") {
    const halfFocus = Math.round(focusTime / 2);
    milestones.push({
      id: "focus-1",
      label: `Partner A Focus & Partner B Quiz Setup`,
      durationMinutes: halfFocus,
      description: `Focus on progress. Partner B begins collecting concepts or quiz questions based on "${myGoal}".`,
      done: false
    });
    milestones.push({
      id: "focus-2",
      label: `Partner B Focus & Partner A Quiz Setup`,
      durationMinutes: focusTime - halfFocus,
      description: `Focus on progress. Partner A begins collecting quiz questions based on "${partnerGoal}".`,
      done: false
    });
    coachTip = "Tip: Active testing triggers 'retrieval practice', which consolidates memory far better than passive re-reading. Quiz each other thoroughly!";
  } else {
    // Collaborative
    milestones.push({
      id: "focus",
      label: "Collaborative Study & Discussion",
      durationMinutes: focusTime,
      description: `Microphones active. Discuss hard concepts, share screens, and bounce ideas off each other while tackling "${myGoal}" and "${partnerGoal}".`,
      done: false
    });
    coachTip = "Tip: Explaining concepts in simple terms to a partner is the Feynman Technique. It exposes gaps in your own understanding.";
  }
  
  // Phase 3: Review
  milestones.push({
    id: "review",
    label: "Feynman Peer Check-in & Review",
    durationMinutes: reviewTime,
    description: `Spend 5 minutes each teaching the other one major concept you completed during the focus block. Validate checklist completion!`,
    done: false
  });
  
  return {
    title,
    milestones,
    coachTip
  };
}

/**
 * Main entrance to generate the Study Contract using AI (or heuristics fallback)
 */
export async function generateStudyContract(
  myGoal: string,
  partnerGoal: string,
  durationMinutes: number,
  mode: "silent" | "collaborative" | "quizzing"
): Promise<StudyContract> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    // Graceful fallback to client-side smart heuristics
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateHeuristicsContract(myGoal, partnerGoal, durationMinutes, mode));
      }, 1500); // Add a small delay to simulate processing feel
    });
  }
  
  try {
    const systemPrompt = `You are a specialized Academic Success Coach AI. Your job is to draft a collaborative "Study Contract" (structured study plan/milestones) for two students studying together in a 1-on-1 online video session.
    
    You will receive:
    - User A's Goal
    - User B's Goal
    - Session duration in minutes
    - Study Mode Preference ("silent", "collaborative", "quizzing")
    
    You must output a JSON object adhering exactly to this TypeScript schema:
    {
      "title": string (A professional, academic title combining both users' study focuses),
      "milestones": Array<{
        "id": string (unique ID like "kickoff", "focus", "review", etc.),
        "label": string (short, engaging header for the milestone),
        "durationMinutes": number (budget of minutes for this task. The sum of all milestone durationMinutes MUST equal the total session duration!),
        "description": string (specific instructions on how User A and User B can collaborate or focus on their goals during this phase),
        "done": false
      }>,
      "coachTip": string (an encouraging, science-backed study tip based on cognitive psychology, tailored to their goals)
    }
    
    Make the milestones highly academic, structured, and collaborative. Keep the tone professional, encouraging, and focused on high performance. Always return valid JSON. Do not include markdown code fence wrappers (like \`\`\`json) in your raw response.`;
    
    const userPrompt = `Draft a study plan for a ${durationMinutes}-minute session.
    - User A Goal: "${myGoal}"
    - User B Goal: "${partnerGoal}"
    - Study Mode: "${mode}"`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const resultText = data.choices[0]?.message?.content;
    
    if (!resultText) {
      throw new Error("Empty response from OpenAI");
    }
    
    const contract = JSON.parse(resultText) as StudyContract;
    
    // Ensure all milestones start with done: false
    contract.milestones = contract.milestones.map(m => ({ ...m, done: false }));
    
    return contract;
  } catch (err) {
    console.error("AI Study Contract generation error, falling back to heuristics:", err);
    return generateHeuristicsContract(myGoal, partnerGoal, durationMinutes, mode);
  }
}
