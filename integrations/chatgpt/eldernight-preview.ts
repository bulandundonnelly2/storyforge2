import { validateAdventureDraft, type AdventureDraft } from "./adventure-schema";

/**
 * Convert a validated ChatGPT-created draft into the existing ELDERNIGHT
 * version-2 project format. Pure function; never writes to live storage.
 *
 * Dice rules remain in the draft contract. We deliberately DO NOT silently
 * map these to the website's dice system until its exact persistence shape
 * has been verified. This avoids presenting a broken dice game as playable.
 */
export function toEldernightPreview(input: unknown) {
  const result = validateAdventureDraft(input);
  if (!result.ok) return result;
  const draft: AdventureDraft = result.draft;
  const diceChoices = draft.scenes.flatMap(scene =>
    scene.choices.filter(choice => choice.dice?.enabled).map(choice => `${scene.id}/${choice.id}`)
  );
  if (diceChoices.length) {
    return { ok: false as const, errors: [
      "Dice-enabled choices require mapping to the site's native dice format before export.",
      ...diceChoices.map(id => `Dice mapping needed: ${id}`),
    ] };
  }

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
      })),
    })),
  };
  return { ok: true as const, project };
}
