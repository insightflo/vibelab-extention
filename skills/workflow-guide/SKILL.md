---
name: workflow-guide
description: 여러 플러그인 중 상황에 맞는 워크플로우를 안내합니다. /workflow, "어떤 스킬을 써야 해?", "워크플로우 추천" 트리거.
---

# 🧭 워크플로우 선택 가이드

> **목적**: VibeLab, Superpowers, SDD Tool, Everything Claude Code 등 여러 플러그인이 설치된 환경에서 상황에 맞는 최적의 워크플로우를 안내합니다.
>
> - **필독 지침**: 모든 워크플로우는 **[TEAM-CHARTER.md](file:///D:/92.MCPs/user-skills/TEAM-CHARTER.md)**의 에이전트 역할을 기반으로 합니다. (WSL: `/mnt/d/92.MCPs/user-skills/TEAM-CHARTER.md`)

---

## ⛔ 절대 금지 사항

**이 스킬이 발동되면:**

1. ❌ 직접 코드를 작성하지 마세요 - 워크플로우 안내만 합니다.
2. ❌ 모든 스킬을 나열하지 마세요 - 상황에 맞는 것만 추천합니다.

---

## ✅ 스킬 발동 시 즉시 실행할 행동

**이 스킬이 발동되면 다음 3단계를 순서대로 실행하세요:**

### 1단계: 프로젝트 상태 자동 진단 (Silent Analysis)

사용자에게 묻기 전에, **현재 폴더 구조를 먼저 확인**하여 상태를 파악하십시오.

```bash
# 1. 기획 문서 확인
ls docs/planning/*.md

# 2. 태스크 파일 확인
ls docs/planning/06-tasks.md

# 3. 코드 베이스 확인 (package.json, requirements.txt 등)
ls package.json requirements.txt
```

### 2단계: 상황별 맞춤 가이드 제안

진단 결과에 따라 가장 적합한 **단 하나의 행동**을 추천하십시오.

1.  **기획 문서 없음** → "아이디어를 구체화할 때입니다. `/socrates`를 시작해 볼까요? (전문가라면 `/socrates expert`)"
2.  **기획 있음 + 태스크 없음** → "기획이 준비되었네요. `/tasks-generator`로 할 일을 쪼개볼까요?"
3.  **태스크 있음 + 코드 초기** → "준비가 끝났습니다. `/agile auto`로 뼈대부터 차근차근 자동 구현을 시작해볼까요?"
4.  **이미 개발 진행 중 (기능 추가/품질 개선)** → "기존 코드를 개선할 차례군요. `/agile iterate`로 영향받는 레이어만 스마트하게 수정해보세요."
5.  **품질 점검 필요** → "구현이 끝났다면 `/code-review`로 검토하거나 `/audit`으로 최종 점검을 수행하세요."

### 3단계: 사용자 확인 (AskUserQuestion)

위의 추천을 바탕으로 사용자의 최종 의사를 확인합니다.
**이때, 가장 권장하는 옵션의 label 앞에는 반드시 `⭐ [추천]` 또는 `✅ [권장]` 표식을 붙여주세요.**

---

## 📋 워크플로우 매핑 테이블

### 🎨 기획 단계 (Planning)

| 상황                            | 권장 스킬                                    | 설명                                   |
| ------------------------------- | -------------------------------------------- | -------------------------------------- |
| 아이디어만 있음, 비기술자       | `/socrates` (일반 모드)                      | 21개 질문으로 아이디어 정제 (초심자용) |
| 아이디어만 있음, **전문가**     | **`/socrates expert`**                       | 배치 질문 & 빠른 의사결정 (전문가용)   |
| 명세 품질이 중요, RFC 2119 필요 | `/sdd.constitution` → `/sdd.spec` (SDD Tool) | SHALL/SHOULD/MAY 키워드로 정밀 명세    |
| 브레인스토밍만 빠르게           | `superpowers:brainstorm`                     | 빠른 디자인 리파인먼트                 |
| 아키텍처 결정 필요              | `everything-claude-code/agents/planner`      | 상세 구현 계획 수립                    |

### 📝 태스크 생성 (Task Generation)

| 상황                    | 권장 스킬                            | 설명                            |
| ----------------------- | ------------------------------------ | ------------------------------- |
| 기획 문서 → 태스크 목록 | `/tasks-generator` (VibeLab)         | TDD/Worktree 규칙 적용 TASKS.md |
| 기존 코드 분석 → 태스크 | `/tasks-generator analyze` (VibeLab) | 코드 분석 기반 태스크 추출      |
| SDD 명세 → 태스크       | `/sdd.tasks` (SDD Tool)              | 명세 기반 작업 분해             |
| Superpowers 플랜        | `superpowers:writing-plans`          | 서브에이전트용 상세 구현 계획   |

### 🛠️ 구현 단계 (Implementation)

| 상황                          | 권장 스킬                        | 설명                                             |
| ----------------------------- | -------------------------------- | ------------------------------------------------ |
| 프로젝트 초기 셋업            | `/project-bootstrap` (VibeLab)   | 에이전트 팀 + 스택 자동 구축                     |
| **신규 프로젝트 시작**        | **`/agile auto`**                | **🦴💪✨ 레이어별 자동 구현 (권장)**             |
| **디자인/기능/로직 변경**     | **`/agile iterate`**             | **🔄 영향받는 레이어만 스마트 반복 구현 (권장)** |
| **태스크 수동 관리**          | **`/agile run` / `/agile done`** | **태스크별 실행 계획서 + 완료 보고서 생성**      |
| **완전 자동화 (전문가)**      | `/auto-orchestrate`              | 의존성 분석 기반 전체 자동 실행 (체크포인트 X)   |
| 태스크 배치 실행 (체크포인트) | `superpowers:executing-plans`    | 사람 체크포인트 포함 배치 실행                   |

> **💡 권장 워크플로우**: 안전한 진행을 위해 **`/agile auto`** (신규) 또는 **`/agile iterate`** (수정)를 최우선으로 고려하세요.

### 🔍 검증 및 품질 (Verification & Quality)

| 상황                    | 권장 스킬                                    | 설명                                |
| ----------------------- | -------------------------------------------- | ----------------------------------- |
| **품질/버그 수동 수정** | **`/agile iterate {issue}`**                 | **근본 원인 분석 후 레이어별 수정** |
| **코드 리뷰 필요**      | **`/code-review`**                           | **2단계 리뷰 (명세 준수 → 품질)**   |
| **디버깅 필요**         | **`/systematic-debugging`**                  | **4단계 근본 원인 분석**            |
| 명세-코드 동기화 검증   | `/sdd.sync` (SDD Tool)                       | 스펙과 코드 일치 여부 확인          |
| 브랜치 마무리           | `superpowers:finishing-a-development-branch` | 머지/PR/정리 결정                   |

> ⚠️ **필수 원칙**: 모든 완료 선언 전 `/verification-before-completion` 원칙을 따르세요. 코드 생성 시 `/guardrails`가 자동 적용됩니다.

### 🔬 리서치 (Research)

| 상황           | 권장 스킬                  | 설명                            |
| -------------- | -------------------------- | ------------------------------- |
| 심층 조사 필요 | `/deep-research` (VibeLab) | 5개 API 병렬 검색 + 통합 보고서 |

### ⚡ 유틸리티 (Utility)

| 상황             | 권장 스킬 | 설명                              |
| ---------------- | --------- | --------------------------------- |
| 정확도 향상 필요 | `/boost`  | 프롬프트 반복으로 LLM 정확도 개선 |

---

## 🎯 빠른 결정 플로우차트

```mermaid
flowchart TD
    A[시작] --> B{현재 단계?}
    B -->|아이디어만 있음| C[/socrates]
    B -->|기획 완료| D{태스크 생성 방식?}
    B -->|태스크 있음| E{구현 방식?}
    B -->|코드 작성 중/수정| F{필요한 것?}

    D -->|VibeLab 방식| G[/tasks-generator]
    D -->|SDD 방식| H[/sdd.tasks]

    E -->|신규 빌드| J[/agile auto]
    E -->|변경/피드백 반영| K[/agile iterate]
    E -->|완전 자동화| L[/auto-orchestrate]
    E -->|수동 관리| M[/agile run/done]

    F -->|품질 개선/수정| K
    F -->|코드 리뷰| N[/code-review]
    F -->|디버깅| O[/systematic-debugging]
    F -->|리서치| P[/deep-research]
```

---

**AskUserQuestion 예시 (상황에 따라 동적으로 생성):**

```json
{
  "questions": [
    {
      "question": "현재 상태에 가장 적합한 다음 단계입니다. 어떻게 진행할까요?",
      "header": "워크플로우 안내",
      "options": [
        {
          "label": "✅ [권장] 기능 수정 (/agile iterate)",
          "description": "🔄 영향받는 레이어만 스마트하게 수정 (34개 에러 해결 최적)"
        },
        {
          "label": "🦴 레이어별 자동 구현 (/agile auto)",
          "description": "뼈대부터 새롭게 전체 구현 시작"
        },
        {
          "label": "🎯 수동 태스크 관리 (/agile run/done)",
          "description": "개발자가 직접 하나씩 제어"
        },
        {
          "label": "🔍 코드 리뷰 (/code-review)",
          "description": "2단계 코드 리뷰 수행"
        }
      ],
      "multiSelect": false
    }
  ]
}
```

---

**Last Updated**: 2026-01-23 (VibeLab Hybrid Priority Update)
