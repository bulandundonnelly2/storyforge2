import { z } from "zod";

/** Draft-only contract for the ELDERNIGHT ChatGPT integration.
 * This does not publish, save, or alter games in the live website.
 */
export const AdventureChoice = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(300),
  nextSceneId: z.string().min(1).nullable(),
  dice: z.object({
    enabled: z.boolean(),
    sides: z.number().int().min(2).max(100).optional(),
    target: z.number().int().min(1).max(100).optional(),
    successSceneId: z.string().nullable().optional(),
    failureSceneId: z.string().nullable().optional(),
  }).optional(),
});
export const AdventureScene = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(160),
  narration: z.string().min(1).max(6000),
  choices: z.array(AdventureChoice).max(8),
  ending: z.enum(["none","victory","defeat","death"]).default("none"),
  artworkPrompt: z.string().max(1000).optional(),
});
export const AdventureDraft = z.object({
  title: z.string().min(1).max(180),
  premise: z.string().min(1).max(1500),
  genre: z.string().min(1).max(100),
  readingLevel: z.number().int().min(1).max(5),
  startSceneId: z.string().min(1),
  scenes: z.array(AdventureScene).min(1).max(80),
});
export type AdventureDraft = z.infer<typeof AdventureDraft>;

export function validateAdventureDraft(input: unknown) {
  const result = AdventureDraft.safeParse(input);
  if (!result.success) return { ok: false as const, errors: result.error.flatten() };
  const draft = result.data;
  const ids = new Set(draft.scenes.map(scene => scene.id));
  const problems: string[] = [];
  if (ids.size !== draft.scenes.length) problems.push("Duplicate scene IDs");
  if (!ids.has(draft.startSceneId)) problems.push("Start scene does not exist");
  for (const scene of draft.scenes) {
    if (scene.ending !== "none" && scene.choices.length) problems.push(`Ending scene ${scene.id} has choices`);
    for (const choice of scene.choices) {
      for (const destination of [choice.nextSceneId,choice.dice?.successSceneId,choice.dice?.failureSceneId]) {
        if (destination != null && !ids.has(destination)) problems.push(`Broken link from ${scene.id} to ${destination}`);
      }
      if (choice.dice?.enabled && (choice.dice.sides == null || choice.dice.target == null)) problems.push(`Incomplete dice rule at ${scene.id}/${choice.id}`);
    }
  }
  return problems.length ? { ok: false as const, errors: problems } : { ok: true as const, draft };
}
