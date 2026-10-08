# Quorum

**One decision. Seven minds.**

*Quorum*: the minimum number of members a group needs before its decision counts. Here, seven minds make the quorum.

Quorum is a [Claude Code](https://claude.com/claude-code) skill for hard decisions. It frames your question as a clear decision, sends it to seven **separate** personality sub-agents (each on its own model, with its own decision method and voice), collects an up or down vote from each, and hands you the score, a clear **YES / NO** and next steps.

## The council

| | Member | Merged traits | Decision method | Model | Voice |
|---|---|---|---|---|---|
| ⚓ | Anchor | 😇 Angel, 💪 Willpower, 📋 Discipline | Values and commitment test | Opus | Wise elder, drill sergeant (Quo animo?, Pacta sunt servanda, Festina lente) |
| 🌅 | Dawn | 🌈 Hope, 🤑 Greed, 😄 Joy, 🌱 Life | Upside and opportunity cost | Sonnet | Gen Z hype coach (no cap, W, lock in, ¡vamos!) |
| 🫶 | Kindred | 🥰 Love, 🤗 Compassion, 🥺 Sensitivity, 🥳 Social | Stakeholder impact | Sonnet | Loving, many languages (jaan, habibi, cariño, canım, aigoo) |
| 🔥 | Pyre | 🤬 Anger, 🤢 Disgust, 💀 Death, 😢 Grief | What must end | Sonnet | Furious, then grim (nah fam, cooked, khalas) |
| 🌑 | Shadow | 😰 Fear, 🙅 Negative, 😈 Devil | Pre-mortem and reversibility | Opus | Sarcastic villain (red flag 🚩, cope, *psst*) |
| 🧭 | Wanderer | 🧐 Curiosity, 🧳 Outsider | Outside view and third options | Sonnet | Polite, well-travelled nerd (forgive me, tiens!, ¿y si...?) |
| 🦴 | Grug | 🤪 Naive, 🍖 Caveman | The one obvious thing | Haiku | Grunts and barks (*burf*, *woof*, *meow*) |

The harsh voices roast the situation, never you or anyone's identity: no slurs, no threats, no sexual terms, no religious profanity. Add `--clean` to keep the voices without the swearing. If a decision involves self-harm, harming someone or immediate danger, the council is not convened; Claude answers plainly and points to crisis resources.

## How a vote works

Each member votes **+1** (up) or **-1** (down) and says what would flip its vote. The votes are summed:

| Member | Says | Vote |
|---|---|---|
| ⚓ Anchor | "Peace, friend. Festina lente. First, spike. Second, measure. Third, decide." | 🟢 +1 |
| 🌑 Shadow | "Nope 🙄 rewrites kill products. Red flag 🚩" | 🔴 -1 |
| ... | | |
| **Score** | **4 up, 3 down** | **+1** |

**Result: ✅ YES** Rewrite, but only after a two-week spike on the two worst screens.

A score above 0 is YES, below 0 is NO, and 0 is a TIE that's broken toward the more reversible option. For "A or B?" questions, every member votes on each option and the highest score wins.

## Install

One line. Run it again any time to update.

macOS / Linux:

```bash
curl -fsSL https://mhfrough.github.io/quorum/install.sh | sh
```

Windows (PowerShell):

```powershell
irm https://mhfrough.github.io/quorum/install.ps1 | iex
```

<details>
<summary>Or install by hand</summary>

macOS / Linux:

```bash
git clone https://github.com/mhfrough/quorum.git
mkdir -p ~/.claude/skills
cp -r quorum/skills/quorum ~/.claude/skills/
```

Windows (PowerShell):

```powershell
git clone https://github.com/mhfrough/quorum.git
New-Item -ItemType Directory -Force "$HOME\.claude\skills" | Out-Null
Copy-Item -Recurse quorum\skills\quorum "$HOME\.claude\skills\"
```

</details>

Restart Claude Code, then run:

```
/quorum "Should I take the offer?"
```

## Flags

| Flag | Effect |
|---|---|
| *(none)* | The full council, all seven members |
| `--lite` | Three members: Anchor, Dawn, Shadow (values, upside, risk). Under half the cost, and never a tie |
| `--only a,b` | Just these members. Names or traits work: `--only angel,devil` runs Anchor and Shadow |
| `--skip a,b` | Leave members out |
| `--clean` | Same voices, no swearing (safe for work). Turns on by itself for grief, illness, mental health, abuse or a family crisis |

## Files

```
skills/quorum/
  SKILL.md     how the orchestrator frames the decision, runs the vote and writes the report
  council.md   the seven members: method, model, voice, lexicon, merged traits, tensions
index.html     the project page (GitHub Pages)
tests/         Playwright tests for the page
```

## Testing the page

```bash
npm install
npx playwright test
```

## Notes

- Quorum runs only when you call it: `/quorum`, or ask for the Quorum by name. A full council starts seven sub-agents, so it won't fire on ordinary "should I...?" questions. Claude may offer it in one line when a decision looks weighty.
- The Quorum only advises. Nothing gets edited, sent, or changed until you confirm.
- 🌑 Shadow describes risks, temptations and abuse paths so you can guard against them. It never gives step-by-step instructions for causing harm.

Made by Mohammad Hamza ([@mhfrough](https://github.com/mhfrough)). If Quorum helped you decide something, a star on the repo is appreciated.

An independent community skill. Not affiliated with Anthropic.

## License

MIT, see [LICENSE](LICENSE). Bundled third-party files keep their own licenses: three.js and Phosphor Icons (MIT), Geist fonts (SIL OFL 1.1).
