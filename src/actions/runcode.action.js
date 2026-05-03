"use server";
import axios from "axios";
import { auth } from "@clerk/nextjs/server";
import {
  createSubmission,
  updateSubmissionByJudgeToken,
} from "@/services/submissionService";
import { getVerdictFromJudge0, submissionVerdicts } from "@/lib/submission";

export const runCode = async (data) => {
  // Input validation
  if (!data || !data.code) {
    return {
      success: false,
      error: "No code provided. Please write some code before submitting.",
    };
  }

  if (!data.id) {
    return {
      success: false,
      error:
        "Invalid language selected. Please select a valid programming language.",
    };
  }

  // Prepare API request
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions",
    params: {
      wait: "false",
      fields: "*", // Return all fields
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE_0_API_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      language_id: data.id,
      source_code: data.code,
      stdin: data.stdin || "",
      expected_output: data.expected_output || "",
    },
  };

  try {
    const response = await axios.request(options);
    if (!response.data || !response.data.token) {
      throw new Error("Invalid response from code execution service");
    }

    // Get the current user ID from Clerk
    const { userId } = await auth();
    let storedSubmission = null;

    if (userId) {
      try {
        storedSubmission = await createSubmission({
          userId,
          problemId: data.problemId || "unknown",
          problemTitle: data.problemTitle || "",
          language: data.language || String(data.id),
          languageId: data.id,
          code: data.code,
          status: submissionVerdicts.PROCESSING,
          stdin: data.stdin || "",
          expectedOutput: data.expected_output || "",
          sourceToken: response.data.token,
          judgeToken: response.data.token,
        });
      } catch (error) {
        console.error("Failed to store submission:", error);
      }
    }

    return {
      success: true,
      token: response.data.token,
      submissionId: storedSubmission?._id || null,
      message: "Code submitted successfully. Processing...",
    };
  } catch (error) {
    console.error("Code execution error:", error);

    // Provide more detailed error messages
    let errorMessage = "Failed to submit code";

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;

      if (status === 401 || status === 403) {
        errorMessage = "Authentication error with code execution service";
      } else if (status === 429) {
        errorMessage = "Too many requests. Please try again later.";
      } else if (status >= 500) {
        errorMessage =
          "The code execution service is currently unavailable. Please try again later.";
      } else if (error.response.data && error.response.data.error) {
        errorMessage = `Execution error: ${error.response.data.error}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage =
        "No response from code execution service. Please check your internet connection.";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

export const getSubmissionResult = async (token) => {
  if (!token) {
    return { error: "No submission token provided" };
  }

  const options = {
    method: "GET",
    url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
    params: {
      base64_encoded: "true", // Data will be base64 encoded
      fields: "*",
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE_0_API_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);

    // Check for valid response
    if (!response.data || !response.data.status) {
      throw new Error("Invalid response format from code execution service");
    }

    const {
      stdout,
      stderr,
      compile_output,
      message,
      expected_output,
      status,
      time,
      memory,
    } = response.data;

    const decodeBase64 = (base64String) => {
      try {
        return base64String
          ? Buffer.from(base64String, "base64").toString("utf-8")
          : null;
      } catch (error) {
        console.error("Error decoding base64:", error);
        return "Error decoding output";
      }
    };

    const decodedStdout = decodeBase64(stdout);
    const decodedStderr = decodeBase64(stderr);
    const decodedCompileOutput = decodeBase64(compile_output);
    const decodedExpected = decodeBase64(expected_output);
    const errorOutput = decodedStderr || decodedCompileOutput;
    let formattedOutput = decodedStdout || "";

    if (errorOutput) {
      formattedOutput = errorOutput;
    }

    if (message) {
      formattedOutput = formattedOutput
        ? `${message}\n\n${formattedOutput}`
        : message;
    }

    const verdict = getVerdictFromJudge0(status.id, status.description);
    const testResults = decodedExpected
      ? [
          {
            index: 0,
            input: "",
            expectedOutput: decodedExpected,
            actualOutput: decodedStdout || errorOutput || "",
            passed: verdict === submissionVerdicts.ACCEPTED,
            status: verdict,
          },
        ]
      : [];

    return {
      output: formattedOutput,
      status: status,
      verdict,
      expected: decodedExpected,
      stdout: decodedStdout,
      stderr: decodedStderr,
      compileOutput: decodedCompileOutput,
      runtime: time ? Number.parseFloat(time) : undefined,
      memory,
      passedCount: verdict === submissionVerdicts.ACCEPTED ? 1 : 0,
      totalCount: decodedExpected ? 1 : 0,
      testResults,
      processing: status.id <= 2,
      compile_error: status.id === 6,
      runtime_error: status.id === 7,
      time_limit_exceeded: status.id === 5,
    };
  } catch (error) {
    console.error("Error fetching submission result:", error);

    let errorMessage = "Failed to fetch submission data";

    if (error.response) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        errorMessage = "Authentication error with code execution service";
      } else if (status === 404) {
        errorMessage = `Submission token '${token}' not found. Please try submitting again.`;
      } else if (status === 429) {
        errorMessage = "Too many requests. Please try again later.";
      } else if (status >= 500) {
        errorMessage =
          "The code execution service is currently unavailable. Please try again later.";
      }
    } else if (error.request) {
      errorMessage =
        "No response received from code execution service. Please check your internet connection.";
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }

    return { error: errorMessage };
  }
};

export const pollSubmissionResult = async (
  token,
  submissionId = null,
  maxAttempts = 10,
  interval = 2000
) => {
  // Validate input token
  if (!token) {
    return {
      success: false,
      error:
        "No submission token provided. Please try submitting your code again.",
    };
  }

  let attempts = 0;
  let lastError = null;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const result = await getSubmissionResult(token);

      // If we got an error from the getSubmissionResult function
      if (result.error) {
        lastError = result.error;

        // If this is the last attempt, return the error
        if (attempts >= maxAttempts) {
          break;
        }

        // Otherwise, wait and try again
        await new Promise((resolve) => setTimeout(resolve, interval));
        continue;
      }

      // If the code is still processing, wait and try again
      if (result.processing) {
        await new Promise((resolve) => setTimeout(resolve, interval));
        continue;
      }

      await updateSubmissionByJudgeToken(token, result.verdict, {
        runtime: result.runtime,
        memory: result.memory,
        output: result.output,
        stdout: result.stdout,
        stderr: result.stderr,
        compileOutput: result.compileOutput,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        testResults: result.testResults,
        finishedAt: new Date(),
      });

      return {
        success: true,
        result,
        submissionId,
      };
    } catch (error) {
      console.error("Polling error:", error);
      lastError = "Error while polling for results";

      // If this is the last attempt, break out of the loop
      if (attempts >= maxAttempts) {
        break;
      }

      // Otherwise, wait and try again with exponential backoff
      const backoffInterval = interval * Math.pow(1.5, attempts - 1);
      await new Promise((resolve) => setTimeout(resolve, backoffInterval));
    }
  }

  // If we've exhausted all attempts, return a comprehensive error message
  return {
    success: false,
    error:
      lastError ||
      `Submission is taking too long. Please try submitting with simpler code or check if there's an infinite loop in your solution. Submission token: ${token}`,
  };
};

export const getCode = async () => {
  const options = {
    method: "GET",
    url: "https://judge0-ce.p.rapidapi.com/submissions/5064159e-efa1-4c17-b8d9-21c244c099bc",
    params: {
      base64_encoded: "true", // Data will be base64 encoded
      fields: "*",
    },
    headers: {
      "x-rapidapi-key": "093196a06amsh0ccf49a6ba0a29cp1c7d0djsnc929252a89fa",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const {
      source_code,
      stdout,
      stderr,
      compile_output,
      expected_output,
      post_execution_filesystem,
    } = response.data;
    console.log(response.data.status.description);
    console.log(response.data);

    // Decode Base64 Data
    const decodeBase64 = (base64String) =>
      base64String
        ? Buffer.from(base64String, "base64").toString("utf-8")
        : null;
    console.log(decodeBase64(source_code));
    console.log(decodeBase64(expected_output));
    console.log(decodeBase64(stdout));
    console.log(decodeBase64(stderr));
    console.log(decodeBase64(compile_output));

    return {
      sourceCode: decodeBase64(source_code), // Decoded source code
      output:
        decodeBase64(stdout) ||
        decodeBase64(stderr) ||
        decodeBase64(compile_output), // Output, error, or compile error
    };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch submission data" };
  }
};
