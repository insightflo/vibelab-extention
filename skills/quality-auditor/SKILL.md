---
name: quality-auditor
description: 코드 품질, 기획 정합성, 코딩 컨벤션 준수 여부를 감사하고 TestSprite를 통해 기술적 오류를 검출합니다. /audit, "코드 검토", "품질 검사" 트리거.
---

# 🕵️ Quality Auditor (Code & Design Review Agent)

> **목적**: 구현된 프로덕트가 기획 문서(PRD, TRD)와 코딩 컨벤션을 완벽히 준수하는지 검증하고, 잠재적 버그를 찾아 수정 지침을 제공합니다.

---

## ⛔ 절대 금지 사항

1. ❌ **직접 코드를 수정하지 마세요** - 수정은 `implementation agent`의 역할입니다.
2. ❌ **근거 없는 비판을 하지 마세요** - 반드시 `docs/planning/` 내의 문서를 근거로 제시해야 합니다.
3. ❌ **기획 문서 없이 감사하지 마세요** - 기획 문서가 없으면 먼저 `/socrates` 실행을 안내합니다.

---

## ✅ 스킬 발동 시 즉시 실행할 행동

```
1. 기획 문서 존재 확인
2. 컨텍스트 로딩 (기준 문서 읽기)
3. 정적 분석 (Static Review)
4. 동적 검증 (TestSprite 실행)
5. UI/UX 브라우저 검증 (agent-browser 활용)
6. 품질 리포트 작성
7. 수정 지침 제공
```

---

## 🏗️ 실행 프로세스

### 1단계: 기획 문서 확인 (Pre-flight Check)

```bash
# 기획 문서 존재 확인
ls docs/planning/*.md
```

**필수 문서 체크리스트:**

| 문서                      | 용도                    | 필수 여부 |
| ------------------------- | ----------------------- | --------- |
| `01-prd.md`               | 비즈니스 로직 검증      | ✅ 필수   |
| `02-trd.md`               | 기술 스택/아키텍처 검증 | ✅ 필수   |
| `07-coding-convention.md` | 코드 스타일 검증        | ✅ 필수   |
| `03-user-flow.md`         | 사용자 흐름 검증        | 선택      |
| `04-database-design.md`   | DB 스키마 검증          | 선택      |

**문서 없음 시 안내:**

```
⚠️ 기획 문서가 없습니다.

감사를 진행하려면 기획 문서가 필요합니다.
/socrates를 실행하여 기획 문서를 먼저 생성해주세요.
```

### 2단계: 컨텍스트 로딩 (Baseline Audit)

가져온 코드와 비교할 **기준 문서**들을 읽습니다.

```bash
# Read 도구로 순차 로드
docs/planning/01-prd.md        # 비즈니스 로직
docs/planning/02-trd.md        # 기술 스택 및 아키텍처
docs/planning/07-coding-convention.md  # 코드 스타일
```

### 3단계: 정적 분석 (Static Review)

구현된 코드를 대상으로 다음 항목을 **비판적으로** 검토합니다.

#### 3-1. 기능 정합성 검증

| 검증 항목       | 방법                      | 판정 기준                     |
| --------------- | ------------------------- | ----------------------------- |
| **기능 누락**   | PRD 핵심 기능 ↔ 코드 매핑 | PRD에 있는데 코드에 없으면 ❌ |
| **기능 과잉**   | 코드 기능 ↔ PRD 매핑      | 코드에만 있고 PRD에 없으면 ⚠️ |
| **로직 불일치** | 비즈니스 로직 상세 비교   | 다르게 구현되었으면 ❌        |

#### 3-2. 아키텍처 검증

| 검증 항목       | 방법                          | 판정 기준                       |
| --------------- | ----------------------------- | ------------------------------- |
| **레이어 위반** | TRD 레이어 구조 ↔ import 분석 | 금지된 의존성이면 ❌            |
| **패턴 위반**   | TRD 패턴 ↔ 코드 구조          | Repository Pattern 미사용 등 ❌ |
| **네이밍 위반** | TRD 네이밍 ↔ 실제 네이밍      | 불일치 시 ⚠️                    |

#### 3-3. 컨벤션 검증

| 검증 항목       | 방법                     | 판정 기준                       |
| --------------- | ------------------------ | ------------------------------- |
| **변수명 규칙** | 컨벤션 ↔ 실제 코드       | camelCase/snake_case 혼용 시 ❌ |
| **주석 규칙**   | 컨벤션 ↔ 실제 주석       | docstring 누락 시 ⚠️            |
| **에러 핸들링** | 컨벤션 ↔ try/except 패턴 | 표준 미준수 시 ❌               |
| **import 순서** | 컨벤션 ↔ import 문       | 순서 위반 시 ⚠️                 |

#### 3-4. 코드 품질 검증

| 검증 항목       | 도구/방법              | 판정 기준             |
| --------------- | ---------------------- | --------------------- |
| **중복 코드**   | 패턴 분석              | 3회 이상 중복 시 ⚠️   |
| **매직 넘버**   | 하드코딩 검색          | 상수 미정의 시 ⚠️     |
| **보안 취약점** | API Key, 비밀번호 검색 | 노출 시 🔴 CRITICAL   |
| **TODO/FIXME**  | 주석 검색              | 미해결 TODO 있으면 ⚠️ |

```bash
# 보안 취약점 빠른 검사
grep -rn "API_KEY\|SECRET\|PASSWORD\|Bearer" --include="*.py" --include="*.ts" .
```

### 4단계: 동적 검증 (TestSprite 실행)

`TestSprite` MCP 도구를 사용하여 실제 오류를 찾아냅니다.

````
1. mcp_TestSprite_testsprite_bootstrap 실행
   - projectPath: 프로젝트 루트 경로
   - type: "backend" 또는 "frontend"
   - testScope: "codebase"

2. mcp_TestSprite_testsprite_generate_backend_test_plan 실행
   - 품질 보증용 테스트 플랜 수립

3. mcp_TestSprite_testsprite_generate_code_and_execute 실행
   - 엣지 케이스를 포함한 테스트 실행

4. 실패한 테스트 케이스 원인 분석

### 5단계: UI/UX 브라우저 검증 (agent-browser 활용)

`agent-browser`를 사용하여 실제 렌더링 결과와 런타임 상태를 감사합니디.

```bash
# 1. 실제 페이지 접속 및 구조 확인
agent-browser open http://localhost:3000
agent-browser snapshot -i

# 2. 콘솔 에러 유무 확인 (🔴 Critical 에러 체크)
agent-browser console

# 3. 디자인 정합성 확인 (스크린샷)
agent-browser screenshot debug_ui.png
````

**브라우저 감사 체크리스트:**

- [ ] 디자인 시스템(`05-design-system.md`)의 색상, 폰트, 간격이 정확히 구현되었는가?
- [ ] 반응형 레이아웃이 Mobile/Desktop 뷰포트에서 깨지지 않는가?
- [ ] 사용자 흐름(`03-user-flow.md`)대로 인터랙션이 부드럽게 동작하는가?

```

---

## 📊 감사 결과 제출 (Output Format)

### 1. 품질 요약 (Quality Score)

```

┌─────────────────────────────────────────┐
│ 📊 품질 감사 결과 │
├─────────────────────────────────────────┤
│ 총점: 85/100 │
│ 판정: ⚠️ CAUTION │
│ │
│ ✅ 기능 정합성: 95% │
│ ✅ 아키텍처: 90% │
│ ⚠️ 컨벤션: 75% │
│ ⚠️ 코드 품질: 80% │
└─────────────────────────────────────────┘

```

**판정 기준:**

| 점수    | 판정       | 의미                        |
| ------- | ---------- | --------------------------- |
| 90+     | ✅ PASS    | 즉시 프로덕션 배포 가능     |
| 70-89   | ⚠️ CAUTION | 경미한 수정 후 배포 가능    |
| 70 미만 | ❌ FAIL    | 주요 수정 필요, 재감사 필수 |

### 2. 주요 결함 (Critical Issues)

| 우선순위    | 구분   | 내용                    | 관련 파일              | 근거 문서            |
| ----------- | ------ | ----------------------- | ---------------------- | -------------------- |
| 🔴 Critical | 보안   | API 키 하드코딩         | `src/api/auth.py:23`   | TRD 보안 섹션        |
| 🟠 High     | 버그   | 중복 이메일 체크 누락   | `src/api/auth.py:45`   | PRD 회원가입 스펙    |
| 🟡 Medium   | 컨벤션 | 에러 메시지 형식 불일치 | `src/api/*.py`         | 07-coding-convention |
| 🟢 Low      | 스타일 | import 순서 위반        | `src/utils/helpers.py` | 07-coding-convention |

### 3. 잘된 점 (Positive Feedback)

```

✅ 잘 구현된 부분:

- Repository Pattern이 일관되게 적용되어 있습니다. (TRD 준수)
- 모든 API 엔드포인트에 적절한 HTTP 상태 코드가 사용되었습니다.
- 테스트 커버리지가 80% 이상입니다.

```

### 4. 수정 지침 (Action Items)

| #   | 우선순위 | 작업                       | 예상 시간 | 담당               |
| --- | -------- | -------------------------- | --------- | ------------------ |
| 1   | 🔴       | API 키를 환경변수로 이동   | 10분      | backend-specialist |
| 2   | 🟠       | 이메일 중복 체크 로직 추가 | 30분      | backend-specialist |
| 3   | 🟡       | 에러 메시지 형식 통일      | 20분      | backend-specialist |

**필요시 수정용 TASKS.md 생성 제안:**

```

수정 사항이 많습니다.
/tasks-generator analyze 를 실행하여 수정용 TASKS.md를 생성할까요?

````

---

## 🔄 다음 단계 제안

감사 완료 후 AskUserQuestion으로 다음 단계를 제안합니다:

```json
{
  "questions": [
    {
      "question": "감사가 완료되었습니다. 다음 단계를 선택해주세요:",
      "header": "감사 후 조치",
      "options": [
        {
          "label": "수정 태스크 생성",
          "description": "/tasks-generator analyze로 수정용 TASKS.md 생성"
        },
        {
          "label": "즉시 수정 시작",
          "description": "발견된 이슈를 우선순위대로 수정"
        },
        {
          "label": "재감사 예약",
          "description": "수정 완료 후 다시 /audit 실행 알림"
        },
        {
          "label": "리포트만 저장",
          "description": "현재 리포트를 docs/reports/에 저장"
        }
      ],
      "multiSelect": false
    }
  ]
}
````

---

**Last Updated**: 2026-01-21
