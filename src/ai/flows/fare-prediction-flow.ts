'use server';
/**
 * @fileOverview A fare prediction AI agent.
 *
 * - predictFare - A function that suggests the best booking time.
 * - FarePredictionInput - The input type for the predictFare function.
 * - FarePredictionOutput - The return type for the predictFare function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FarePredictionInputSchema = z.object({
  pickupLocation: z.string().describe('The starting point of the ride.'),
  destinationLocation: z.string().describe('The destination of the ride.'),
  currentTime: z.string().describe('The current time of the request.'),
});
export type FarePredictionInput = z.infer<typeof FarePredictionInputSchema>;

const FarePredictionOutputSchema = z.object({
  suggestion: z.string().describe('A concise tip about when fares might be cheaper.'),
});
export type FarePredictionOutput = z.infer<typeof FarePredictionOutputSchema>;

export async function predictFare(input: FarePredictionInput): Promise<FarePredictionOutput> {
  return farePredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'farePredictionPrompt',
  input: {schema: FarePredictionInputSchema},
  output: {schema: FarePredictionOutputSchema},
  prompt: `You are a fare prediction expert for MithilaCab. Based on simulated historical ride data for the Mithila region (Darbhanga, Madhubani, etc.), analyze the provided ride request. Your goal is to give the user a helpful, concise tip (1-2 sentences) about when fares might be cheaper or if now is a good time to book.

**Simulated Historical Data Patterns:**
- Morning Rush Hour (8 AM - 10 AM): High demand, higher fares.
- Evening Rush Hour (5 PM - 8 PM): Highest demand, highest fares.
- Midday (11 AM - 4 PM): Lower demand, cheaper fares.
- Late Night (after 9 PM): Lowest demand, cheapest fares.
- Weekends (especially Saturday evenings): High demand, similar to rush hour.
- Special locations (Airport, Railway Station): Consistently high demand.

**Current Request:**
- Pickup: {{{pickupLocation}}}
- Destination: {{{destinationLocation}}}
- Current Time: {{{currentTime}}}

**Your Task:**
Based on the current time and locations, provide a helpful suggestion.

**Examples:**
- If current time is 7 PM: "Fares are high during the evening rush. You might find a cheaper ride after 8 PM."
- If current time is 2 PM: "This is a great time to book! Fares are usually lower during midday."
- If pickup is 'Darbhanga Airport': "Rides from the airport are always in high demand. Booking now is a good idea."
- If it's Saturday 8 PM: "Fares are high on weekend evenings. If your plan is flexible, booking later tonight might be cheaper."

Generate your suggestion now.`,
});

const farePredictionFlow = ai.defineFlow(
  {
    name: 'farePredictionFlow',
    inputSchema: FarePredictionInputSchema,
    outputSchema: FarePredictionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
