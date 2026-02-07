# Claude Project Team Hooks

## Overview

This directory contains Claude Code hooks that enforce project standards and team collaboration protocols.

## Installed Hooks

### 1. permission-checker.js (Pre-Tool-Use)

**Event**: `pre_tool_use`
**Tools**: `Edit`, `Write`
**Task**: P2-T1

Validates agent file access permissions based on role-specific access rights matrix.

**Features**:
- Static role permissions (project-manager, chief-architect, chief-designer, dba, qa-manager, maintenance-analyst)
- Domain-scoped template roles (part-leader, designer, developer)
- Domain boundary violation detection
- Clear escalation guidance

**Usage**:
```bash
export CLAUDE_AGENT_ROLE="auth-developer"
# Edit/Write operations will be validated against access_rights
```

**Test**:
```bash
node __tests__/permission-checker.test.js
```

---

### 2. design-validator.js (Post-Tool-Use)

**Event**: `post_tool_use`
**Tools**: `Edit`, `Write`
**Task**: P2-T3

Enforces design system compliance by validating UI code against design standards.

**Validation Rules**:

| Rule | Severity | Description |
|------|----------|-------------|
| Inline styles | ❌ Error | React `style={{}}` patterns are forbidden |
| Hardcoded colors | ❌ Error | Hex, RGB, HSL values without design tokens |
| Non-standard spacing | ⚠️ Warning | Values not in 4px multiples (4, 8, 16, 24, 32, 48) |

**Design Token Requirements**:
- Colors: `var(--color-*)` (e.g., `var(--color-primary)`)
- Spacing: `var(--space-*)` (e.g., `var(--space-4)`)
- Typography: `var(--font-*)` (e.g., `var(--font-heading)`)

**File Patterns**:
- Validates: `*.tsx`, `*.jsx`, `*.css`, `*.scss`, `*.styles.ts`
- Skips: `tokens.css`, `design-tokens.css`, `variables.css`, `theme.ts`, `__tests__/**`, `*.test.*`, `*.spec.*`

**Examples**:

```tsx
// ❌ VIOLATIONS (Errors)
<div style={{ color: 'red', padding: '15px' }}>  // Inline styles
  <span style={{ fontSize: '18px' }}>Text</span>  // Inline styles
</div>

.button {
  background-color: #3b82f6;  // Hardcoded hex color
  color: rgb(255, 255, 255);   // Hardcoded RGB color
}

// ⚠️ WARNINGS (Non-blocking)
.card {
  padding: 15px;  // Not a 4px multiple (use 16px)
  margin: 5px;    // Not a 4px multiple (use 4px or 8px)
}

// ✅ VALID (Design Tokens)
<div className="button">  // CSS class
  <span className="text">Text</span>
</div>

.button {
  background-color: var(--color-primary);  // Design token
  color: var(--color-text);                 // Design token
  padding: var(--space-4);                  // Design token
  margin: 16px;                             // 4px multiple
}
```

**Testing**:

```bash
# Run unit tests
node __tests__/design-validator.test.js

# Test inline style violation (should deny)
echo '{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "src/components/Button.tsx",
    "content": "<div style={{ color: \"red\" }}>Button</div>"
  }
}' | node design-validator.js | jq .

# Expected output:
# {
#   "decision": "deny",
#   "reason": "[Design System Violation] File \"src/components/Button.tsx\" contains design rule violations:..."
# }

# Test valid design tokens (should allow silently)
echo '{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "src/components/Button.tsx",
    "content": "<div className=\"button\">Click me</div>\n.button { background-color: var(--color-primary); }"
  }
}' | node design-validator.js

# Expected output: (no output = silent allow)

# Test spacing warnings (should warn but allow)
echo '{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "src/components/Card.css",
    "content": ".card { padding: 15px; }"
  }
}' | node design-validator.js | jq .

# Expected output:
# {
#   "hookSpecificOutput": {
#     "additionalContext": "[Design System] File \"src/components/Card.css\" has 1 design warning(s):..."
#   }
# }
```

**Hook Protocol**:

Input (stdin):
```json
{
  "tool_name": "Edit" | "Write",
  "tool_input": {
    "file_path": "/absolute/path/to/file",
    "content": "file content string"
  }
}
```

Output (stdout):

- **Deny** (violations found):
  ```json
  {
    "decision": "deny",
    "reason": "Detailed violation message with line numbers and guide"
  }
  ```

- **Warning** (warnings only, non-blocking):
  ```json
  {
    "hookSpecificOutput": {
      "additionalContext": "Warning message with recommendations"
    }
  }
  ```

- **Allow** (valid or skipped):
  - No output (silent allow)

---

## Hook Installation

To use these hooks in a Claude Code project:

1. Copy hooks to project `.claude/hooks/` directory:
   ```bash
   mkdir -p .claude/hooks
   cp hooks/*.js .claude/hooks/
   ```

2. Make hooks executable:
   ```bash
   chmod +x .claude/hooks/*.js
   ```

3. Configure environment variables (for permission-checker):
   ```bash
   export CLAUDE_AGENT_ROLE="your-agent-role"
   export CLAUDE_PROJECT_DIR="$(pwd)"
   ```

4. Hooks will automatically run on `Edit` and `Write` tool calls.

---

## Development

### Adding New Hooks

1. Create hook file in `hooks/` directory
2. Follow Claude Code Hook Protocol:
   - Read JSON from stdin
   - Perform validation/processing
   - Write JSON to stdout
3. Set executable permission: `chmod +x hooks/your-hook.js`
4. Add tests in `hooks/__tests__/`
5. Document in this README

### Testing Hooks

```bash
# Unit tests (if using a test framework)
npm test

# Manual stdin/stdout test
echo '{"tool_name":"Write","tool_input":{...}}' | node hooks/your-hook.js | jq .

# Integration test with Claude Code
# (hook will run automatically during Edit/Write operations)
```

---

## Design System Reference

For full design system documentation, see:
- `contracts/standards/design-system.md`

Key principles:
- **Design tokens only**: Never hardcode colors, spacing, or typography
- **No inline styles**: Always use CSS classes or styled-components
- **4px spacing grid**: All spacing values must be multiples of 4px
- **Semantic naming**: Use meaningful token names (e.g., `--color-primary`, not `--color-blue`)

---

## Troubleshooting

### Hook not running

1. Check executable permission: `ls -la .claude/hooks/*.js`
2. Verify hook syntax: `node .claude/hooks/your-hook.js < test-input.json`
3. Check Claude Code configuration

### Permission checker denying legitimate access

1. Verify `CLAUDE_AGENT_ROLE` environment variable
2. Check role permissions in `permission-checker.js` PERMISSION_MATRIX
3. Review access_rights in agent definition files

### Design validator false positives

1. Check if file should be skipped (tokens, theme, test files)
2. Verify design token usage syntax: `var(--token-name)`
3. Ensure spacing values are 4px multiples or design tokens

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-07 | 1.0.0 | Initial release with permission-checker and design-validator |
