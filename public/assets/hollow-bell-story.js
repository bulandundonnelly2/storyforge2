// Original Eldernight featured adventure. Separate from user-owned cloud games.
window.hollowBellAdventure = () => ({
  "version": 2,
  "title": "THE HOLLOW BELL",
  "genre": "Horror",
  "description": "An original branching folk-horror tale of a winter village, a buried bell, and a dreadful bargain.",
  "hook": "When an impossible bell rings, the village chooses who must suffer for its survival.",
  "world": "Dunmire, a fictional village in the northern English marches, winter of 1318.",
  "heroName": "The Traveller",
  "heroDescription": "A travelling scribe called to record a death for which no body can be found.",
  "music": "Dungeon",
  "artDirection": "Authentic ZX Spectrum 8-bit pixel art; strictly black, white and vivid red; intricate fine dithering; medieval timber, gnarled woods, snow and gothic silhouettes; atmospheric, no smooth modern art.",
  "readingLevel": 4,
  "opening": "arrival",
  "scenes": [
    {
      "id": "arrival",
      "title": "The First Toll",
      "text": "Dunmire, in the northern marches. Winter of 1318. The chapel bell was buried thirteen years ago, yet as you cross the village green it sounds beneath your boots. You have come to record a death. The reeve has given you a name but no body. Beside the empty bell tower hangs a child's shoe tied with red thread. At the sheepfold, a man begins to scream. A candle burns in the midwife's window. The bell gives a second, dull stroke.",
      "type": "scene",
      "ending": null,
      "choices": [
        {
          "id": "arrival-0",
          "text": "Enter the chapel",
          "target": "chapel",
          "effects": []
        },
        {
          "id": "arrival-1",
          "text": "Run to the sheepfold",
          "target": "fold",
          "effects": []
        },
        {
          "id": "arrival-2",
          "text": "Seek the midwife",
          "target": "midwife",
          "effects": []
        }
      ],
      "background": "Forest",
      "portrait": "Traveller",
      "art": "hollow-bell-village.svg",
      "music": "Dungeon",
      "motion": "Wind"
    },
    {
      "id": "chapel",
      "title": "A Tower Without a Bell",
      "text": "The tower stands empty. Straw has been packed into every crack of the chapel door to keep out the wind, or some other breath. Beneath the altar, a fresh earthen seam crosses the floor. On the altar cloth someone has sewn a warning: LET NO MAN CALL IT BY ITS NAME. The reeve waits in the darkness, his boots flecked with white fur. He asks whether you have heard anything at all.",
      "type": "scene",
      "ending": null,
      "choices": [
        {
          "id": "chapel-0",
          "text": "Lift the stones beneath the altar",
          "target": "crypt",
          "effects": [],
          "roll": {
            "target": 3,
            "failure": "reeve",
            "risk": "Failure takes you down another, more dangerous path."
          }
        },
        {
          "id": "chapel-1",
          "text": "Question the reeve",
          "target": "reeve",
          "effects": []
        }
      ],
      "background": "Forest",
      "portrait": "Traveller",
      "art": "hollow-bell-village.svg",
      "music": "Dungeon",
      "motion": "Wind"
    },
    {
      "id": "fold",
      "title": "The Sheep That Would Not Bleat",
      "text": "A shepherd kneels in the mud, holding his own severed braid as though it were a dead animal. The sheep stand quite still, facing the wood. Each has a black stitch across one eyelid. Beyond the gate, a low shape moves against the snowfall: too tall for a wolf, too wrong for a man. It does not flee when it sees you. Instead, it lays a small woollen mitten on the ground.",
      "type": "scene",
      "ending": null,
      "choices": [
        {
          "id": "fold-0",
          "text": "Follow the shape into the wood",
          "target": "wood",
          "effects": [],
          "roll": {
            "target": 3,
            "failure": "midwife",
            "risk": "Failure takes you down another, more dangerous path."
          }
        },
        {
          "id": "fold-1",
          "text": "Help the shepherd to the midwife",
          "target": "midwife",
          "effects": []
        }
      ],
      "background": "Forest",
      "portrait": "Traveller",
      "art": "hollow-bell-village.svg",
      "music": "Dungeon",
      "motion": "Snow"
    },
    {
      "id": "midwife",
      "title": "Hessa's Hearth",
      "text": "Midwife Hessa keeps her shutters nailed from within. A long animal hide dries above her hearth. Its inner surface is marked with names, all scratched out but one. 'There was a winter when our children ate bark,' she says. 'Then the bell began to ring, and bread came again. We gave it only one body, each year.' Hessa refuses to tell you whose name remains. She sets the hide between you and the fire.",
      "type": "scene",
      "ending": null,
      "choices": [
        {
          "id": "midwife-0",
          "text": "Take the hide",
          "target": "hide",
          "effects": [],
          "roll": {
            "target": 3,
            "failure": "square",
            "risk": "Failure takes you down another, more dangerous path."
          }
        },
        {
          "id": "midwife-1",
          "text": "Make the reeve answer for the bargain",
          "target": "reeve",
          "effects": []
        }
      ],
      "background": "Forest",
      "portrait": "Traveller",
      "art": "hollow-bell-village.svg",
      "music": "Dungeon",
      "motion": "Wind"
    },
    {
      "id": "crypt",
      "title": "The Book of Kindly Names",
      "text": "Under the altar is a dry crypt and a ledger bound in calfskin. Beside each winter's deaths appears a second name, written in the same neat hand: not the dead, but the 'kindly chosen.' The entries go back to the famine. Scratches score the earth beneath the final page. Someone has dug downward with human fingernails. The most recent name has been blacked out with soot.",
      "type": "scene",
      "ending": null,
      "choices": [
        {
          "id": "crypt-0",
          "text": "Read the ledger aloud in the village",
          "target": "truth",
          "effects": []
        },
        {
          "id": "crypt-1",
          "text": "Follow the scratches into the earth",
          "target": "hollow",
          "effects": [],
          "roll": {
            "target": 4,
            "failure": "wood",
            "risk": "Failure takes you down another, more dangerous path."
          }
        }
      ],
      "background": "Forest",
      "portrait": "Traveller",
      "art": "hollow-bell-crypt.svg",
      "music": "Dungeon",
      "motion": "Mist"
    },
    {
      "id": "reeve",
      "title": "A Good Winter",
      "text": "The reeve says Dunmire has buried no child from hunger in thirteen years. 'Would you take that from us?' In the light you see bruises about his wrists, as if he has held something fast while others tied it. He offers you a place with the men who will go into the wood before dawn. 'We hunt the thing, not the person,' he says. But his voice fails on the last word.",
      "type": "scene",
      "ending": null,
      "choices": [
        {
          "id": "reeve-0",
          "text": "Demand the names of those chosen",
          "target": "truth",
          "effects": [],
          "roll": {
            "target": 4,
            "failure": "square",
            "risk": "Failure takes you down another, more dangerous path."
          }
        },
        {
          "id": "reeve-1",
          "text": "Join the night hunt",
          "target": "wood",
          "effects": []
        }
      ],
      "background": "Forest",
      "portrait": "Traveller",
      "art": "hollow-bell-village.svg",
      "music": "Dungeon",
      "motion": "Wind"
    },
    {
      "id": "wood",
      "title": "Between the Black Trees",
      "text": "The hunters carry horn lanterns, never torches. In a hollow among bare oaks, the creature crouches over a still pool. Bristles rise from its bent back; beneath them a human hand gently turns a small mitten inside out to dry it. It lifts its face. You hear the bell from somewhere inside its throat. Behind you the hunters loose their hounds. The creature looks not at the dogs but at you.",
      "type": "scene",
      "ending": null,
      "choices": [
        {
          "id": "wood-0",
          "text": "Hold the hounds back and follow it",
          "target": "hollow",
          "effects": [],
          "roll": {
            "target": 4,
            "failure": "square",
            "risk": "Failure takes you down another, more dangerous path."
          }
        },
        {
          "id": "wood-1",
          "text": "Drive it toward the village",
          "target": "square",
          "effects": []
        }
      ],
      "background": "Forest",
      "portrait": "Wolf",
      "art": "hollow-bell-forest.svg",
      "music": "Dungeon",
      "motion": "Snow"
    },
    {
      "id": "hide",
      "title": "The Skin on the Hearth",
      "text": "The hide is neither wet nor dry. It contracts against your hands like the lungs of a sleeping creature. In its lining you find a strip of parchment: WHEN THE BELL SPEAKS, ONE MUST ANSWER. Hessa watches you read it. 'There was no bite,' she whispers. 'No moon had any part in this. We chose, and we called it a curse so that we might sleep.'",
      "type": "scene",
      "ending": null,
      "choices": [
        {
          "id": "hide-0",
          "text": "Put the hide over your shoulders",
          "target": "bearer",
          "effects": [],
          "roll": {
            "target": 4,
            "failure": "mob",
            "risk": "Failure takes you down another, more dangerous path."
          }
        },
        {
          "id": "hide-1",
          "text": "Throw it into the fire and warn the village",
          "target": "square",
          "effects": []
        }
      ],
      "background": "Forest",
      "portrait": "Traveller",
      "art": "hollow-bell-forest.svg",
      "music": "Dungeon",
      "motion": "Wind"
    },
    {
      "id": "truth",
      "title": "The Kindly Chosen",
      "text": "The ledger is a list of votes. Each winter the families of Dunmire wrote down one neighbour's name. That person was taken beneath the chapel, clothed in the hide, and sent out to carry every hunger the village feared to feel. At spring's first thaw the hunters brought them home dead. The last name is not written in soot. It is hidden under soot. You rub it away and recognize Hessa's daughter, who went missing in the autumn.",
      "type": "scene",
      "ending": null,
      "choices": [
        {
          "id": "truth-0",
          "text": "Find Hessa's daughter beneath the chapel",
          "target": "hollow",
          "effects": [],
          "roll": {
            "target": 3,
            "failure": "square",
            "risk": "Failure takes you down another, more dangerous path."
          }
        },
        {
          "id": "truth-1",
          "text": "Show the ledger to the villagers",
          "target": "square",
          "effects": []
        }
      ],
      "background": "Forest",
      "portrait": "Traveller",
      "art": "hollow-bell-village.svg",
      "music": "Dungeon",
      "motion": "Wind"
    },
    {
      "id": "hollow",
      "title": "The Bell Below the Roots",
      "text": "Beneath the chapel roots lies a bell buried mouth-down, green with age. Around it are the bones of wolves and the small bones of children from the famine. Hessa's daughter is here, half wrapped in a dark pelt, her human eyes shining through the animal shape. She scratches a word into the clay: ENOUGH. When she touches the bell, every stomach in Dunmire begins to ache. She cannot leave until someone takes the skin—or the bell is broken.",
      "type": "scene",
      "ending": null,
      "choices": [
        {
          "id": "hollow-0",
          "text": "Take the hide and her burden",
          "target": "bearer",
          "effects": [],
          "roll": {
            "target": 4,
            "failure": "mob",
            "risk": "Failure takes you down another, more dangerous path."
          }
        },
        {
          "id": "hollow-1",
          "text": "Smash the buried bell",
          "target": "breakbell",
          "effects": [],
          "roll": {
            "target": 4,
            "failure": "mob",
            "risk": "Failure takes you down another, more dangerous path."
          }
        }
      ],
      "background": "Forest",
      "portrait": "Wolf",
      "art": "hollow-bell-crypt.svg",
      "music": "Dungeon",
      "motion": "Mist"
    },
    {
      "id": "square",
      "title": "The Village Gathers",
      "text": "The whole village stands in the rain, each household carrying a piece of rope. You tell them what you found. No one denies it. From the shadows Hessa steps forward with a lantern, and the reeve says that what was done was done for children now alive. A cry comes from the wood. Their faces turn toward it together. You see, with sudden sickness, that every one of them already knows what comes next.",
      "type": "scene",
      "ending": null,
      "choices": [
        {
          "id": "square-0",
          "text": "Stand between the hunters and the creature",
          "target": "mob",
          "effects": []
        },
        {
          "id": "square-1",
          "text": "Step aside and let the hunt begin",
          "target": "quietwinter",
          "effects": []
        }
      ],
      "background": "Forest",
      "portrait": "Traveller",
      "art": "hollow-bell-village.svg",
      "music": "Dungeon",
      "motion": "Wind"
    },
    {
      "id": "bearer",
      "title": "The New Skin",
      "text": "The hide settles across your back with the weight of a winter sky. Your teeth ache. You hear every empty cupboard in Dunmire, every child's restless sleep, every prayer spoken for another family's misfortune. In the hollow, Hessa's daughter becomes a woman again. She runs toward the first grey of dawn. You turn away from her, toward the trees. Beneath the earth the bell is silent. It will stay silent while you remember why you entered the wood.",
      "type": "ending",
      "ending": "victory",
      "choices": [],
      "background": "Forest",
      "portrait": "Traveller",
      "art": "hollow-bell-forest.svg",
      "music": "Dungeon",
      "motion": "Wind"
    },
    {
      "id": "breakbell",
      "title": "No Bell in Winter",
      "text": "The bell splits with a noise like ice breaking over deep water. Across Dunmire, shutters open. The creature's limbs loosen; a young woman crawls clear of the hide. Nothing else happens. No curse climbs out. No blessing takes its place. By morning the granaries are as bare as before the first bargain, and the village must face a winter without a victim. Some call you their saviour. Others have begun to sharpen their knives. The hunger is theirs again.",
      "type": "ending",
      "ending": "victory",
      "choices": [],
      "background": "Forest",
      "portrait": "Traveller",
      "art": "hollow-bell-crypt.svg",
      "music": "Dungeon",
      "motion": "Wind"
    },
    {
      "id": "mob",
      "title": "The Kindly People",
      "text": "You raise your hands. The first stone catches your shoulder; the second strikes your mouth. The villagers whisper apologies as they pull you down. When the creature reaches the square, it stops beside you and touches your torn sleeve with its human hand. The reeve commands the men to kill it. A third toll rises from beneath the chapel. By spring, they will tell the children that two monsters came to Dunmire that night.",
      "type": "ending",
      "ending": "death",
      "choices": [],
      "background": "Forest",
      "portrait": "Traveller",
      "art": "hollow-bell-forest.svg",
      "music": "Dungeon",
      "motion": "Wind"
    },
    {
      "id": "quietwinter",
      "title": "Bread Enough",
      "text": "They bring the creature down in the mud. For one breath its face is only that of a frightened young woman. Then the hide closes over her and there is nothing human left for the villagers to see. At dawn the reeve declares a feast. The ovens burn all day. Hessa does not attend. When next winter comes, a fresh line appears in the ledger. Someone writes another name. The bell rings only once.",
      "type": "ending",
      "ending": "defeat",
      "choices": [],
      "background": "Forest",
      "portrait": "Traveller",
      "art": "hollow-bell-village.svg",
      "music": "Dungeon",
      "motion": "Wind"
    }
  ],
  "heroPersonality": "Cautious and steadfast",
  "heroGoal": "Discover what the bell demands and decide whether to break Dunmire's bargain",
  "portrait": "Traveller",
  "background": "Forest"
});
