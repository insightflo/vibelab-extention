---
name: governance-setup
description: 대규모 프로젝트의 거버넌스 팀(PM, Architect, Designer, QA, DBA)이 구현 전 선행 작업을 수행합니다. /governance-setup, "거버넌스 구성", "프로젝트 팀 셋업" 트리거.
version: 1.0.0
updated: 2026-02-08
---

# 🏛️ Governance Setup (Phase 0)

> **목적**: 대규모 프로젝트에서 구현 전에 거버넌스 팀(PM, Architect, Designer, QA, DBA)이 선행 작업을 수행하여 프로젝트 표준과 품질 기준을 확립합니다.
>
> **⚠️ 핵심 원칙**: 이 스킬은 **구현 코드를 작성하지 않습니다**. 오직 **거버넌스 문서와 표준**만 생성합니다.
>
> **전제 조건**: TASKS.md가 존재해야 합니다. 없으면 `/tasks-generator` 먼저 실행.

---

## ⛔ 절대 금지 사항

1. ❌ **구현 코드 작성 금지** - 표준/정책 문서만 작성
2. ❌ **에이전트 순서 무시 금지** - PM → Architect → Designer → QA → DBA 순서 필수
3. ❌ **사용자 확인 없이 진행 금지** - 각 에이전트 완료 후 사용자 승인 필요

---

## ✅ 스킬 발동 시 즉시 실행할 행동

### 0단계: 전제 조건 확인

```bash
# TASKS.md 존재 확인
ls docs/planning/06-tasks.md 2>/dev/null || ls TASKS.md 2>/dev/null

# 태스크 수 확인 (10개 이상이어야 거버넌스 권장)
grep -c "^- \[ \]" docs/planning/06-tasks.md 2>/dev/null || echo "0"

# 기존 거버넌스 산출물 확인
ls management/project-plan.md 2>/dev/null
ls management/decisions/ADR-*.md 2>/dev/null
ls management/quality-gates.md 2>/dev/null
```

**TASKS.md가 없으면:**
```
⚠️ TASKS.md가 존재하지 않습니다.
거버넌스 셋업 전에 먼저 /tasks-generator로 태스크를 생성하세요.
```

### 1단계: 프로젝트 정보 수집

기획 문서에서 프로젝트 정보를 추출합니다:

```bash
# 프로젝트명, 기술 스택 확인
head -50 docs/planning/01-prd.md 2>/dev/null
head -50 docs/planning/02-trd.md 2>/dev/null
```

---

## 🔄 거버넌스 팀 순차 실행

### Step 1: Project Manager (@project-manager)

**역할**: 프로젝트 계획 수립, 마일스톤 정의, 리스크 관리

**산출물**: `management/project-plan.md`

**Task 호출:**
```
Task({
  subagent_type: "orchestrator",
  description: "PM: 프로젝트 계획 수립",
  prompt: `
## 역할: Project Manager

당신은 이 프로젝트의 PM입니다. 다음 산출물을 생성하세요.

## 입력 정보
- PRD: docs/planning/01-prd.md
- TRD: docs/planning/02-trd.md
- TASKS: docs/planning/06-tasks.md

## 산출물: management/project-plan.md

다음 내용을 포함하세요:
1. 프로젝트 개요 (목적, 범위, 성공 기준)
2. 마일스톤 정의 (Phase별 목표, 기간)
3. 리스크 관리 계획 (식별된 리스크, 대응 방안)
4. 커뮤니케이션 규칙 (보고 주기, 채널)
5. 에스컬레이션 정책

## 주의사항
- 구현 코드 작성 금지
- 기획 문서 기반으로 작성
- 현실적인 일정 수립
`
})
```

**완료 조건:**
- [ ] `management/project-plan.md` 생성됨
- [ ] 마일스톤이 TASKS.md의 Phase와 일치
- [ ] 리스크 최소 3개 이상 식별

---

### Step 2: Chief Architect (@chief-architect)

**역할**: 기술 표준 정의, 아키텍처 결정(ADR) 작성

**산출물**: `management/decisions/ADR-*.md`

**Task 호출:**
```
Task({
  subagent_type: "orchestrator",
  description: "Architect: 아키텍처 결정 문서",
  prompt: `
## 역할: Chief Architect

당신은 이 프로젝트의 Chief Architect입니다. ADR(Architecture Decision Record)을 작성하세요.

## 입력 정보
- TRD: docs/planning/02-trd.md
- TASKS: docs/planning/06-tasks.md

## 산출물: management/decisions/ 폴더에 ADR 파일들

### ADR-001-tech-stack.md
기술 스택 결정 (이미 TRD에 있으면 정리만)

### ADR-002-api-versioning.md
API 버저닝 정책:
- 버전 표기 방식 (URL path vs Header)
- 하위 호환성 정책
- 지원 중단(deprecation) 절차

### ADR-003-error-handling.md
에러 핸들링 표준:
- 에러 응답 형식 (JSON 스키마)
- HTTP 상태 코드 사용 규칙
- 클라이언트 에러 vs 서버 에러

### ADR-004-naming-convention.md
명명 규칙:
- 파일/폴더 명명 규칙
- 함수/변수 명명 규칙
- API 엔드포인트 명명 규칙

## ADR 형식
각 ADR은 다음 구조를 따릅니다:
- Title, Status (Proposed/Accepted/Deprecated)
- Context (왜 결정이 필요한가)
- Decision (무엇을 결정했는가)
- Consequences (결정의 영향)

## 주의사항
- 구현 코드 작성 금지
- 결정 근거를 명확히 기술
`
})
```

**완료 조건:**
- [ ] `management/decisions/` 폴더 생성됨
- [ ] ADR 최소 4개 작성됨
- [ ] 각 ADR에 Status가 명시됨

---

### Step 3: Chief Designer (@chief-designer)

**역할**: 디자인 시스템 정의, UI/UX 가이드라인

**산출물**: `design/system/*.md`

**Task 호출:**
```
Task({
  subagent_type: "frontend-specialist",
  description: "Designer: 디자인 시스템 정의",
  prompt: `
## 역할: Chief Designer

당신은 이 프로젝트의 Chief Designer입니다. 디자인 시스템을 정의하세요.

## 입력 정보
- PRD: docs/planning/01-prd.md (사용자 요구사항)
- Screen Specs: specs/screens/*.yaml (있는 경우)

## 산출물: design/system/ 폴더

### design/system/tokens.md
디자인 토큰 정의:
- Color Palette (Primary, Secondary, Neutral, Semantic)
- Typography Scale (Font family, sizes, weights)
- Spacing Scale (4px base grid)
- Border Radius, Shadows

### design/system/components.md
컴포넌트 규칙:
- Button variants (Primary, Secondary, Ghost, Danger)
- Input fields (Text, Select, Checkbox, Radio)
- Card, Modal, Toast
- 상태별 스타일 (Default, Hover, Active, Disabled, Error)

### design/system/layout.md
레이아웃 규칙:
- Grid system (12-column)
- Breakpoints (Mobile, Tablet, Desktop)
- Container widths
- Page templates

### design/system/accessibility.md
접근성 가이드:
- Color contrast ratios (WCAG AA)
- Focus indicators
- ARIA labels 규칙
- Keyboard navigation

## 주의사항
- 구현 코드 작성 금지 (CSS/Tailwind 예시만 포함)
- 일관성 있는 디자인 언어 정의
`
})
```

**완료 조건:**
- [ ] `design/system/` 폴더 생성됨
- [ ] 최소 4개 문서 작성됨
- [ ] Color palette에 최소 5가지 색상 정의됨

---

### Step 4: QA Manager (@qa-manager)

**역할**: 품질 기준 정의, 테스트 전략

**산출물**: `management/quality-gates.md`

**Task 호출:**
```
Task({
  subagent_type: "test-specialist",
  description: "QA: 품질 게이트 정의",
  prompt: `
## 역할: QA Manager

당신은 이 프로젝트의 QA Manager입니다. 품질 기준과 테스트 전략을 정의하세요.

## 입력 정보
- TASKS: docs/planning/06-tasks.md
- TRD: docs/planning/02-trd.md

## 산출물: management/quality-gates.md

다음 섹션을 포함하세요:

### 1. 테스트 커버리지 기준
- Unit Test: 80% 이상
- Integration Test: 주요 API 100%
- E2E Test: Critical Path 100%

### 2. 코드 품질 기준
- Lint 에러: 0
- TypeScript strict mode 통과
- 복잡도 (Cyclomatic): 10 이하
- 중복 코드: 5% 이하

### 3. 성능 기준
- API 응답 시간: 200ms 이하 (P95)
- 페이지 로드: LCP 2.5s 이하
- Bundle size 제한

### 4. 보안 기준
- OWASP Top 10 검사 통과
- 의존성 취약점 0 (Critical/High)
- 민감 정보 노출 검사

### 5. 코드 리뷰 체크리스트
- [ ] 요구사항 충족
- [ ] 테스트 포함
- [ ] 문서 업데이트
- [ ] 성능 영향 검토
- [ ] 보안 검토

### 6. 릴리즈 승인 기준
- 모든 테스트 통과
- 코드 리뷰 승인
- 품질 게이트 통과
- 스테이징 검증 완료

## 주의사항
- 구현 코드 작성 금지
- 측정 가능한 기준 제시
- 현실적인 목표 설정
`
})
```

**완료 조건:**
- [ ] `management/quality-gates.md` 생성됨
- [ ] 각 기준에 구체적인 수치 포함
- [ ] 체크리스트 형식 포함

---

### Step 5: DBA (@dba)

**역할**: 데이터베이스 표준 정의, 명명 규칙

**산출물**: `database/standards.md`

**Task 호출:**
```
Task({
  subagent_type: "database-specialist",
  description: "DBA: 데이터베이스 표준 정의",
  prompt: `
## 역할: DBA

당신은 이 프로젝트의 DBA입니다. 데이터베이스 표준을 정의하세요.

## 입력 정보
- TRD: docs/planning/02-trd.md (DB 기술 스택)
- DB Design: docs/planning/04-database-design.md (있는 경우)

## 산출물: database/standards.md

다음 섹션을 포함하세요:

### 1. 테이블 명명 규칙
- snake_case 사용
- 복수형 사용 (users, orders)
- 접두어 규칙 (없음 또는 도메인별)
- 예약어 회피

### 2. 컬럼 명명 규칙
- snake_case 사용
- 외래키: {referenced_table}_id
- Boolean: is_, has_, can_ 접두어
- 타임스탬프: created_at, updated_at, deleted_at

### 3. 인덱스 정책
- Primary Key 명명: pk_{table}
- Foreign Key 명명: fk_{table}_{column}
- Unique Index 명명: uq_{table}_{column}
- 일반 Index 명명: idx_{table}_{column}

### 4. 마이그레이션 규칙
- 파일 명명: {timestamp}_{description}.sql
- 롤백 스크립트 필수
- 대용량 테이블 변경 시 주의사항
- 무중단 마이그레이션 전략

### 5. 쿼리 표준
- N+1 쿼리 방지
- 페이지네이션 필수 (cursor vs offset)
- 트랜잭션 격리 수준
- 타임아웃 설정

### 6. 백업 및 복구
- 백업 주기
- 보존 기간
- 복구 테스트 주기

## 주의사항
- 구현 코드 작성 금지 (SQL 예시만 포함)
- 팀 전체가 따를 수 있는 명확한 규칙
`
})
```

**완료 조건:**
- [ ] `database/standards.md` 생성됨
- [ ] 명명 규칙 예시 포함
- [ ] 마이그레이션 절차 정의됨

---

## 📋 거버넌스 완료 체크리스트

모든 에이전트 작업 완료 후 다음을 확인합니다:

```
management/
├── project-plan.md           ← PM
├── quality-gates.md          ← QA Manager
└── decisions/
    ├── ADR-001-tech-stack.md         ← Architect
    ├── ADR-002-api-versioning.md     ← Architect
    ├── ADR-003-error-handling.md     ← Architect
    └── ADR-004-naming-convention.md  ← Architect

design/
└── system/
    ├── tokens.md             ← Designer
    ├── components.md         ← Designer
    ├── layout.md             ← Designer
    └── accessibility.md      ← Designer

database/
└── standards.md              ← DBA
```

---

## 🔗 다음 단계

거버넌스 셋업 완료 후:

```
/governance-setup 완료
    ↓
사용자에게 안내:
"거버넌스 셋업이 완료되었습니다!

다음 단계를 선택하세요:
1. /project-bootstrap - 구현 팀(backend, frontend, test) 구성
2. /auto-orchestrate - 바로 구현 시작 (소규모 프로젝트)
3. /workflow - 다른 워크플로우 선택"
```

---

## ⚙️ Hook 연동

거버넌스 산출물은 다음 Hook들과 연동됩니다:

| 산출물 | Hook | 동작 |
|--------|------|------|
| `management/decisions/ADR-*.md` | `standards-validator` | ADR 위반 시 경고 |
| `management/quality-gates.md` | `quality-gate` | 커버리지/품질 미달 시 차단 |
| `design/system/*.md` | `design-validator` | 디자인 시스템 위반 감지 |
| `database/standards.md` | `standards-validator` | DB 명명 규칙 위반 감지 |

---

## 🆘 문제 해결

### Q: TASKS.md가 없어요
A: `/tasks-generator`를 먼저 실행하세요. 기획 문서(PRD, TRD)가 있어야 합니다.

### Q: 에이전트 호출이 실패해요
A: Claude Project Team이 설치되어 있는지 확인하세요:
```bash
ls ~/.claude/agents/
```

### Q: 특정 단계만 다시 실행하고 싶어요
A: 해당 에이전트만 개별 호출할 수 있습니다:
```bash
claude @chief-architect "ADR-002 API 버저닝 정책을 다시 작성해주세요"
```

---

**Last Updated**: 2026-02-08 (v1.0.0)
