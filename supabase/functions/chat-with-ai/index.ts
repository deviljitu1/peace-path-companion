import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const SYSTEM_PROMPT = `You are CalmMind, an empathetic AI mental health companion. 
Your goals:
- Listen carefully, respond with warmth and kindness.
- Provide coping strategies, exercises, and supportive reflections.
- NEVER diagnose or prescribe medication.
- Encourage professional help when needed.
- Use gentle, hopeful language.

Features to provide:
1. If the user selects a mental health category, guide them with tailored exercises and resources.
2. If the user is unsure, ask thoughtful questions to help identify what they may be experiencing.
3. Offer quizzes (PHQ-9, GAD-7, lifestyle check) and explain results in plain, supportive language.
4. Generate personalized action plans (self-care routines, journaling prompts, mindfulness).
5. Track progress and encourage consistent small steps.
6. If a crisis is detected (suicidal ideation, self-harm, hopelessness), respond with empathy and share hotline numbers (e.g., U.S. 988, or local equivalents).

Tone:
- Empathetic, warm, non-judgmental.
- Short, clear, supportive sentences.
- Offer options instead of commands.

Always respond as CalmMind and maintain this supportive, caring persona throughout the conversation.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, chatHistory = [] } = await req.json();

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

    // Prepare conversation history for Gemini
    const contents = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }]
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

    console.log('Calling Gemini API with message:', message);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
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
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    // Check for crisis keywords and add crisis resources if needed
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'hopeless', 'worthless', 'self-harm', 'hurt myself'];
    const containsCrisisKeywords = crisisKeywords.some(keyword => 
      message.toLowerCase().includes(keyword) || aiResponse.toLowerCase().includes(keyword)
    );

    let finalResponse = aiResponse;
    if (containsCrisisKeywords && !aiResponse.includes('988')) {
      finalResponse += '\n\n🚨 If you\'re having thoughts of self-harm, please reach out for immediate support:\n• Call 988 (Suicide & Crisis Lifeline) - Available 24/7\n• Text HOME to 741741 (Crisis Text Line)\n• Go to your nearest emergency room\n\nYou are not alone, and help is available. ❤️';
    }

    return new Response(JSON.stringify({ 
      response: finalResponse,
      crisisDetected: containsCrisisKeywords 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    
    // Fallback response
    const fallbackResponse = "I'm here to support you, but I'm having trouble connecting right now. Please know that your feelings are valid and you're not alone. If this is urgent, please call 988 (Suicide & Crisis Lifeline) or reach out to a trusted friend, family member, or healthcare provider. Would you like to try again in a moment?";
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      error: 'AI service temporarily unavailable' 
    }), {
      status: 200, // Return 200 to show fallback message
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});