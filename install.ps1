# Installs the Quorum skill for Claude Code into ~\.claude\skills\quorum
#   irm https://mhfrough.github.io/quorum/install.ps1 | iex
# Running it again updates the skill to the latest version.
$ErrorActionPreference = 'Stop'
# Windows PowerShell 5.1 may default to old TLS versions that GitHub refuses
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

$src = 'https://raw.githubusercontent.com/mhfrough/quorum/main/skills/quorum'
$dir = Join-Path $HOME '.claude\skills\quorum'

New-Item -ItemType Directory -Force $dir | Out-Null
# Keep this list in sync with the files in skills/quorum/
foreach ($f in 'SKILL.md', 'council.md') {
  Invoke-WebRequest -UseBasicParsing "$src/$f" -OutFile (Join-Path $dir $f)
}

Write-Host "Quorum installed to $dir"
Write-Host "Restart Claude Code, then type /quorum followed by your question."
