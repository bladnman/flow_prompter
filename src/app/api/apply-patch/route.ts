// Apply-patch endpoint - intelligently merges suggestions with the current prompt
import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { getLanguageModel } from '@/lib/ai/providers';
import { z } from 'zod';

// Use a fast, capable model for patch application
const DEFAULT_APPLY_MODEL = 'claude-sonnet-4-5-20250929';

const applyPatchSchema = z.object({
  currentPrompt: z.string(),
  originalPrompt: z.string().optional(), // Prompt when suggestion was generated
  suggestion: z.object({
    type: z.enum(['full_rewrite', 'patch']),
    confidence: z.enum(['high', 'medium', 'low']),
    proposed: z.string(),
    rationale: z.string(),
  }),
  modelId: z.string().optional(),
  apiKey: z.string().optional(), // Client-provided API key (from localStorage)
});

const SYSTEM_PROMPT = `You are a prompt editing assistant. Your job is to apply a suggested edit to a prompt.

You will receive:
1. The CURRENT prompt (which may have already been modified)
2. Optionally, the ORIGINAL prompt (what the suggestion was based on)
3. A suggested edit with:
   - type: "full_rewrite" or "patch"
   - proposed: The suggested content (may be instructions OR the actual replacement text)
   - rationale: Why this suggestion was made

Your task:
- If the suggestion type is "full_rewrite" and the proposed content looks like a complete prompt, use it as-is
- If the proposed content contains instructions (e.g., "Add this line...", "Insert the following..."), follow the instructions to modify the current prompt
- If there's a mismatch between original and current (prompt has changed), intelligently adapt the suggestion

CRITICAL: Output ONLY the final prompt text. No explanations, no markdown formatting, no code blocks. Just the raw prompt text that should replace the current prompt.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = applyPatchSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { currentPrompt, originalPrompt, suggestion, modelId, apiKey } = parsed.data;

    // Build the user message with all context
    let userMessage = `## Current Prompt\n${currentPrompt}\n\n`;

    if (originalPrompt && originalPrompt !== currentPrompt) {
      userMessage += `## Original Prompt (when suggestion was created)\n${originalPrompt}\n\n`;
      userMessage += `Note: The prompt has been modified since this suggestion was generated. Please adapt the suggestion to work with the current prompt.\n\n`;
    }

    userMessage += `## Suggestion to Apply\n`;
    userMessage += `Type: ${suggestion.type}\n`;
    userMessage += `Confidence: ${suggestion.confidence}\n\n`;
    userMessage += `### Proposed Edit\n${suggestion.proposed}\n\n`;
    userMessage += `### Rationale\n${suggestion.rationale}\n\n`;
    userMessage += `Now output ONLY the final prompt text after applying this suggestion:`;

    const model = getLanguageModel(modelId || DEFAULT_APPLY_MODEL, apiKey);

    // Use generateText (non-streaming) since we need the complete result
    const result = await generateText({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3, // Lower temperature for more consistent merging
      maxOutputTokens: 8192,
    });

    // Return the merged prompt
    return Response.json({
      success: true,
      mergedPrompt: result.text.trim(),
    });
  } catch (error) {
    console.error('Apply-patch error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
