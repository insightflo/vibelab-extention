#!/usr/bin/env node
/**
 * PreToolUse[Edit|Write] Hook: Permission Checker
 *
 * Validates agent file access permissions based on role-specific
 * access_rights matrix. Blocks unauthorized writes and provides
 * clear guidance on proper escalation paths.
 *
 * @TASK P2-T1 - Agent Permission Checker Hook
 * @SPEC claude-project-team/agents/*.md (access_rights sections)
 *
 * Claude Code Hook Protocol:
 *   - stdin: JSON { tool_name, tool_input: { file_path, ... } }
 *   - stdout: JSON { decision: "allow"|"deny", reason?: string }
 *             or { hookSpecificOutput: { additionalContext: string } }
 *
 * Agent Detection:
 *   The current agent role is detected from environment variable
 *   CLAUDE_AGENT_ROLE (set by the orchestration layer) or from
 *   the session context. If undetectable, the hook issues a warning
 *   instead of blocking.
 */

const path = require('path');

// ---------------------------------------------------------------------------
// 1. Permission Matrix
//    Derived from agents/*.md access_rights YAML blocks.
//    Patterns use minimatch-style globs (implemented with simple matching).
// ---------------------------------------------------------------------------

const PERMISSION_MATRIX = {
  'project-manager': {
    read: ['**/*'],
    write: [
      'management/requests/to-*/**',
      'management/meetings/**',
      'management/decisions/**'
    ],
    cannot: [
      'src/**',            // No direct code modification
      'contracts/standards/**', // Chief Architect's domain
      'design/**',         // Chief Designer's domain
      'database/**',       // DBA's domain
      'qa/**'              // QA Manager's domain
    ],
    escalation: {
      'src/**': 'Domain Part Leader/Developer',
      'contracts/standards/**': 'Chief Architect',
      'design/**': 'Chief Designer',
      'database/**': 'DBA'
    }
  },

  'chief-architect': {
    read: ['**/*'],
    write: [
      'contracts/standards/**',
      'management/decisions/**'
    ],
    veto: [
      'architecture-violation',
      'tech-standard-violation',
      'security-vulnerability'
    ],
    cannot: [
      'src/**',            // No direct code implementation
      'design/**',         // Chief Designer's domain
      'database/schema/**' // DBA's domain (schema files)
    ],
    escalation: {
      'src/**': 'Domain Developer',
      'design/**': 'Chief Designer',
      'database/schema/**': 'DBA'
    }
  },

  'chief-designer': {
    read: ['**/*'],
    write: [
      'contracts/standards/design-system.md',
      'design/**'
    ],
    veto: [
      'design-guide-violation',
      'inconsistent-ui'
    ],
    cannot: [
      'src/**',
      'contracts/standards/coding-standards.md',
      'contracts/standards/api-standards.md',
      'contracts/standards/database-standards.md',
      'database/**'
    ],
    escalation: {
      'src/**': 'Domain Developer',
      'contracts/standards/coding-standards.md': 'Chief Architect',
      'database/**': 'DBA'
    }
  },

  'dba': {
    read: ['**/*'],
    write: [
      'contracts/standards/database-standards.md',
      'database/schema/**',
      'database/**'
    ],
    veto: [
      'data-standard-violation',
      'dangerous-migration',
      'performance-issue-schema'
    ],
    cannot: [
      'src/**/services/**',
      'src/**/routes/**',
      'design/**'
    ],
    escalation: {
      'src/**': 'Domain Developer',
      'design/**': 'Chief Designer'
    }
  },

  'qa-manager': {
    read: ['**/*'],
    write: [
      'qa/**',
      'management/responses/from-qa/**'
    ],
    veto: [
      'quality-gate-fail',
      'coverage-insufficient',
      'critical-bug-exists'
    ],
    cannot: [
      'src/**',
      'contracts/standards/**',
      'design/**',
      'database/schema/**'
    ],
    escalation: {
      'src/**': 'Domain Developer (via bug report)',
      'contracts/standards/**': 'Chief Architect',
      'design/**': 'Chief Designer'
    }
  },

  'maintenance-analyst': {
    read: ['**/*'],
    write: [
      'docs/architecture/**',
      'docs/changelog/**',
      'docs/dependencies/**',
      '.claude/architecture/**',
      '.claude/changelog/**',
      '.claude/risk-areas.yaml'
    ],
    cannot: [
      'src/**',
      'contracts/**',
      'design/**',
      'database/schema/**'
    ],
    escalation: {
      'src/**': 'Domain Developer',
      'contracts/**': 'Chief Architect',
      'design/**': 'Chief Designer'
    }
  },

  // Template-based roles: Part Leader, Domain Designer, Domain Developer
  // These are identified by pattern: "{domain}-part-leader", "{domain}-designer", "{domain}-developer"
};

// ---------------------------------------------------------------------------
// 2. Template Role Generators
//    For domain-scoped agents, we generate permissions dynamically.
// ---------------------------------------------------------------------------

/**
 * Generate permissions for a Part Leader of a specific domain.
 * @param {string} domain - The domain name (e.g., "auth", "payment")
 * @returns {object} Permission configuration
 */
function generatePartLeaderPermissions(domain) {
  return {
    read: [
      '**/*',
      `contracts/interfaces/**`,
      `management/requests/to-${domain}/**`
    ],
    write: [
      `src/domains/${domain}/**`,
      'management/requests/to-*/**',
      `contracts/interfaces/${domain}-api.yaml`,
      `management/responses/from-${domain}/**`
    ],
    cannot: [
      // Other domains' code
      'src/domains/!(' + domain + ')/**',
      'contracts/standards/**',
      'design/**/!(' + domain + ')/**'
    ],
    escalation: {
      'contracts/standards/**': 'Chief Architect',
      'design/**': 'Chief Designer',
      'database/schema/**': 'DBA'
    },
    _domain: domain
  };
}

/**
 * Generate permissions for a Domain Designer.
 * @param {string} domain - The domain name
 * @returns {object} Permission configuration
 */
function generateDomainDesignerPermissions(domain) {
  return {
    read: [
      'contracts/standards/design-system.md',
      'design/**',
      `src/domains/${domain}/**`,
      `contracts/interfaces/${domain}-components.yaml`
    ],
    write: [
      `design/${domain}/**`,
      `contracts/interfaces/${domain}-components.yaml`
    ],
    cannot: [
      'contracts/standards/design-system.md',
      'src/**',
      'database/**'
    ],
    escalation: {
      'contracts/standards/design-system.md': 'Chief Designer',
      'src/**': 'Domain Developer',
      'database/**': 'DBA'
    },
    _domain: domain
  };
}

/**
 * Generate permissions for a Domain Developer.
 * @param {string} domain - The domain name
 * @returns {object} Permission configuration
 */
function generateDomainDeveloperPermissions(domain) {
  return {
    read: [
      `src/domains/${domain}/**`,
      'contracts/standards/**',
      `contracts/interfaces/${domain}-api.yaml`,
      `contracts/interfaces/${domain}-components.yaml`,
      `design/${domain}/**`
    ],
    write: [
      `src/domains/${domain}/**`,
      `tests/${domain}/**`
    ],
    cannot: [
      'contracts/standards/**',
      'design/**',
      'database/schema/**'
    ],
    escalation: {
      'contracts/standards/**': 'Chief Architect',
      'design/**': 'Domain Designer / Chief Designer',
      'database/schema/**': 'DBA'
    },
    _domain: domain
  };
}

// ---------------------------------------------------------------------------
// 3. Path Matching Utilities
// ---------------------------------------------------------------------------

/**
 * Convert a simplified glob pattern to a RegExp.
 * Supports: ** (any depth), * (single segment), specific filenames.
 *
 * @param {string} pattern - Glob-like pattern
 * @returns {RegExp}
 */
function globToRegex(pattern) {
  // Escape regex special characters except * and /
  let regex = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    // Handle ** (match anything including /)
    .replace(/\*\*/g, '<<DOUBLESTAR>>')
    // Handle * (match anything except /)
    .replace(/\*/g, '[^/]*')
    // Restore **
    .replace(/<<DOUBLESTAR>>/g, '.*');

  return new RegExp('^' + regex + '$');
}

/**
 * Check if a relative file path matches any of the given glob patterns.
 * @param {string} relativePath - The file path relative to project root
 * @param {string[]} patterns - Array of glob patterns
 * @returns {boolean}
 */
function matchesAnyPattern(relativePath, patterns) {
  if (!patterns || patterns.length === 0) return false;

  for (const pattern of patterns) {
    // Skip negation patterns in cannot (they use special syntax)
    if (pattern.includes('!(')) continue;

    const regex = globToRegex(pattern);
    if (regex.test(relativePath)) {
      return true;
    }
  }
  return false;
}

/**
 * Find the best matching escalation target for a file path.
 * @param {string} relativePath
 * @param {object} escalationMap - { pattern: "target agent" }
 * @returns {string|null}
 */
function findEscalationTarget(relativePath, escalationMap) {
  if (!escalationMap) return null;

  for (const [pattern, target] of Object.entries(escalationMap)) {
    const regex = globToRegex(pattern);
    if (regex.test(relativePath)) {
      return target;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// 4. Agent Role Detection
// ---------------------------------------------------------------------------

/**
 * Detect the current agent role from environment or context.
 *
 * Priority:
 *   1. CLAUDE_AGENT_ROLE environment variable (set by orchestrator)
 *   2. CLAUDE_AGENT_NAME environment variable (alternative)
 *   3. null (unknown - will issue warning instead of blocking)
 *
 * @returns {{ role: string|null, domain: string|null }}
 */
function detectAgentRole() {
  const agentRole = process.env.CLAUDE_AGENT_ROLE
    || process.env.CLAUDE_AGENT_NAME
    || null;

  if (!agentRole) return { role: null, domain: null };

  const roleLower = agentRole.toLowerCase().replace(/\s+/g, '-');

  // Check static roles first
  if (PERMISSION_MATRIX[roleLower]) {
    return { role: roleLower, domain: null };
  }

  // Check template-based domain roles
  // Pattern: "{domain}-part-leader", "{domain}-designer", "{domain}-developer"
  const partLeaderMatch = roleLower.match(/^(.+)-part-leader$/);
  if (partLeaderMatch) {
    return { role: 'part-leader', domain: partLeaderMatch[1] };
  }

  const designerMatch = roleLower.match(/^(.+)-designer$/);
  if (designerMatch && designerMatch[1] !== 'chief') {
    return { role: 'domain-designer', domain: designerMatch[1] };
  }

  const developerMatch = roleLower.match(/^(.+)-developer$/);
  if (developerMatch) {
    return { role: 'domain-developer', domain: developerMatch[1] };
  }

  return { role: null, domain: null };
}

/**
 * Resolve the permission configuration for a detected agent.
 * @param {string} role
 * @param {string|null} domain
 * @returns {object|null}
 */
function resolvePermissions(role, domain) {
  // Static roles
  if (PERMISSION_MATRIX[role]) {
    return PERMISSION_MATRIX[role];
  }

  // Domain-scoped template roles
  if (role === 'part-leader' && domain) {
    return generatePartLeaderPermissions(domain);
  }
  if (role === 'domain-designer' && domain) {
    return generateDomainDesignerPermissions(domain);
  }
  if (role === 'domain-developer' && domain) {
    return generateDomainDeveloperPermissions(domain);
  }

  return null;
}

// ---------------------------------------------------------------------------
// 5. Cross-Domain Boundary Detection
// ---------------------------------------------------------------------------

/**
 * Check if a file path crosses domain boundaries for domain-scoped agents.
 * @param {string} relativePath - File path relative to project root
 * @param {string} agentDomain - The agent's own domain
 * @returns {{ violation: boolean, targetDomain: string|null }}
 */
function checkDomainBoundary(relativePath, agentDomain) {
  if (!agentDomain) return { violation: false, targetDomain: null };

  // Check src/domains/{other-domain}/ pattern
  const domainMatch = relativePath.match(/^src\/domains\/([^/]+)\//);
  if (domainMatch) {
    const targetDomain = domainMatch[1];
    if (targetDomain !== agentDomain) {
      return { violation: true, targetDomain };
    }
  }

  // Check tests/{other-domain}/ pattern
  const testDomainMatch = relativePath.match(/^tests\/([^/]+)\//);
  if (testDomainMatch) {
    const targetDomain = testDomainMatch[1];
    if (targetDomain !== agentDomain) {
      return { violation: true, targetDomain };
    }
  }

  // Check design/{other-domain}/ pattern
  const designDomainMatch = relativePath.match(/^design\/([^/]+)\//);
  if (designDomainMatch) {
    const targetDomain = designDomainMatch[1];
    if (targetDomain !== agentDomain) {
      return { violation: true, targetDomain };
    }
  }

  return { violation: false, targetDomain: null };
}

// ---------------------------------------------------------------------------
// 6. Message Formatting
// ---------------------------------------------------------------------------

/**
 * Format a denial message with clear guidance.
 * @param {object} params
 * @returns {string}
 */
function formatDenialMessage({ agentRole, domain, filePath, reason, escalationTarget }) {
  const agentLabel = domain ? `${domain}-${agentRole}` : agentRole;

  let message = `[Permission Denied] Agent "${agentLabel}" cannot write to "${filePath}".`;
  message += `\n  Reason: ${reason}`;

  if (escalationTarget) {
    message += `\n  Escalation: Request this change through "${escalationTarget}".`;
  }

  return message;
}

/**
 * Format a domain boundary violation message.
 * @param {object} params
 * @returns {string}
 */
function formatBoundaryViolationMessage({ agentRole, agentDomain, targetDomain, filePath }) {
  const agentLabel = `${agentDomain}-${agentRole}`;

  let message = `[Domain Boundary Violation] Agent "${agentLabel}" cannot modify files in domain "${targetDomain}".`;
  message += `\n  File: "${filePath}"`;
  message += `\n  Your domain: "${agentDomain}"`;
  message += `\n  Target domain: "${targetDomain}"`;
  message += `\n  Escalation: Request this change through "${targetDomain}-part-leader" or use the interface request protocol.`;

  return message;
}

/**
 * Format a warning message when agent role is unknown.
 * @param {string} filePath
 * @returns {string}
 */
function formatUnknownAgentWarning(filePath) {
  return `[Permission Warning] Agent role not detected (CLAUDE_AGENT_ROLE not set). `
    + `Unable to verify write permission for "${filePath}". `
    + `Set CLAUDE_AGENT_ROLE environment variable for proper access control.`;
}

// ---------------------------------------------------------------------------
// 7. Core Permission Check Logic
// ---------------------------------------------------------------------------

/**
 * Validate whether the current agent has write permission to the target file.
 *
 * @param {string} role - Agent role identifier
 * @param {string|null} domain - Agent's domain (for domain-scoped roles)
 * @param {string} relativePath - File path relative to project root
 * @returns {{ allowed: boolean, reason?: string, escalation?: string, type?: string }}
 */
function checkPermission(role, domain, relativePath) {
  const permissions = resolvePermissions(role, domain);
  if (!permissions) {
    return {
      allowed: false,
      reason: `Unknown role "${role}" has no defined permissions.`,
      type: 'unknown-role'
    };
  }

  // 1. Check domain boundary violations (highest priority for domain-scoped agents)
  if (domain) {
    const boundary = checkDomainBoundary(relativePath, domain);
    if (boundary.violation) {
      return {
        allowed: false,
        reason: `Domain boundary violation: "${domain}" agent cannot modify "${boundary.targetDomain}" domain files.`,
        escalation: `${boundary.targetDomain}-part-leader`,
        type: 'domain-boundary'
      };
    }
  }

  // 2. Check explicit "cannot" rules
  if (permissions.cannot && matchesAnyPattern(relativePath, permissions.cannot)) {
    const escalation = findEscalationTarget(relativePath, permissions.escalation);
    return {
      allowed: false,
      reason: `File path "${relativePath}" is in a restricted area for role "${role}".`,
      escalation: escalation,
      type: 'restricted-area'
    };
  }

  // 3. Check if file matches allowed write patterns
  if (permissions.write && matchesAnyPattern(relativePath, permissions.write)) {
    return { allowed: true };
  }

  // 4. If not explicitly allowed, deny with escalation guidance
  const escalation = findEscalationTarget(relativePath, permissions.escalation);
  return {
    allowed: false,
    reason: `File path "${relativePath}" is not in the allowed write paths for role "${role}".`,
    escalation: escalation,
    type: 'not-in-write-paths'
  };
}

// ---------------------------------------------------------------------------
// 8. stdin/stdout Helpers (Claude Code Hook Protocol)
// ---------------------------------------------------------------------------

/**
 * Read JSON from stdin.
 * @returns {Promise<object>}
 */
function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      try {
        resolve(data.trim() ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    process.stdin.on('error', () => resolve({}));
  });
}

/**
 * Output a deny decision.
 * @param {string} reason
 */
function outputDeny(reason) {
  process.stdout.write(JSON.stringify({
    decision: 'deny',
    reason: reason
  }));
}

/**
 * Output a warning via additionalContext (does not block).
 * @param {string} context
 */
function outputWarning(context) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      additionalContext: context
    }
  }));
}

// ---------------------------------------------------------------------------
// 9. Relative Path Resolution
// ---------------------------------------------------------------------------

/**
 * Convert an absolute file path to a project-relative path.
 * Uses CLAUDE_PROJECT_DIR or attempts to detect the project root.
 *
 * @param {string} filePath - Absolute or relative file path
 * @returns {string} Project-relative path
 */
function toRelativePath(filePath) {
  if (!filePath) return '';

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

  // If already relative, return as-is
  if (!path.isAbsolute(filePath)) return filePath;

  // Convert to relative from project root
  const relative = path.relative(projectDir, filePath);

  // If the relative path goes outside project (starts with ..), return as-is
  if (relative.startsWith('..')) return relative;

  return relative;
}

// ---------------------------------------------------------------------------
// 10. Main Hook Entry Point
// ---------------------------------------------------------------------------

async function main() {
  const input = await readStdin();

  // Extract file path from tool input
  const toolInput = input.tool_input || {};
  const filePath = toolInput.file_path || toolInput.path || '';

  if (!filePath) return; // No file path = nothing to check

  // Convert to project-relative path
  const relativePath = toRelativePath(filePath);

  // Skip files outside project directory
  if (relativePath.startsWith('..')) return;

  // Detect current agent role
  const { role, domain } = detectAgentRole();

  // If role is unknown, issue warning but do not block
  if (!role) {
    outputWarning(formatUnknownAgentWarning(relativePath));
    return;
  }

  // Perform permission check
  const result = checkPermission(role, domain, relativePath);

  if (result.allowed) {
    // Permission granted - no output (silent allow)
    return;
  }

  // Permission denied - format appropriate message based on violation type
  if (result.type === 'domain-boundary') {
    outputDeny(formatBoundaryViolationMessage({
      agentRole: role,
      agentDomain: domain,
      targetDomain: result.escalation ? result.escalation.replace('-part-leader', '') : 'unknown',
      filePath: relativePath
    }));
  } else {
    outputDeny(formatDenialMessage({
      agentRole: role,
      domain: domain,
      filePath: relativePath,
      reason: result.reason,
      escalationTarget: result.escalation
    }));
  }
}

main().catch(() => {
  // Silent exit - hooks must never break the session
});

// ---------------------------------------------------------------------------
// Exports for testing
// ---------------------------------------------------------------------------

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PERMISSION_MATRIX,
    generatePartLeaderPermissions,
    generateDomainDesignerPermissions,
    generateDomainDeveloperPermissions,
    globToRegex,
    matchesAnyPattern,
    findEscalationTarget,
    detectAgentRole,
    resolvePermissions,
    checkDomainBoundary,
    checkPermission,
    toRelativePath,
    formatDenialMessage,
    formatBoundaryViolationMessage,
    formatUnknownAgentWarning
  };
}
