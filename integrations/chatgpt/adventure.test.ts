import assert from "node:assert/strict";
import { test } from "node:test";
import { validateAdventureDraft } from "./adventure-schema.js";
import { toEldernightPreview } from "./eldernight-preview.js";

const draft = () => ({
  title: "The Broken Crown",
  premise: "An ancient crown calls to a wandering knight.",
  genre: "Dark Fantasy",
  readingLevel: 4,
  startSceneId: "start",
  scenes: [
    { id: "start", title: "At the gate", narration: "The gate trembles.", ending: "none" as const, choices: [
      {id:"open",label:"Open the gate",nextSceneId:"victory",dice:{
        enabled:true,sides:6,target:4,successSceneId:"victory",failureSceneId:"death"
      }},
    ] },
    { id: "victory", title: "Dawn", narration: "The kingdom is saved.", ending: "victory" as const, choices: [] },
    { id: "death", title: "Last breath", narration: "The hero has fallen.", ending: "death" as const, choices: [] },
  ],
});
test("valid story exports in native ELDERNIGHT v2 shape", () => {
  const result = toEldernightPreview(draft());
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.project.version,2);
  assert.equal(result.project.opening,"start");
  assert.equal(result.project.scenes[0].choices[0].roll?.target,4);
  assert.equal(result.project.scenes[0].choices[0].roll?.failure,"death");
  assert.equal(result.project.scenes[2].type,"ending");
});
test("missing scene links fail validation", () => {
  const input=draft();
  input.scenes[0].choices[0].nextSceneId="missing";
  assert.equal(validateAdventureDraft(input).ok,false);
});
test("duplicate scene identifiers fail validation", () => {
  const input=draft();
  input.scenes[1].id="start";
  assert.equal(validateAdventureDraft(input).ok,false);
});
test("incompatible dice are not exported", () => {
  const input=draft();
  input.scenes[0].choices[0].dice.sides=20;
  assert.equal(toEldernightPreview(input).ok,false);
});
test("missing failure outcome cannot be exported", () => {
  const input=draft();
  input.scenes[0].choices[0].dice.failureSceneId="missing";
  assert.equal(toEldernightPreview(input).ok,false);
});
test("ending scene cannot include further choices", () => {
  const input=draft();
  (input.scenes[1].choices as typeof input.scenes[0]["choices"]).push({id:"extra",label:"Continue",nextSceneId:"death",dice:{enabled:true,sides:6,target:3,successSceneId:"death",failureSceneId:"start"}});
  assert.equal(validateAdventureDraft(input).ok,false);
});
