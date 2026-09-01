const { GoogleGenAI, Type } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

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

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();

  return pdfBuffer;
}

const resumePdfZodSchema = z.object({
  html: z
    .string()
    .describe(
      "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
    ),
});

const resumePdfGeminiSchema = {
  type: Type.OBJECT,
  properties: {
    html: {
      type: Type.STRING,
      description:
        "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
    },
  },
  required: ["html"],
};

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: resumePdfGeminiSchema,
    },
  });

  let jsonContent;
  try {
    jsonContent = JSON.parse(response.text);
  } catch (err) {
    throw new Error(`Gemini did not return valid JSON: ${response.text}`);
  }

  const parsed = resumePdfZodSchema.safeParse(jsonContent);
  if (!parsed.success) {
    console.error("RAW GEMINI TEXT WAS:", response.text);
    throw new Error(
      `Gemini output failed schema validation: ${JSON.stringify(parsed.error.issues, null, 2)}`,
    );
  }

  const resumePdf = await generatePdfFromHtml(parsed.data.html);

  return resumePdf;
}

module.exports = { generateInterviewReport, generateResumePdf };
