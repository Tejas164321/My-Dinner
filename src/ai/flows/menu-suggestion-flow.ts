'use server';
/**
 * @fileOverview An AI flow for generating meal suggestions.
 *
 * - getMenuSuggestions - A function that returns a list of menu item suggestions.
 * - MenuSuggestionInput - The input type for the getMenuSuggestions function.
 * - MenuSuggestionOutput - The return type for the getMenuSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const MenuSuggestionInputSchema = z.object({
  mealType: z.string().describe('The type of meal, e.g., "Lunch" or "Dinner".'),
  existingItems: z.array(z.string()).describe('A list of items already on the menu for this meal.'),
});
export type MenuSuggestionInput = z.infer<typeof MenuSuggestionInputSchema>;

export const MenuSuggestionOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of 3-5 creative and balanced meal item suggestions based on the provided meal type and existing items.'),
});
export type MenuSuggestionOutput = z.infer<typeof MenuSuggestionOutputSchema>;

export async function getMenuSuggestions(input: MenuSuggestionInput): Promise<MenuSuggestionOutput> {
  return menuSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'menuSuggestionPrompt',
  input: { schema: MenuSuggestionInputSchema },
  output: { schema: MenuSuggestionOutputSchema },
  prompt: `You are an expert chef and nutritionist for a university mess, specializing in Indian cuisine.
Your task is to suggest creative, delicious, and well-balanced meal items.
The meal is for: {{mealType}}.
The following items are already on the menu, so please suggest complementary dishes and avoid suggesting these:
{{#if existingItems}}
{{#each existingItems}}
- {{this}}
{{/each}}
{{else}}
- None
{{/if}}

Provide 3-5 diverse and appealing suggestions that would be popular with students. Do not repeat items.
Focus on main courses or significant side dishes.
`,
});

const menuSuggestionFlow = ai.defineFlow(
  {
    name: 'menuSuggestionFlow',
    inputSchema: MenuSuggestionInputSchema,
    outputSchema: MenuSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
