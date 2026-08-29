const { GoogleGenAI, Type } = require("@google/genai");
const { z } = require("zod");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z.number(),
  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),
  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),
  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),
  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    }),
  ),
  title: z.string(),
});

const questionItem = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "The question that can be asked in the interview",
    },
    intention: {
      type: Type.STRING,
      description:
        "The intention of the interviewer behind asking this question",
    },
    answer: {
      type: Type.STRING,
      description:
        "How to answer this question, what points to cover, what approach to take etc.",
    },
  },
  required: ["question", "intention", "answer"],
};

const interviewReportGeminiSchema = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.NUMBER,
      description:
        "A score between 0 and 100 indicating how well the candidate's profile matches the job description",
    },
    technicalQuestions: {
      type: Type.ARRAY,
      description:
        "Technical questions that can be asked in the interview along with their intention and how to answer them",
      items: questionItem,
    },
    behavioralQuestions: {
      type: Type.ARRAY,
      description:
        "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
      items: questionItem,
    },
    skillGaps: {
      type: Type.ARRAY,
      description:
        "List of skill gaps in the candidate's profile along with their severity",
      items: {
        type: Type.OBJECT,
        properties: {
          skill: {
            type: Type.STRING,
            description: "The skill which the candidate is lacking",
          },
          severity: {
            type: Type.STRING,
            enum: ["low", "medium", "high"],
            description:
              "The severity of this skill gap, i.e. how important is this skill for the job",
          },
        },
        required: ["skill", "severity"],
      },
    },
    preparationPlan: {
      type: Type.ARRAY,
      description:
        "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
      items: {
        type: Type.OBJECT,
        properties: {
          day: {
            type: Type.NUMBER,
            description:
              "The day number in the preparation plan, starting from 1",
          },
          focus: {
            type: Type.STRING,
            description:
              "The main focus of this day, e.g. data structures, system design, mock interviews etc.",
          },
          tasks: {
            type: Type.ARRAY,
            description: "List of tasks to be done on this day",
            items: { type: Type.STRING },
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
    title: {
      type: Type.STRING,
      description:
        "The title of the job for which the interview report is generated",
    },
  },
  required: [
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
    "title",
  ],
};

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: interviewReportGeminiSchema,
    },
  });

  let report;
  try {
    report = JSON.parse(response.text);
  } catch (err) {
    throw new Error(`Gemini did not return valid JSON: ${response.text}`);
  }

  const parsed = interviewReportSchema.safeParse(report);
  if (!parsed.success) {
    console.error("RAW GEMINI TEXT WAS:", response.text);
    throw new Error(
      `Gemini output failed schema validation: ${JSON.stringify(parsed.error.issues, null, 2)}`,
    );
  }

  return parsed.data;
}

module.exports = generateInterviewReport;
