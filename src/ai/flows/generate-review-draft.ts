'use server';
/**
 * @fileOverview An AI assistant that generates draft reviews for Trustpilot.
 *
 * - generateReviewDraft - A function that handles the review draft generation process.
 * - GenerateReviewDraftInput - The input type for the generateReviewDraft function.
 * - GenerateReviewDraftOutput - The return type for the generateReviewDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReviewDraftInputSchema = z.object({
  companyName: z.string().describe('The name of the company to review.'),
  userExperience: z.string().describe('Detailed personal experience with the company.'),
  keyPoints: z.array(z.string()).describe('Key aspects or points to highlight in the review.').optional(),
  rating: z.number().int().min(1).max(5).describe('The star rating (1-5) for the review.'),
});
export type GenerateReviewDraftInput = z.infer<typeof GenerateReviewDraftInputSchema>;

const GenerateReviewDraftOutputSchema = z.object({
  reviewDraft: z.string().describe('The generated draft review for the company.'),
});
export type GenerateReviewDraftOutput = z.infer<typeof GenerateReviewDraftOutputSchema>;

export async function generateReviewDraft(input: GenerateReviewDraftInput): Promise<GenerateReviewDraftOutput> {
  return generateReviewDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReviewDraftPrompt',
  input: {schema: GenerateReviewDraftInputSchema},
  output: {schema: GenerateReviewDraftOutputSchema},
  prompt: `You are an AI assistant specialized in generating well-structured, grammatically correct, and honest review drafts for Trustpilot.
Your goal is to help users articulate their experiences into a concise and impactful review.

Based on the user's input, generate a review draft for Trustpilot.

Company Name: {{{companyName}}}
User's Personal Experience: {{{userExperience}}}

{{#if keyPoints}}
Key Points to Highlight:
{{#each keyPoints}}- {{{this}}}
{{/each}}
{{/if}}

Rating: {{{rating}}} out of 5 stars

Instructions:
1.  Start with a clear summary sentence that reflects the overall rating.
2.  Elaborate on the "User's Personal Experience", integrating the "Key Points to Highlight" naturally.
3.  Ensure the tone matches the provided "Rating". For example, a 1-star review should reflect significant dissatisfaction, while a 5-star review should convey strong satisfaction.
4.  The review should sound authentic and personal.
5.  The draft should be between 100-300 words.
6.  Do not include any introductory or concluding remarks outside the review itself (e.g., "Here is your review draft:", "I hope this helps!"). Just output the review text.`,
});

const generateReviewDraftFlow = ai.defineFlow(
  {
    name: 'generateReviewDraftFlow',
    inputSchema: GenerateReviewDraftInputSchema,
    outputSchema: GenerateReviewDraftOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
