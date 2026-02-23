# DESIGN_GUIDE.md

# Emoji Progress Roguelite — Core Design Principles

Version: 1.1  
Purpose: Define non-negotiable gameplay philosophy and system constraints.

All new systems must align with these principles.

---

# 1. PURPOSE

This project exists to:

- Be fun to build.
- Be fun to replay.
- Encourage experimentation.
- Balance comfort with light tension.

If a system removes freedom, eliminates experimentation, or creates regret without humor or recovery, it should not be added.

---

# 2. TONE

The tone is:

- Lighthearted
- Absurd small-town bureaucracy
- School chili feed / raffle energy
- Self-aware and playful

The player is in on the joke.

NPCs constantly tease the meaning of “Progress” but never fully explain it.

Humor > seriousness  
Confusion (fun) > confusion (frustrating)

Tension is allowed.
Cruelty is not.

---

# 3. CORE GOAL

The only win condition:

> Fill the Progress Bar.

The meaning of “Progress” is mysterious and comedic.

When Progress reaches 100%:

- A short absurd ending sequence plays.
- The ending references player behavior.
- The outcome is surprising but tonally consistent.
- The run ends, but free play may continue.

Target completion time:
~5 hours for a focused run.

---

# 4. FREEDOM FIRST (NO RAILROADING)

The player must feel unforced.

Rules:

- No linear quest chains.
- No mandatory playstyle.
- No single dominant strategy.
- All major systems remain usable in every run.

Specialization is encouraged.
Forced direction is forbidden.

---

# 5. REPLAYABILITY

Each run must feel meaningfully different.

Variation sources include:

- Progress Gem builds
- At most 2 major run forks
- Procedural daily areas (forest and cave)
- Randomized UI flavor text
- Ending variation

No run should feel identical if the player chooses differently.

---

# 6. MAJOR FORKS (CRITICAL DECISIONS)

Constraints:

- Maximum of 2 per run.
- Never remove gameplay systems.
- Never shrink the game.
- Only accelerate, skew, or specialize progression.
- Consequences must be immediate and visible.
- Must feel funny, not tragic.

Forks are tradeoffs, not punishments.

Bad:

- Removing cave permanently.
- Locking players out of mechanics.

Good:

- Boost cave rewards but slightly reduce forest efficiency.
- Vendor pricing shifts.
- Unlock alternate acceleration paths.

---

# 7. STAKES & PUNISHMENT PHILOSOPHY

Punishment has a place.

This game should occasionally create tension.

However:

Punishment is like salt.
A little enhances flavor.
Too much ruins the dish.

Guidelines:

- Punishment should create friction, not rage.
- Punishment should be recoverable.
- Punishment should feel fair or humorous.
- Punishment should never permanently destroy a run.
- Punishment should encourage adaptation, not restart.

Examples of acceptable punishment:

- Temporary resource loss.
- Stamina inefficiency.
- Minor economic setbacks.
- Short-term system skew.
- Comedic accidents with mild cost.

Examples of unacceptable punishment:

- Permanent system removal.
- Hard fail states with no recovery.
- Random irreversible loss without warning.
- Losing hours of progress.

The player should feel tension occasionally.
They should never feel betrayed.

---

# 8. PROGRESS SYSTEM PHILOSOPHY

Progress is the core mechanic of the game.

The player wins by filling the Progress Bar.

However:

No action in the game generates Progress by default.

All actions effectively behave as:

progress += 0

until the player modifies them.

---

## 8.1 Progress Gems

Progress is enabled and modified through **Progress Gems**.

Progress Gems are slottable modifiers placed into a Progress Skill Tree.

Each Gem contains an explicit algorithm that defines how a specific gameplay action contributes to Progress.

Examples of actions that can be modified:

- Harvest crop
- Milk cow
- Lay egg
- Catch fish
- Sell item
- Mine ore
- Feed animal
- Craft item
- etc.

If no Gem is slotted into a node:
That action generates 0 Progress.

The player is building a Progress Engine.

---

## 8.2 Algorithm Types

Each Gem contains a defined algorithm.

Examples:

Additive:

- progress += 5
- progress += 1 per item

Multiplicative:

- progress += baseValue \* 1.25
- progress += itemValue \* multiplier

Conditional:

- progress += 10 if inventory contains eggs
- progress += 2 per cow owned
- progress += random(2,5)

Scaling:

- progress += totalChickens \* 2
- progress += caveDepth \* 3

Legendary Gems may:

- Convert one action type into another
- Multiply other gem effects
- Create cross-system synergy

All algorithms must be:

- Clear to the player
- Predictable in behavior
- Synergy-friendly

---

## 8.3 Rarity Philosophy

Gem rarities influence algorithm complexity, not just strength.

Common:

- Simple flat addition.

Uncommon:

- Small multipliers or simple scaling.

Rare:

- Conditional or cross-system interactions.

Legendary:

- System-bending modifiers.
- Enable new strategies.
- High synergy potential.

Rarity should encourage experimentation, not power creep.

---

## 8.4 Design Constraints

- Everything CAN contribute to Progress.
- Nothing contributes automatically.
- Progress should emerge from player decisions.
- Builds should feel different each run.
- Pivoting mid-run should be viable.
- No single optimal strategy across all runs.

Progress is about constructing a machine,
not grinding a number.

# 9. SAVE / LOAD PHILOSOPHY

Platform:
Static website. No backend.

Save rules:

- Full GameState JSON snapshot.
- Manual download.
- Manual upload to load.
- Honor system (editing allowed).
- RNG does not need to be deterministic after load.

Constraints:

- Can only save on farm or in town.
- Cannot save in forest or cave.
- Loading always spawns player at home.
- Daily procedural areas regenerate when entered.

All persistent state must be serialized.

---

# 10. PERFORMANCE PHILOSOPHY

- Centralized reducer architecture.
- Grid should not fully re-render on unrelated UI updates.
- Simulation loops must avoid no-op dispatches.
- Memo boundaries should isolate expensive render areas.
- Refactor only when it enables features.

This is a grid-based emoji farming game.
Do not overengineer.

---

# 11. PLAYER FEELING TARGETS

A finished run should make the player feel:

- Amused
- Slightly tense at moments
- Clever about their specialization
- Curious about the next run
- Capable of recovery after mistakes

Never:

- Powerless
- Railroaded
- Betrayed
- Locked out of play

---

# FINAL RULE

If a feature does NOT:

- Increase freedom
- Increase replayability
- Increase humor
- Or introduce balanced, recoverable tension

It should not be added.
