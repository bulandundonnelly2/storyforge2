import { validateAdventureDraft, type AdventureDraft } from "./adventure-schema";

/**
 * Convert a validated ChatGPT-created draft into the existing ELDERNIGHT
 * version-2 project format. Pure function; never writes to live storage.
 *
 * Supports the site's native six-sided dice choice shape (roll.target,
 * roll.failure, roll.risk, roll.effects). Other dice types fail validation.
 * This converter does not persist data or perform rolls.
 */
export function toEldernightPreview(input: unknown) {
  const result = validateAdventureDraft(input);
  if (!result.ok) return result;
  const draft: AdventureDraft = result.draft;
  const diceChoices = draft.scenes.flatMap(scene =>
    scene.choices.filter(choice => choice.dice?.enabled).map(choice => ({ scene, choice }))
  );
  const diceErrors: string[] = [];
  for (const { scene, choice } of diceChoices) {
    const dice = choice.dice!;
    if (dice.sides !== 6) diceErrors.push(`Six-sided dice required at ${scene.id}/${choice.id}`);
    if (dice.target == null || dice.target < 2 || dice.target > 6) diceErrors.push(`Target must be between 2 and 6 at ${scene.id}/${choice.id}`);
    if (!choice.nextSceneId || !dice.failureSceneId) diceErrors.push(`Success and failure destinations required at ${scene.id}/${choice.id}`);
    if (dice.successSceneId && dice.successSceneId !== choice.nextSceneId) diceErrors.push(`Success scene must equal choice destination at ${scene.id}/${choice.id}`);
    if (dice.failureSceneId === choice.nextSceneId) diceErrors.push(`Dice outcome destinations must differ at ${scene.id}/${choice.id}`);
  }
  if (diceErrors.length) return { ok: false as const, errors: diceErrors };

  const project = {
    version: 2,
    title: draft.title,
    genre: draft.genre,
    description: draft.premise,
    hook: draft.premise.slice(0, 160),
    world: draft.premise.slice(0, 160),
    heroName: "The traveller",
    heroDescription: "An adventurer whose fate is shaped by choices.",
    heroPersonality: "Curious",
    heroGoal: "Discover what happens next",
    music: "Dungeon",
    portrait: "Traveller",
    background: "Forest",
    customPortrait: "",
    customBackground: "",
    opening: draft.startSceneId,
    // Kept in the integration payload; the existing editor may not display it.
    readingLevel: draft.readingLevel,
    scenes: draft.scenes.map(scene => ({
      id: scene.id,
      title: scene.title,
      text: scene.narration,
      background: "Forest",
      portrait: "Traveller",
      type: scene.ending === "none" ? "scene" : "ending",
      choices: scene.choices.map(choice => ({
        id: choice.id,
        text: choice.label,
        target: choice.nextSceneId,
        effects: [],
        ...(choice.dice?.enabled ? {
          roll: {
            target: choice.dice.target!,
            failure: choice.dice.failureSceneId!,
            risk: "Failure: the attempt goes wrong.",
            effects: [],
          },
        } : {}),
      })),
    })),
  };
  return { ok: true as const, project };
}
