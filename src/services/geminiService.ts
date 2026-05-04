import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export const geminiService = {
  async rankJobs(jobs: any[], query: string) {
    if (!query || jobs.length === 0) return jobs;
    try {
      const prompt = `Rank these job IDs based on resonance with the query: "${query}". 
      Context: ProSync Oman professional networking platform.
      Return ONLY a JSON array of IDs.
      Jobs: ${JSON.stringify(jobs.map((j: any) => ({ id: j.id, title: j.title, description: j.description })))}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER }
          }
        }
      });

      const rankedIds = JSON.parse(response.text || "[]");
      return rankedIds.map((id: number) => jobs.find(j => j.id === id)).filter(Boolean);
    } catch (error) {
      console.error("AI ranking failed:", error);
      return jobs;
    }
  },

  async shortlistApplicants(jobDescription: string, applicants: any[]) {
    if (!jobDescription || applicants.length === 0) return applicants;
    try {
      const prompt = `Analyze these applicants for the job: "${jobDescription}". 
      Return a JSON array of objects with: applicantId, score (0-100), and reasoning.
      Applicants: ${JSON.stringify(applicants.map((a: any) => ({ id: a.user_id, name: a.full_name, headline: a.headline })))}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                applicantId: { type: Type.INTEGER },
                score: { type: Type.INTEGER },
                reasoning: { type: Type.STRING }
              },
              required: ["applicantId", "score", "reasoning"]
            }
          }
        }
      });

      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("AI shortlisting failed:", error);
      return null;
    }
  },

  async magicPost(content: string, instruction?: string) {
    if (!content && !instruction) return null;
    try {
      const prompt = `You are a professional social media manager for ProSync Oman, a high-end networking platform.
      Current Post Content: "${content || "(Empty)"}"
      User Request/Instruction: "${instruction || "Optimize this post for professional engagement."}"
      
      Instruction: 
      - If the user provided a request/instruction, follow it precisely to modify or generate the post content.
      - If the current post content is provided and the instruction is general, rewrite the content to be more professional, punchy, and engaging.
      - If only an instruction is provided (no content), write a full, engaging, and detailed post from scratch following that instruction. 
      - Focus on the Omani professional market.
      - Use Markdown formatting (bold, bullet points, headers) to make the content well-structured and highly readable.
      - Include relevant professional hashtags.
      - Return JSON object: { optimizedContent, suggestedTags, quiz, poll }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimizedContent: { type: Type.STRING },
              suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              quiz: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER }
                }
              },
              poll: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            required: ["optimizedContent", "suggestedTags"]
          }
        }
      });

      return JSON.parse(response.text || "null");
    } catch (error) {
      console.error("AI magic post failed:", error);
      return null;
    }
  },

  async generateInteractiveContent(topic: string, type: 'quiz' | 'poll') {
    if (!topic) return null;
    try {
      const prompt = `Generate a professional ${type} about "${topic}" for ProSync Oman. return JSON.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: type === 'quiz' ? {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER }
            },
            required: ["question", "options", "correctIndex"]
          } : {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["question", "options"]
          }
        }
      });

      return JSON.parse(response.text || "null");
    } catch (error) {
      console.error("AI interactive content generation failed:", error);
      return null;
    }
  }
};
