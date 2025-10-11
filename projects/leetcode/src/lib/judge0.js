import axios from "axios";
import dotenv from "dotenv"

dotenv.config();
export function getJudge0LanguageId(language) {
  const languageMap = {
    PYTHON: 71,
    JAVASCRIPT: 63,
    JAVA: 62,
    CPP: 54,
    GO: 60,
  };

  return languageMap[language.toUpperCase()];
}

export function getLanguageName(languageId) {
    const LANGUAGE_NAMES = {
      74: "TypeScript",
      63: "JavaScript",
      71: "Python",
      62: "Java",
    };
    return LANGUAGE_NAMES[languageId] || "Unknown";
  }


export async function submitBatch(submissions) {
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encode=false`,
    { submissions },
    {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
      },
    }
  );

  return data;
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export async function pollBatchResults(tokens) {
  while (true) {
    const { data } = await axios.get(
      `${process.env.JUDGE0_API_URL}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
        },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.RAPIDAPI_HOST,
        },
      }
    );

    const results = data.submissions;
    // FIX: Changed r.status !== 2 to r.status.id !== 2
    const isAllDone = results.every((r) => r.status.id !== 1 && r.status.id !== 2);

    if (isAllDone) return results;

    await sleep(1000);
  }
}


// every--> all values true ---> true &&
// some --> koi bhi true --> true ||
