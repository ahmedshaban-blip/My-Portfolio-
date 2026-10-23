# Issue Tracker

This repo uses **GitHub Issues** for tracking work.

- **CLI**: `gh` (GitHub CLI)
- **Workflow**: Standard GitHub Issues flow — create, comment, label, close
- **PRs as request surface**: Off (default for GitHub template)

The five canonical triage labels (since the `triage` skill is not installed):
- `needs-triage`
- `needs-info`
- `ready-for-agent`
- `ready-for-human`
- `wontfix`

To create an issue from the command line:
```bash
gh issue create --title "your title" --body "your description"
```

To label an issue:
```bash
gh issue edit <issue-number> --label <label-name>
```