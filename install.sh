#!/bin/sh
# Installs the Quorum skill for Claude Code into ~/.claude/skills/quorum
#   curl -fsSL https://mhfrough.github.io/quorum/install.sh | sh
# Running it again updates the skill to the latest version.
set -e

SRC="https://raw.githubusercontent.com/mhfrough/quorum/main/skills/quorum"
DIR="$HOME/.claude/skills/quorum"

mkdir -p "$DIR"
# Keep this list in sync with the files in skills/quorum/
for f in SKILL.md council.md; do
  curl -fsSL "$SRC/$f" -o "$DIR/$f"
done

echo "Quorum installed to $DIR"
echo "Restart Claude Code, then type /quorum followed by your question."
