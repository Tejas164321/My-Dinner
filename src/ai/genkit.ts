import {genkit} from 'genkit';
import {next} from '@genkit-ai/next';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [next(), googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
