/**
 * @fileoverview This file initializes the Genkit AI system and exports the `ai`
 * object for use throughout the application. It configures the Google AI
 * plugin for interacting with generative models.
 *
 * It is essential to import this file and use the exported `ai` object for
 * any AI-related tasks to ensure proper initialization and configuration.
 */
import {genkit, type GenkitErrorCode, type GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

/**
 * The initialized Genkit AI instance.
 *
 * This object is pre-configured with the necessary plugins, such as the
 * Google AI plugin. It should be used for all AI-related operations, including
 * defining flows, prompts, and generating content.
 */
export const ai = genkit({
  plugins: [googleAI()],
});

/**
 * Checks if an error is a GenkitError with a specific error code.
 * @param {unknown} err - The error to check.
 * @param {GenkitErrorCode} code - The Genkit error code to match.
 * @returns {boolean} - True if the error is a GenkitError with the specified
 *   code, false otherwise.
 */
export function isGenkitError(
  err: unknown,
  code: GenkitErrorCode
): err is GenkitError {
  return !!err && (err as GenkitError).code === code;
}
