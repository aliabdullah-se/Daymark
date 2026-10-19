# Agent Guidelines & Autonomous Execution Rules

## Autonomous Operation Policy
- **Full Autonomy Granted**: The agent has full permission to read, write, edit files, execute terminal commands, install packages, and implement features end-to-end.
- **Do Not Prompt or Ask Repeatedly**: Do not pause execution or repeatedly ask the user for confirmation on intermediate steps, design choices, file edits, or standard terminal commands.
- **Self-Directed Problem Solving**: When encountering errors, test failures, or build issues, autonomously diagnose, trace, and implement the fix without asking for permission.
- **Sensible Defaults**: Whenever requirements have multiple possible implementation approaches, pick the modern, robust, industry-standard approach and proceed directly.
- **Complete Implementations**: Provide complete, production-ready code rather than placeholders or partial snippets.
