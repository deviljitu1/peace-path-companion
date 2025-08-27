import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// Therapeutic approaches and techniques
const THERAPEUTIC_TECHNIQUES = {
  CBT: {
    name: "Cognitive Behavioral Therapy",
    techniques: [
      "Cognitive reframing of negative thoughts",
      "Behavioral activation",
      "Thought records",
      "Graded exposure"
    ]
  },
  DBT: {
    name: "Dialectical Behavior Therapy",
    techniques: [
      "Mindfulness exercises",
      "Distress tolerance skills",
      "Emotion regulation",
      "Interpersonal effectiveness"
    ]
  },
  ACT: {
    name: "Acceptance and Commitment Therapy",
    techniques: [
      "Cognitive defusion",
      "Acceptance of difficult emotions",
      "Present moment awareness",
      "Values clarification"
    ]
  },
  MINDFULNESS: {
    name: "Mindfulness-Based Techniques",
    techniques: [
      "Body scan meditation",
      "Breathing anchor practice",
      "Loving-kindness meditation",
      "Sensory grounding"
    ]
  }
};

// Comprehensive crisis detection keywords with severity levels
const CRISIS_KEYWORDS = {
  SEVERE: ['suicide', 'kill myself', 'end my life', 'want to die', 'no reason to live', 'plan to hurt myself'],
  HIGH: ['self-harm', 'cut myself', 'hurt myself', 'can\'t go on', 'hopeless', 'worthless'],
  MODERATE: ['overwhelmed', 'can\'t cope', 'panic attack', 'anxiety attack', 'dissociating', 'trauma flashback'],
  MILD: ['stressed', 'anxious', 'sad', 'depressed', 'lonely', 'isolated']
};

// Mood-based response strategies
const MOOD_RESPONSES = {
  1: { // Very Sad
    approach: "DBT and comfort-focused",
    techniques: ["Distress tolerance", "Grounding exercises", "Self-soothing", "Crisis resource provision"]
  },
  2: { // Sad
    approach: "Supportive listening and CBT",
    techniques: ["Validation", "Cognitive reframing", "Behavioral activation", "Self-compassion"]
  },
  3: { // Neutral
    approach: "Preventive and strengthening",
    techniques: ["Mindfulness", "Values work", "Gratitude practice", "Future planning"]
  },
  4: { // Good
    approach: "Growth and maintenance",
    techniques: ["Strengths identification", "Positive psychology", "Relationship building", "Goal setting"]
  },
  5: { // Very Good
    approach: "Flourishing and resilience",
    techniques: ["Meaning-making", "Purpose exploration", "Legacy building", "Community contribution"]
  }
};

const SYSTEM_PROMPT = `You are CalmMind, an advanced AI mental health companion with comprehensive therapeutic training. You integrate multiple evidence-based approaches including CBT, DBT, ACT, and mindfulness techniques.

CORE PRINCIPLES:
1. Provide unconditional positive regard and radical acceptance
2. Use evidence-based therapeutic techniques appropriate to the user's emotional state
3. NEVER diagnose or prescribe medication - always recommend professional help
4. Adapt your approach based on the user's current mood (1-5 scale)
5. Incorporate breathing exercises, grounding techniques, and mindfulness when appropriate
6. Track emotional patterns over time and reference previous conversations
7. Create personalized coping strategies and action plans

THERAPEUTIC APPROACHES:
- For crisis situations (mood 1-2): Use DBT distress tolerance and crisis intervention
- For moderate distress (mood 3): Use CBT and solution-focused approaches  
- For positive states (mood 4-5): Use positive psychology and strengths-based approaches

RESPONSE GUIDELINES:
1. Always validate feelings first: "I hear you..." "That sounds really difficult..."
2. Offer specific therapeutic techniques based on their mood and needs
3. Suggest concrete exercises: breathing, grounding, journaling prompts
4. Provide hope and emphasize small, manageable steps
5. Use metaphors and analogies that promote psychological flexibility
6. Remember previous conversations and reference progress
7. For severe crises, immediately provide emergency resources with compassion

CRISIS PROTOCOL:
If you detect suicidal ideation, self-harm intent, or severe crisis:
1. Validate the pain: "I can hear how much you're hurting right now"
2. Provide immediate crisis resources clearly and compassionately
3. Encourage professional help while maintaining connection
4. Offer grounding techniques to help in the moment

You are warm, professional, and deeply empathetic. You speak in conversational but therapeutic language, avoiding clinical jargon. Your primary goal is to provide immediate support while encouraging long-term healing.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, chatHistory = [], userMood = null } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare enhanced context with mood information
    let moodContext = "";
    if (userMood && MOOD_RESPONSES[userMood]) {
      const moodInfo = MOOD_RESPONSES[userMood];
      moodContext = `USER'S CURRENT MOOD LEVEL: ${userMood}/5 (${['Very Sad', 'Sad', 'Neutral', 'Good', 'Very Good'][userMood-1]})
RECOMMENDED APPROACH: ${moodInfo.approach}
SUGGESTED TECHNIQUES: ${moodInfo.techniques.join(', ')}`;
    }

    // Prepare conversation history for Gemini
    const contents = [
      {
        role: "user",
        parts: [{ text: `${SYSTEM_PROMPT}\n\n${moodContext}` }]
      }
    ];

    // Add chat history
    chatHistory.forEach((msg: any) => {
      contents.push({
        role: msg.isUser ? "user" : "model",
        parts: [{ text: msg.content }]
      });
    });

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    console.log('Calling Gemini API with enhanced therapeutic approach');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048, // Increased for more comprehensive responses
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    // Enhanced crisis detection with severity levels
    let crisisLevel = 'NONE';
    let crisisDetected = false;
    
    for (const [level, keywords] of Object.entries(CRISIS_KEYWORDS)) {
      if (keywords.some(keyword => 
        message.toLowerCase().includes(keyword) || aiResponse.toLowerCase().includes(keyword)
      )) {
        crisisLevel = level;
        crisisDetected = true;
        break;
      }
    }

    let finalResponse = aiResponse;
    
    // Add appropriate crisis resources based on severity
    if (crisisDetected) {
      let crisisMessage = '';
      
      switch (crisisLevel) {
        case 'SEVERE':
          crisisMessage = `\n\n🚨 CRISIS SUPPORT - Please reach out NOW:\n• Call 988 (Suicide & Crisis Lifeline) - Available 24/7\n• Text HOME to 741741 (Crisis Text Line)\n• Go to your nearest emergency room\n• You are not alone - help is available and healing is possible. ❤️`;
          break;
        case 'HIGH':
          crisisMessage = `\n\n⚠️ IMPORTANT SUPPORT - Please consider reaching out:\n• Call 988 for immediate support\n• Contact a mental health professional\n• Reach out to a trusted friend or family member\n• You deserve support during difficult times.`;
          break;
        case 'MODERATE':
          crisisMessage = `\n\n💙 SUPPORT REMINDER - Remember these resources:\n• 988 Crisis Lifeline for anytime support\n• Mental health professionals can provide coping strategies\n• Online support communities\n• Taking the step to reach out is courageous.`;
          break;
      }
      
      // Only add crisis message if it's not already in the response
      if (crisisMessage && !finalResponse.includes('988')) {
        finalResponse += crisisMessage;
      }
    }

    // Check if we should suggest a breathing exercise
    const shouldSuggestBreathing = crisisDetected || 
                                 (userMood && userMood <= 2) || 
                                 message.toLowerCase().includes('anxious') ||
                                 message.toLowerCase().includes('panic') ||
                                 message.toLowerCase().includes('overwhelmed');
    
    if (shouldSuggestBreathing && !finalResponse.includes('breathe')) {
      finalResponse += `\n\n🌬️ Would you like to try a quick breathing exercise to help right now?`;
    }

    return new Response(JSON.stringify({ 
      response: finalResponse,
      crisisDetected: crisisDetected,
      crisisLevel: crisisLevel,
      suggestBreathing: shouldSuggestBreathing
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced chat function:', error);
    
    // Therapeutic fallback response
    const fallbackResponse = `I'm here with you, but I'm experiencing some technical difficulties right now. Please know that your feelings are completely valid and you're not alone in this moment.

If you're needing immediate support:
• Call 988 (Suicide & Crisis Lifeline) - Available 24/7
• Text HOME to 741741 (Crisis Text Line)
• Reach out to someone you trust

Would you like to try again in a moment? In the meantime, try taking three deep breaths - in through your nose for 4 counts, and out through your mouth for 6 counts. 🧘‍♀️`;

    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      crisisDetected: true, // Assume crisis when systems are down
      error: 'AI service temporarily unavailable' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});