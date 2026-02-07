---
name: workflow-guide
description: 여러 플러그인 중 상황에 맞는 워크플로우를 안내합니다. /workflow, "어떤 스킬을 써야 해?", "워크플로우 추천" 트리거.
version: 3.0.0
updated: 2026-02-08
---

# 워크플로우 선택 가이드 (Meta Hub)

> **목적**: 44개 스킬(바이브랩 34개 + 우리스킬 10개) 중 현재 상황에 가장 적합한 스킬을 **단 하나만** 추천하는 메타 허브입니다.
>
> **핵심 원칙**: 이 스킬은 **코드를 작성하지 않습니다**. 오직 **상황 진단 -> 스킬 추천 -> 사용자 확인**만 수행합니다.
>
> **v3.0.0 업데이트**: 유지보수 스킬 5개 추가 (impact, deps, changelog, coverage, architecture) + 유지보수 워크플로우 + Claude Project Team 연동

---

## 전체 스킬 카탈로그 (44개)

### 우리스킬 (10개) - 프로젝트 확장

#### 프로젝트 관리 (5개)

| 스킬 | 트리거 | 고유 역할 |
|------|--------|-----------|
| **`/workflow`** | `/workflow`, "뭐해야해?" | 메타 허브 - 스킬 라우팅 |
| **`/agile`** | `/agile auto`, `/agile iterate` | 레이어 기반 스프린트 (Skeleton->Muscles->Skin) |
| **`/recover`** | `/recover`, "작업 복구" | 범용 복구 허브 |
| **`/audit`** | `/audit`, "품질 검사" | 배포 전 종합 감사 (DDD/테스트/브라우저) |
| **`/multi-ai-review`** | `/multi-ai-review`, "심층 리뷰" | Claude+Gemini+GLM 3중 검증 |

#### 유지보수 분석 (5개) - v3.0.0 NEW

| 스킬 | 트리거 | 고유 역할 |
|------|--------|-----------|
| **`/impact`** | `/impact <파일>`, "영향도 분석" | 파일 변경 영향도 분석 (위험도/의존성/관련 테스트) |
| **`/deps`** | `/deps`, "의존성 확인" | 의존성 그래프 시각화, 순환 의존성 감지 |
| **`/changelog`** | `/changelog`, "변경 이력" | 변경 이력 조회, 기간별/도메인별/유형별 필터링 |
| **`/coverage`** | `/coverage`, "커버리지 확인" | 테스트 커버리지 조회, 미커버 영역 식별 |
| **`/architecture`** | `/architecture`, "구조 보여줘" | 아키텍처 맵 시각화 (도메인/API/레이어/기술스택) |

### 바이브랩스킬 (34개) - 핵심 기능

#### 아이디어 & 브레인스토밍 (v1.8.1)

| 스킬 | 용도 |
|------|------|
| `/neurion` | AI 브레인스토밍 (Osborn 4원칙, 4 AI 페르소나) |
| `/eureka` | 추상적 아이디어 -> 구체적 MVP 변환 |

#### 기획 & 설계

| 스킬 | 용도 |
|------|------|
| `/socrates` | 1:1 기획 컨설팅 (21개 질문 -> 7개 문서 생성) |
| `/screen-spec` | 화면별 상세 명세 (YAML v2.0) |
| `/design-linker` | 목업 이미지 <-> TASKS.md 연결 |
| `/movin-design-system` | 다크모드 + 네온 디자인 시스템 |
| `/paperfolio-design` | 클린/볼드/모던 포트폴리오 디자인 |
| `/reverse` | 기존 코드 -> 명세 역추출 **(v1.8.1)** |

#### 태스크 & 목표

| 스킬 | 용도 |
|------|------|
| `/tasks-generator` | TASKS.md 생성 (Domain-Guarded 구조) |
| `/goal-setting` | 목표 관리 및 진행 모니터링 |

#### 구현 & 자동화

| 스킬 | 용도 | 규모 |
|------|------|------|
| `/auto-orchestrate` | 의존성 기반 자동 실행 | 30~50개 |
| `/ultra-thin-orchestrate` | 초경량 오케스트레이션 | 50~200개 |
| `/ralph-loop` | 자율 반복 루프 (완료까지) | 에러 반복 시 |
| `/project-bootstrap` | 에이전트 팀 + 프로젝트 셋업 | 초기 1회 |
| `/desktop-bridge` | Desktop<->CLI 하이브리드 워크플로우 **(v1.8.1)** |
| `/cost-router` | AI 비용 40-70% 절감 라우팅 **(v1.8.1)** |

#### 검증 & 품질

| 스킬 | 시점 | 범위 |
|------|------|------|
| `/code-review` | 태스크/기능 완료 | 2단계 리뷰 (Spec->Quality) |
| `/evaluation` | Phase 완료 | 메트릭 측정 + 품질 게이트 |
| `/trinity` | Phase 완료/PR 전 | 五柱 철학 기반 품질 평가 **(v1.8.1)** |
| `/powerqa` | 테스트 자동화 | 자동 QA 사이클링 **(v1.8.1)** |
| `/sync` | 개발 중간 | 명세-코드 동기화 검증 **(v1.8.1)** |
| `/vercel-review` | 프론트엔드 | React/Next.js 성능 최적화 |
| `/verification-before-completion` | 모든 완료 선언 전 | 검증 명령어 실행 필수 |
| `/systematic-debugging` | 버그 발생 시 | 4단계 근본 원인 분석 |
| `/guardrails` | 코드 생성 시 | 보안 패턴 자동 검사 |

#### 리서치 & 지식

| 스킬 | 용도 |
|------|------|
| `/deep-research` | 5개 API 병렬 검색 |
| `/rag` | Context7 기반 최신 문서 검색 |
| `/memory` | 세션 간 학습 지속 |
| `/reasoning` | CoT, ToT, ReAct 추론 |
| `/reflection` | 자기 성찰 패턴 |

#### 기술 스택

| 스킬 | 용도 |
|------|------|
| `/react-19` | React 19 컴포넌트/훅 |
| `/fastapi-latest` | FastAPI 백엔드 |

#### 유틸리티

| 스킬 | 용도 |
|------|------|
| `/chrome-browser` | 브라우저 자동화 |
| `/a2a` | 에이전트 간 통신 프로토콜 |
| `/kongkong2` | 입력 복제로 정확도 향상 |

---

## 절대 금지 사항

1. **직접 코드를 작성하지 마세요** - 워크플로우 안내만 합니다.
2. **모든 스킬을 나열하지 마세요** - 상황에 맞는 **1~2개만** 추천합니다.
3. **사용자에게 먼저 묻지 마세요** - 프로젝트 상태를 **먼저 자동 진단**합니다.

---

## 스킬 발동 시 즉시 실행할 행동

### 1단계: 프로젝트 상태 자동 진단 (Silent Analysis)

**사용자에게 묻기 전에 현재 상태를 파악합니다:**

```bash
# 1. 기획 문서 확인
ls docs/planning/*.md 2>/dev/null

# 2. 태스크 파일 확인
ls docs/planning/06-tasks.md 2>/dev/null

# 3. 코드 베이스 확인
ls package.json pyproject.toml requirements.txt 2>/dev/null

# 4. 중단된 작업 확인
ls .claude/orchestrate-state.json 2>/dev/null
cat .claude/orchestrate-state.json 2>/dev/null | head -5

# 5. Git 상태 확인
git status --short 2>/dev/null | head -10
git worktree list 2>/dev/null

# 6. specs/ 폴더 확인 (v1.8.1)
ls specs/screens/*.yaml 2>/dev/null

# 7. 아키텍처 문서 확인 (v3.0.0)
ls .claude/architecture/ 2>/dev/null
ls .claude/changelog/ 2>/dev/null

# 8. 프로젝트 팀 설정 확인 (v3.0.0)
ls .claude/project-team.yaml 2>/dev/null
```

### 2단계: 상황별 진단 결과 매핑

| 진단 결과 | 프로젝트 단계 | 권장 스킬 |
|-----------|---------------|-----------|
| 아이디어만 있음 | **브레인스토밍** | `/neurion` -> `/socrates` |
| docs/planning/ 없음 | **기획 시작** | `/socrates` |
| 기존 코드만 있음 (명세 없음) | **역추출 필요** | `/reverse` |
| 기획 있음 + 06-tasks.md 없음 | **기획 완료** | `/tasks-generator` |
| 태스크 있음 + 코드 없음 | **구현 준비** | `/agile auto` (<=30) 또는 `/auto-orchestrate` (>30) |
| 코드 있음 + 미완료 태스크 | **구현 중** | `/agile iterate` 또는 `/auto-orchestrate --resume` |
| orchestrate-state.json 존재 | **자동화 중단** | `/recover` -> `/auto-orchestrate --resume` |
| 모든 태스크 완료 | **검증 필요** | `/trinity` -> `/audit` |
| Git 충돌/dirty 상태 | **복구 필요** | `/recover` |
| 코드 수정 전 (특정 파일) | **영향도 파악** | `/impact <파일>` |
| 리팩토링 계획 중 | **의존성 확인** | `/deps` -> `/architecture` |
| 커버리지 확인 필요 | **테스트 현황** | `/coverage` |
| 변경 이력 추적 | **히스토리 조회** | `/changelog` |
| 구조 이해 필요 | **아키텍처 파악** | `/architecture` |

### 3단계: 맞춤 추천 + 사용자 확인

진단 결과에 따라 **AskUserQuestion**으로 확인합니다:

```json
{
  "questions": [
    {
      "question": "프로젝트 상태를 분석했습니다. 다음 단계를 선택하세요:",
      "header": "워크플로우",
      "options": [
        {
          "label": "[권장] {진단된 최적 스킬}",
          "description": "{해당 스킬이 적합한 이유}"
        },
        {
          "label": "{대안 스킬 1}",
          "description": "{대안 설명}"
        },
        {
          "label": "{대안 스킬 2}",
          "description": "{대안 설명}"
        }
      ],
      "multiSelect": false
    }
  ]
}
```

---

## 핵심 의사결정 트리 (v3.0)

```
시작
|
+-- 작업 중단됨? ----------------------- YES -> /recover
|
+-- 아이디어만 있음? ------------------- YES -> /neurion -> /socrates
|
+-- 기획 문서 있음? ------------------- NO
|   |                                      +-- 신규 프로젝트: /socrates
|   |                                      +-- 기존 코드만: /reverse
|   |
|   +-- YES -> TASKS.md 있음? --------- NO -> /tasks-generator
|                                            (UI 상세화: /screen-spec)
|
+-- 코드베이스 있음?
|   |
|   +-- 신규 구현? -------------------- <=30개: /agile auto
|   |                                   30~50개: /auto-orchestrate
|   |                                   50~200개: /ultra-thin-orchestrate
|   |
|   +-- 수정/변경? -------------------- /agile iterate
|   |
|   +-- 명세 드리프트? --------------- /sync
|   |
|   +-- 버그 수정? -------------------- /systematic-debugging
|   |
|   +-- 유지보수/리팩토링?           [v3.0 NEW]
|       |
|       +-- 수정 전 영향도 확인 ------- /impact <파일>
|       +-- 의존성 구조 파악 ---------- /deps
|       +-- 변경 이력 추적 ------------ /changelog
|       +-- 테스트 커버리지 확인 ------ /coverage
|       +-- 전체 구조 이해 ------------ /architecture
|
+-- 구현 완료?
    |
    +-- 기능 단위 ---------------------- /code-review
    +-- Phase 완료 --------------------- /trinity -> /evaluation -> /audit
    +-- QA 자동화 ---------------------- /powerqa
    +-- 배포 전 ------------------------ /multi-ai-review -> /verification-before-completion
```

---

## 태스크 규모별 구현 스킬 선택

| 태스크 수 | 권장 스킬 | 특징 |
|-----------|-----------|------|
| **1~10개** | `/agile run` + `/agile done` | 수동 제어, 상세 보고서 |
| **10~30개** | `/agile auto` | 레이어별 체크포인트, 사용자 협업 |
| **30~50개** | `/auto-orchestrate` | 완전 자동화, Phase 병렬 실행 |
| **50~200개** | `/ultra-thin-orchestrate` | 초경량 모드, 컨텍스트 최적화 |
| **에러 반복** | `/ralph-loop` | 자기 참조 학습, 완료까지 반복 |
| **QA 사이클** | `/powerqa` | 테스트->검증->수정 자동 반복 |

---

## 스킬 간 연동 매트릭스 (v3.0)

### 성공 경로 (Happy Path)

```
/neurion (아이디어 폭발)
    |
/socrates (기획 문서화)
    |
/screen-spec (화면 명세)
    |
/tasks-generator
    |
+-------------------------------------+
| 구현 (규모에 따라 선택)              |
| - /agile auto (<=30)                |
| - /auto-orchestrate (30~50)         |
| - /ultra-thin-orchestrate (50~200)  |
|                                     |
| +-- 개발 중간: /sync (명세 동기화)  |
| +-- 비용 최적화: /cost-router       |
+-------------------------------------+
    |
/code-review (기능 단위)
    |
/trinity (五柱 품질 평가)
    |
/evaluation (Phase 완료)
    |
/audit (배포 전 종합 감사)
    |
/multi-ai-review (심층 검토)
    |
/verification-before-completion
    |
배포 완료
```

### 유지보수 워크플로우 (v3.0 NEW)

프로덕션 유지보수 및 리팩토링을 위한 워크플로우입니다.

#### 버그 수정 워크플로우

```
버그 리포트 접수
    |
/impact <대상 파일>          # 1. 수정 전 영향도 분석
    |                          - 위험도 분류 (CRITICAL/HIGH/MEDIUM/LOW)
    |                          - 직접/간접 의존성 파악
    |                          - 관련 테스트 식별
    |
/coverage <대상 파일>        # 2. 현재 테스트 커버리지 확인
    |                          - 미커버 영역 식별
    |                          - 수정 범위의 테스트 유무 확인
    |
/systematic-debugging        # 3. 4단계 근본 원인 분석
    |                          - 증상 분석 -> 원인 파악 -> 수정
    |
/coverage <대상 파일>        # 4. 수정 후 커버리지 재확인
    |                          - 회귀 테스트 추가 확인
    |
/changelog --domain <도메인> # 5. 변경 이력 자동 기록 확인
```

#### 리팩토링 워크플로우

```
리팩토링 계획
    |
/architecture                # 1. 전체 아키텍처 파악
    |                          - 도메인 구조, 레이어 구조 확인
    |                          - 기술 스택 확인
    |
/deps                        # 2. 도메인 간 의존성 분석
    |                          - Mermaid 다이어그램으로 시각화
    |                          - 순환 의존성 감지
    |                          - 결합도 분석 (Ca, Ce, Instability)
    |
/deps --cycles               # 3. 순환 의존성 제거 대상 식별
    |                          - CRITICAL: 도메인 레벨 순환
    |                          - HIGH: 모듈 레벨 순환
    |
/impact <리팩토링 대상>      # 4. 변경 영향 범위 사전 확인
    |                          - 직접/간접 의존 파일 파악
    |                          - 권장 검토자 결정
    |
/agile iterate               # 5. 리팩토링 실행
    |
/deps                        # 6. 리팩토링 후 의존성 재확인
    |                          - 순환 의존성 해소 확인
    |
/code-review                 # 7. 코드 리뷰
```

#### 정기 코드 건강 점검 워크플로우

```
정기 점검 시작
    |
/architecture                # 1. 현재 아키텍처 상태 확인
    |
/deps --matrix               # 2. 도메인 간 결합도 매트릭스
    |
/coverage                    # 3. 전체 커버리지 현황
    |
/coverage --threshold 80     # 4. 커버리지 미달 파일 식별
    |
/changelog --stats           # 5. 변경 통계 확인
    |                          - 변경이 집중된 도메인 식별
    |                          - 변경 유형 분포 (feature/fix/refactor)
    |
/deps --cycles               # 6. 순환 의존성 확인
    |
개선 계획 수립               # 7. 결과 종합 -> 다음 스프린트 계획
```

### 레거시 프로젝트 경로 (v1.8.1)

```
기존 코드베이스
    |
/reverse (코드 -> 명세 역추출)
    |
specs/screens/*.yaml 생성
    |
/socrates (기획 보완)
    |
/tasks-generator
    |
일반 워크플로우...
```

### 하이브리드 워크플로우 (v1.8.1)

```
[Claude Desktop]              [Claude Code CLI]
     |                              |
/neurion, /socrates           /auto-orchestrate
/screen-spec                        |
     |                              |
     +---- /desktop-bridge ---------+
           (GitHub Issue 연동)
```

### 실패 복구 경로

| 실패 상황 | 복구 스킬 | 다음 단계 |
|-----------|-----------|-----------|
| CLI 중단 | `/recover` | 이전 스킬 재개 |
| 테스트 실패 | `/systematic-debugging` | `/agile iterate` |
| 리뷰 실패 | `/agile iterate` | `/code-review` |
| 품질 게이트 실패 | `/tasks-generator analyze` | 수정 태스크 생성 |
| Trinity 점수 낮음 | `/trinity` 피드백 반영 | `/code-review` |
| 명세-코드 불일치 | `/sync` | 수정 후 재검증 |
| 기획 불명확 | `/socrates` (재실행) | `/tasks-generator` |
| 순환 의존성 발견 | `/deps --cycles` | `/agile iterate` (해소) |
| 커버리지 미달 | `/coverage --uncovered` | 테스트 추가 |

---

## 유지보수 스킬 상세 가이드 (v3.0 NEW)

### 스킬 간 관계도

```
/architecture (전체 구조)
    |
    +-- /deps (의존성 심층 분석)
    |       |
    |       +-- /impact (단일 파일 영향도)
    |
    +-- /coverage (테스트 커버리지)
    |
    +-- /changelog (변경 이력)
```

### 스킬별 역할 비교

| 관점 | /impact | /deps | /changelog | /coverage | /architecture |
|------|---------|-------|-----------|-----------|---------------|
| 분석 단위 | 단일 파일 | 도메인/디렉토리 | 기간/도메인 | 파일/패키지 | 프로젝트 전체 |
| 핵심 출력 | 영향도 리포트 | Mermaid 다이어그램 | 변경 목록/통계 | 커버리지 %/미커버 | 구조 시각화 |
| 주요 용도 | 수정 전 사전 분석 | 리팩토링 계획 | 이력 추적 | 테스트 현황 | 온보딩/리뷰 |
| Hook 연동 | pre-edit-impact-check | - | changelog-recorder | - | architecture-updater |

### 유지보수 스킬 선택 가이드

| 상황 | 권장 스킬 | 이유 |
|------|-----------|------|
| "이 파일 수정하면 어디에 영향 가?" | `/impact <파일>` | 파일 단위 영향 범위 추적 |
| "순환 의존성 있는지 확인" | `/deps --cycles` | 그래프 기반 순환 감지 |
| "의존성 구조를 보고 싶어" | `/deps` | Mermaid 다이어그램 출력 |
| "최근 뭐가 변경됐지?" | `/changelog` | 기간/도메인/유형별 필터 |
| "테스트 커버리지 어떻게 돼?" | `/coverage` | 전체 및 파일별 커버리지 |
| "프로젝트 구조를 파악하고 싶어" | `/architecture` | 도메인/API/레이어/기술스택 |
| "특정 도메인 상세 구조" | `/architecture <도메인>` | 도메인 내부 구조 + 의존성 |
| "API 목록 보여줘" | `/architecture api` | 전체 엔드포인트 카탈로그 |

---

## Claude Project Team 연동 (v3.0 NEW)

### Hook 시스템

유지보수 스킬은 Claude Project Team의 Hook 시스템과 연동됩니다:

| Hook | 연동 스킬 | 동작 |
|------|-----------|------|
| `pre-edit-impact-check.js` | `/impact` | Edit 시 자동 영향도 분석 -> additionalContext 주입 |
| `changelog-recorder.js` | `/changelog` | Write/Edit 후 변경 이력 자동 기록 |
| `architecture-updater.js` | `/architecture` | Write/Edit 후 아키텍처 문서 자동 갱신 |
| `risk-area-warning.js` | `/impact` | CRITICAL/HIGH 영역 수정 시 경고 |
| `error-recovery-advisor.js` | `/recover` | 실패 시 복구 스킬 자동 제안 |
| `skill-router.js` | `/workflow` | 키워드 기반 스킬 자동 감지 |
| `session-memory-loader.js` | - | 이전 워크플로우 상태 자동 복원 |
| `context-guide-loader.js` | - | Constitution 자동 주입 |

**Hook vs Skill 역할 분담:**

```
Hook (자동 실행):
  - Edit/Write 시 자동 트리거
  - 경량 분석, additionalContext 주입
  - 변경 기록, 문서 갱신

Skill (수동 실행):
  - 사용자 요청 시 트리거
  - 상세 분석, 대화형 리포트
  - 사전 계획 수립, 통계 조회
```

### 에이전트 시스템

Claude Project Team의 에이전트들이 유지보수 스킬과 협업합니다:

| 에이전트 | 역할 | 관련 스킬 |
|---------|------|-----------|
| **Project Manager** | 전체 프로젝트 관리, 워크플로우 조율 | `/workflow`, `/changelog --stats` |
| **Chief Architect** | 아키텍처 설계 및 리뷰, CRITICAL 영역 검토 | `/architecture`, `/deps`, `/impact` |
| **QA Manager** | 테스트 전략, 커버리지 기준 관리 | `/coverage`, `/powerqa` |
| **Part Leader** | 도메인별 책임, 코드 리뷰 | `/impact`, `/deps <도메인>` |
| **Maintenance Analyst** | 유지보수 분석 총괄, 정기 건강 점검 | 모든 유지보수 스킬 |

**에이전트 호출 조건:**

| 상황 | 자동 호출 에이전트 |
|------|-------------------|
| CRITICAL 위험도 영역 수정 | Chief Architect + QA Manager |
| 교차 도메인 영향 발견 | 관련 도메인 Part Leader |
| 커버리지 기준 미달 | QA Manager |
| 순환 의존성 발견 | Chief Architect |

---

## 자연어 -> 스킬 빠른 매핑

```
"뭐부터 해야 할지 모르겠어"     -> /workflow
"아이디어 브레인스토밍"         -> /neurion
"아이디어를 정리하고 싶어"      -> /socrates
"기존 코드가 있는데 명세가 없어" -> /reverse
"기획서 있는데 코딩 시작해줘"   -> /agile auto
"이 기능 수정해줘"              -> /agile iterate
"명세랑 코드가 맞는지 확인해줘" -> /sync
"버그 있어"                     -> /systematic-debugging
"코드 검토해줘"                 -> /code-review
"품질 점수 측정해줘"            -> /trinity
"QA 자동화해줘"                 -> /powerqa
"품질 검사해줘"                 -> /audit
"작업이 중단됐어"               -> /recover
"대규모 프로젝트야"             -> /auto-orchestrate --ultra-thin
"배포 전 최종 점검"             -> /verification-before-completion
"디자인 시스템 적용"            -> /movin-design-system 또는 /paperfolio-design
"화면 명세 상세화"              -> /screen-spec
"목업 연결"                     -> /design-linker
"리서치 해줘"                   -> /deep-research
"React 코드 작성"               -> /react-19
"FastAPI 백엔드"                -> /fastapi-latest
"AI 비용 줄이고 싶어"           -> /cost-router
"Desktop과 CLI 연동"            -> /desktop-bridge
"이 파일 수정하면 영향 어디야"  -> /impact <파일>
"의존성 그래프 보여줘"          -> /deps
"순환 의존성 있어?"             -> /deps --cycles
"최근 변경 이력"                -> /changelog
"도메인별 변경 통계"            -> /changelog --domain <도메인> --stats
"테스트 커버리지 확인"          -> /coverage
"커버리지 낮은 파일"            -> /coverage --threshold 80
"프로젝트 구조 보여줘"          -> /architecture
"API 목록 보여줘"               -> /architecture api
"기술 스택이 뭐야?"             -> /architecture tech
```

---

## 품질 게이트 체크리스트 (v3.0)

모든 구현 완료 후 반드시 거쳐야 하는 게이트:

| 게이트 | 필수 스킬 | 통과 기준 |
|--------|-----------|-----------|
| **G1: 기능 검증** | `/code-review` | 2단계 리뷰 통과 |
| **G2: 五柱 평가** | `/trinity` | Trinity Score 70+ |
| **G3: Phase 검증** | `/evaluation` | 품질 메트릭 80% 이상 |
| **G4: 종합 감사** | `/audit` | 기획 정합성 + DDD + TestSprite |
| **G5: 심층 검토** | `/multi-ai-review` | 3개 AI 합의 (선택적) |
| **G6: 최종 검증** | `/verification-before-completion` | 검증 명령어 성공 |

유지보수 시 추가 게이트:

| 게이트 | 필수 스킬 | 통과 기준 |
|--------|-----------|-----------|
| **M1: 영향도 확인** | `/impact` | CRITICAL 영역 시 전체 테스트 통과 |
| **M2: 순환 의존성** | `/deps --cycles` | 새로운 순환 의존성 없음 |
| **M3: 커버리지 유지** | `/coverage` | 수정 전 대비 커버리지 하락 없음 |

---

## Hook 시스템 연동 (v1.9.2)

바이브랩 v1.9.2의 Hook 시스템이 워크플로우를 자동화합니다:

| Hook | 효과 | 절감 |
|------|------|------|
| `skill-router` | 키워드 기반 스킬 자동 감지 -> 이 스킬 호출 불필요 | 1K~3K 토큰/프롬프트 |
| `session-memory-loader` | 이전 워크플로우 상태 자동 복원 | 2K~5K 토큰/세션 |
| `context-guide-loader` | Constitution 자동 주입 | 1K~3K 토큰/수정 |
| `error-recovery-advisor` | 실패 시 복구 스킬 자동 제안 | ~1K 토큰/에러 |
| `pre-edit-impact-check` | Edit 시 영향도 자동 분석 **(v3.0)** | 사전 분석 자동화 |
| `changelog-recorder` | Write/Edit 후 변경 이력 자동 기록 **(v3.0)** | 이력 관리 자동화 |
| `architecture-updater` | Write/Edit 후 아키텍처 문서 자동 갱신 **(v3.0)** | 문서 유지 자동화 |

### Hook 활성화 확인

```bash
ls ~/.claude/hooks/
# session-memory-loader.js, skill-router.js, context-guide-loader.js,
# pre-edit-impact-check.js, changelog-recorder.js, architecture-updater.js, ...
```

---

## 도움말 & FAQ

### Q: 어떤 스킬을 써야 할지 모르겠어요
A: `/workflow`를 실행하면 프로젝트 상태를 자동 분석하여 최적의 스킬을 추천합니다.

### Q: 여러 스킬을 동시에 실행해도 되나요?
A: 권장하지 않습니다. 각 스킬은 순차적으로 실행하고, 완료 후 다음 스킬로 넘어가세요.

### Q: 스킬 실행 중 에러가 발생하면?
A: `/recover`를 실행하여 중단된 작업을 복구하거나, `/systematic-debugging`으로 원인을 분석하세요.

### Q: 대규모 프로젝트는 어떻게 관리하나요?
A: 50개 이상의 태스크는 `/ultra-thin-orchestrate`를 사용하세요. 컨텍스트 최적화로 안정적인 자동화가 가능합니다.

### Q: 기존 코드가 있는데 명세가 없어요
A: `/reverse`를 실행하여 코드에서 명세를 역추출한 후, `/socrates`로 보완하세요.

### Q: AI 비용이 너무 많이 나와요
A: `/cost-router`가 태스크 복잡도에 따라 적절한 모델을 자동 선택하여 40-70% 비용을 절감합니다.

### Q: 코드 수정 전에 영향 범위를 알고 싶어요
A: `/impact <파일경로>`를 실행하면 위험도, 의존성, 관련 테스트, 권장 검토자를 알려줍니다. Hook이 활성화되어 있으면 Edit 시 자동으로 경고도 표시됩니다.

### Q: 프로젝트 의존성 구조를 파악하고 싶어요
A: `/deps`로 전체 의존성 그래프를 보거나, `/deps --cycles`로 순환 의존성을 확인하세요. `/deps --matrix`로 도메인 간 매트릭스도 볼 수 있습니다.

### Q: 테스트 커버리지가 궁금해요
A: `/coverage`로 전체 현황을 확인하고, `/coverage --threshold 80`으로 기준 미달 파일을 식별하세요. `/coverage --uncovered`로 미커버 영역을 상세히 볼 수 있습니다.

### Q: 프로젝트 전체 구조를 이해하고 싶어요
A: `/architecture`로 전체 개요를 보고, `/architecture domains`, `/architecture api`, `/architecture layers`, `/architecture tech` 서브커맨드로 상세 분석이 가능합니다.

---

**Last Updated**: 2026-02-08 (v3.0.0 - Maintenance Skills + Claude Project Team Integration)
