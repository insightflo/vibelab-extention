---
name: impact
description: 파일/기능 변경 전 영향도 분석. 의존성 추적, 위험도 평가, 관련 테스트 식별. /impact 트리거.
version: 1.0.0
updated: 2026-02-07
---

# Impact Analyzer (변경 영향도 분석)

> **목적**: 파일 수정 전에 **영향 범위, 위험도, 관련 테스트**를 분석하여 안전한 변경을 지원합니다.
>
> **Hook 연동**: `pre-edit-impact-check.js` 훅이 Edit 시 자동으로 영향도를 분석하지만,
> 이 스킬은 **수정 전 사전 조사** 용도로 더 상세한 분석을 제공합니다.
>
> | 구분 | Hook (`pre-edit-impact-check.js`) | Skill (`/impact`) |
> |------|-----------------------------------|-------------------|
> | 시점 | Edit 시 자동 실행 | 사용자 요청 시 |
> | 범위 | 단일 파일 요약 | 상세 분석 + 권장 사항 |
> | 출력 | additionalContext 주입 | 대화형 리포트 |
> | 용도 | 실시간 경고 | 사전 계획 수립 |

---

## 스킬 발동 조건

다음 명령어 또는 자연어로 이 스킬을 호출할 수 있습니다:

- `/impact <파일경로>`
- `/impact analyze <파일경로>`
- `/영향도 <파일경로>`
- "이 파일 수정하면 어디에 영향 가?"
- "변경 영향도 분석해줘"

---

## 절대 금지 사항

1. **코드를 직접 수정하지 마세요** - 이 스킬은 분석 전용입니다.
2. **추측으로 의존성을 판단하지 마세요** - 반드시 실제 import/require 구문을 파싱하세요.
3. **분석 없이 위험도를 단정하지 마세요** - 파일 경로 패턴과 실제 의존성을 모두 확인하세요.

---

## 실행 단계 (Execution Steps)

이 스킬이 발동되면 다음 순서로 작업을 수행합니다:

```
/impact <파일경로> 수신
    |
    v
[1] 대상 파일 유효성 확인
    |
    v
[2] 위험도 분류 (Risk Classification)
    |
    v
[3] 직접 의존성 분석 (Direct Dependents)
    |
    v
[4] 간접 의존성 분석 (Indirect Dependents)
    |
    v
[5] 영향 받는 도메인 식별
    |
    v
[6] 관련 테스트 탐색
    |
    v
[7] 권장 검토자 결정
    |
    v
[8] 영향도 리포트 출력
```

---

### 1단계: 대상 파일 유효성 확인

```bash
# 파일 존재 여부 확인
ls -la <파일경로>

# 파일 타입 확인 (지원: .py, .js, .ts, .jsx, .tsx, .vue, .svelte)
```

파일이 존재하지 않으면 오류를 보고하고 종료합니다.

### 2단계: 위험도 분류 (Risk Classification)

파일 경로 패턴을 기반으로 위험도를 분류합니다. `pre-edit-impact-check.js`의 `classifyRiskLevel()` 로직과 동일한 기준을 사용합니다.

#### 위험도 기준

| 위험도 | 패턴 | 설명 | 필수 조치 |
|--------|------|------|-----------|
| **CRITICAL** | `payment`, `billing`, `auth`, `security`, `encryption`, `crypto`, `jwt`, `oauth`, `password`, `credential`, `session_manager`, `token_manager` | 금융/보안 핵심 영역 | 전체 테스트 + 커버리지 + 리뷰 필수 |
| **HIGH** | `services/*.(py\|js\|ts)`, `core/`, `middleware/`, `shared/`, `infrastructure/`, `base_(service\|model\|repository)` | 핵심 비즈니스 로직 | 관련 테스트 스위트 실행 |
| **MEDIUM** | `api/`, `routes/`, `models/`, `schemas/`, `controllers/`, `repositories/`, `migrations/`, `entities/`, `domain/`, `database/` | 인터페이스/데이터 모델 | 계약 호환성 확인 |
| **LOW** | `tests/`, `utils/`, `config/`, `docs/`, `fixtures/` 등 | 유틸리티/테스트 | 표준 리뷰 |

#### 커스텀 위험 영역

프로젝트에 `.claude/risk-areas.yaml`이 있으면 해당 설정을 우선 적용합니다:

```yaml
# .claude/risk-areas.yaml (선택적)
critical:
  patterns:
    - "**/payment/**"
    - "**/billing/**"
    - "**/auth/**"
  reason: "금융/보안 핵심 영역"
  required_review: ["qa-manager", "chief-architect"]

high:
  patterns:
    - "**/services/*_service.py"
    - "**/core/**"
  reason: "핵심 비즈니스 로직"
  required_review: ["part-leader"]
```

### 3단계: 직접 의존성 분석 (Direct Dependents)

대상 파일을 **import하거나 require하는** 모든 파일을 탐색합니다.

**분석 방법:**

1. 프로젝트 내 모든 소스 파일을 탐색 (`.py`, `.js`, `.ts`, `.jsx`, `.tsx`)
2. 각 파일의 import/require 구문을 파싱
3. 대상 파일을 참조하는 파일 목록을 수집

**지원하는 import 패턴:**

| 언어 | 패턴 | 예시 |
|------|------|------|
| Python | `from x.y import z` | `from services.user_service import UserService` |
| Python | `from .relative import z` | `from .models import User` |
| Python | `import x.y.z` | `import services.user_service` |
| JS/TS | `import ... from '...'` | `import { UserService } from './user_service'` |
| JS/TS | `require('...')` | `const userService = require('./user_service')` |

**실행 방법:**

```bash
# Python 파일인 경우: 대상 모듈명으로 grep
# 예: src/services/user_service.py 분석 시
grep -rn "from.*user_service\|import.*user_service" --include="*.py" .

# JS/TS 파일인 경우
grep -rn "from.*user_service\|require.*user_service" --include="*.ts" --include="*.js" .
```

### 4단계: 간접 의존성 분석 (Indirect Dependents)

대상 파일이 **API 엔드포인트를 정의**하는 경우, 해당 API를 호출하는 파일을 탐색합니다.

**분석 방법:**

1. 대상 파일에서 API 엔드포인트 정의를 감지
   - FastAPI: `@router.get("/path")`, `@app.post("/path")`
   - Express: `router.get('/path', handler)`
   - Flask: `@app.route("/path")`
2. 해당 API 경로를 참조하는 다른 파일을 탐색
3. 프론트엔드 파일, 외부 API 클라이언트도 포함

**추가 간접 의존성 유형:**

| 유형 | 설명 | 탐색 방법 |
|------|------|-----------|
| API 호출 | 엔드포인트를 호출하는 클라이언트 | API 경로 문자열 grep |
| 이벤트 구독 | 이벤트를 발행/구독하는 파일 | 이벤트명 grep |
| 설정 참조 | 설정값을 사용하는 파일 | 설정 키 grep |

### 5단계: 영향 받는 도메인 식별

의존성 분석 결과를 기반으로 영향 받는 도메인을 식별합니다.

**도메인 식별 기준:**

1. 디렉토리 구조 기반: `domains/<도메인명>/`, `src/<도메인명>/`
2. 파일 경로 기반: 첫 번째 또는 두 번째 디렉토리명을 도메인으로 추정
3. `.claude/project-team.yaml`의 도메인 정의가 있으면 해당 설정 우선 적용

```
영향 도메인 판별:
  대상 파일: order/services/discount_service.py → order 도메인
  직접 의존: order/api/router.py → order 도메인 (동일)
  간접 의존: payment/services/checkout.py → payment 도메인 (교차!)
```

### 6단계: 관련 테스트 탐색

대상 파일과 관련된 테스트 파일을 탐색합니다. `pre-edit-impact-check.js`의 `findRelatedTests()` 로직과 동일한 기준을 사용합니다.

**탐색 패턴:**

| 원본 파일 | 탐색 대상 |
|-----------|-----------|
| `user_service.py` | `test_user_service.py`, `user_service_test.py` |
| `userService.ts` | `userService.test.ts`, `userService.spec.ts` |
| `UserController.js` | `__tests__/UserController.test.js` |

**추가 탐색:**

- `tests/` 디렉토리 내에서 파일명에 원본 basename을 포함하는 파일
- 직접 의존 파일의 관련 테스트도 함께 탐색 (영향 범위 테스트)

### 7단계: 권장 검토자 결정

위험도와 영향 도메인을 기반으로 권장 검토자를 결정합니다.

| 위험도 | 권장 검토자 |
|--------|-------------|
| **CRITICAL** | QA Manager + Chief Architect |
| **HIGH** | Part Leader (해당 도메인) |
| **MEDIUM** | Domain Developer (해당 도메인) |
| **LOW** | 일반 코드 리뷰 |

**교차 도메인 영향 시**: 영향 받는 모든 도메인의 Part Leader를 추가합니다.

### 8단계: 영향도 리포트 출력

모든 분석 결과를 종합하여 리포트를 출력합니다.

---

## 출력 형식

### 표준 리포트

```
===========================================================
  Impact Analysis: <파일명>
===========================================================

  Risk Level: <CRITICAL|HIGH|MEDIUM|LOW>
  <위험도 설명>

-----------------------------------------------------------
  Direct Dependents (이 파일을 import하는 곳)
-----------------------------------------------------------
  - <파일경로>:<라인번호>
  - <파일경로>:<라인번호>
  (없으면: None found)

-----------------------------------------------------------
  Indirect Dependents (API 호출 관계)
-----------------------------------------------------------
  - [<METHOD> <경로>] <호출하는 파일>
  (없으면: None found)

-----------------------------------------------------------
  Affected Domains
-----------------------------------------------------------
  - <도메인명> (직접)
  - <도메인명> (간접 - API 호출)

-----------------------------------------------------------
  Related Tests
-----------------------------------------------------------
  - <테스트 파일 경로>
  (없으면: None found - 테스트 작성을 권장합니다!)

-----------------------------------------------------------
  Recommended Actions
-----------------------------------------------------------
  1. 테스트 실행: <테스트 명령어>
  2. 리뷰어: <권장 검토자>
  3. <추가 권장 사항>

===========================================================
```

### CRITICAL/HIGH 위험도일 때 추가 출력

```
-----------------------------------------------------------
  [WARNING] CRITICAL Risk Area
-----------------------------------------------------------
  금융/보안 핵심 영역입니다.

  필수 확인 사항:
  [ ] 변경 사유가 명확한가?
  [ ] 영향 범위를 모두 파악했는가?
  [ ] 테스트 케이스가 준비되었는가?
  [ ] 롤백 계획이 있는가?

  필수 리뷰어: QA Manager, Chief Architect
```

---

## 사용 예시

### 예시 1: 서비스 파일 분석

```
> /impact src/services/user_service.py

===========================================================
  Impact Analysis: user_service.py
===========================================================

  Risk Level: HIGH
  Service/core/middleware layer - business logic changes
  may affect multiple consumers. Run related test suites.

-----------------------------------------------------------
  Direct Dependents (이 파일을 import하는 곳)
-----------------------------------------------------------
  - src/api/routes/user.py:L5
  - src/api/routes/admin.py:L8
  - src/services/order_service.py:L12

-----------------------------------------------------------
  Indirect Dependents (API 호출 관계)
-----------------------------------------------------------
  - [GET /api/users/{id}] frontend/pages/profile.tsx
  - [POST /api/users] frontend/pages/register.tsx

-----------------------------------------------------------
  Affected Domains
-----------------------------------------------------------
  - user (직접)
  - order (간접 - order_service가 user_service를 import)

-----------------------------------------------------------
  Related Tests
-----------------------------------------------------------
  - tests/services/test_user_service.py
  - tests/api/test_user_routes.py

-----------------------------------------------------------
  Recommended Actions
-----------------------------------------------------------
  1. 테스트 실행:
     $ pytest tests/services/test_user_service.py tests/api/test_user_routes.py -v --cov=src/services
  2. 리뷰어: user Part Leader
  3. order 도메인에 변경 사항 공유 권장 (교차 의존성)

  [CAUTION] HIGH risk area.
  Run full test suite for affected modules before proceeding.

===========================================================
```

### 예시 2: 결제 관련 파일 분석

```
> /impact src/api/routes/payment.py

===========================================================
  Impact Analysis: payment.py
===========================================================

  Risk Level: CRITICAL
  Payment/billing/auth/security area - financial or security
  impact. Requires thorough review and full test coverage.

-----------------------------------------------------------
  Direct Dependents (이 파일을 import하는 곳)
-----------------------------------------------------------
  - src/main.py:L22 (router include)

-----------------------------------------------------------
  Indirect Dependents (API 호출 관계)
-----------------------------------------------------------
  - [POST /api/payments] frontend/pages/checkout.tsx
  - [POST /api/payments] mobile/screens/PaymentScreen.tsx
  - [GET /api/payments/{id}] frontend/pages/order-detail.tsx

-----------------------------------------------------------
  Affected Domains
-----------------------------------------------------------
  - payment (직접)
  - order (간접 - checkout 플로우 연관)

-----------------------------------------------------------
  Related Tests
-----------------------------------------------------------
  - tests/api/test_payment.py
  - tests/integration/test_payment_flow.py

-----------------------------------------------------------
  Recommended Actions
-----------------------------------------------------------
  1. 테스트 실행:
     $ pytest tests/api/test_payment.py tests/integration/test_payment_flow.py -v --cov=src/api/routes
  2. 리뷰어: QA Manager, Chief Architect
  3. 결제 관련 수정은 통합 테스트까지 반드시 실행

-----------------------------------------------------------
  [WARNING] CRITICAL Risk Area
-----------------------------------------------------------
  금융/보안 핵심 영역입니다.

  필수 확인 사항:
  [ ] 변경 사유가 명확한가?
  [ ] 영향 범위를 모두 파악했는가?
  [ ] 테스트 케이스가 준비되었는가?
  [ ] 롤백 계획이 있는가?

  필수 리뷰어: QA Manager, Chief Architect

===========================================================
```

### 예시 3: 테스트 파일 분석 (LOW 위험도)

```
> /impact tests/services/test_user_service.py

===========================================================
  Impact Analysis: test_user_service.py
===========================================================

  Risk Level: LOW
  Tests/utils/config/docs area - low blast radius.
  Standard review applies.

-----------------------------------------------------------
  Direct Dependents (이 파일을 import하는 곳)
-----------------------------------------------------------
  None found

-----------------------------------------------------------
  Indirect Dependents (API 호출 관계)
-----------------------------------------------------------
  None found

-----------------------------------------------------------
  Affected Domains
-----------------------------------------------------------
  - user (테스트)

-----------------------------------------------------------
  Related Tests
-----------------------------------------------------------
  (이 파일 자체가 테스트 파일입니다)

-----------------------------------------------------------
  Recommended Actions
-----------------------------------------------------------
  1. 테스트 실행:
     $ pytest tests/services/test_user_service.py -v
  2. 리뷰어: 일반 코드 리뷰
  3. 테스트 수정 시 대상 소스 파일의 동작이 변경되지 않았는지 확인

===========================================================
```

---

## Hook 연동 (pre-edit-impact-check.js)

### 관계 설명

`pre-edit-impact-check.js` 훅은 **Edit 도구 사용 시 자동으로 실행**되며, 이 스킬의 경량 버전입니다.

```
사용자: "user_service.py 수정해줘"
    |
    v
[자동] pre-edit-impact-check.js 실행 (PreToolUse[Edit])
    |-- 위험도 분류 (classifyRiskLevel)
    |-- 직접 의존 파일 탐색 (findDirectDependents)
    |-- 간접 의존 탐색 (findIndirectDependents)
    |-- 관련 테스트 탐색 (findRelatedTests)
    |-- 테스트 명령어 생성 (generateTestCommand)
    |
    v
[additionalContext로 주입] 에이전트가 영향도를 인지한 상태에서 수정 진행
```

### 사전 분석 워크플로우 (권장)

복잡한 수정이나 CRITICAL 영역 작업 시에는 **수정 전에 이 스킬을 먼저 실행**하는 것을 권장합니다:

```
1. /impact <대상 파일>          # 상세 영향도 확인
2. 관련 테스트 실행              # 현재 상태 확인
3. 수정 진행                    # Hook이 자동으로 경고
4. 테스트 재실행                 # 변경 후 검증
```

### Hook 함수 매핑

이 스킬의 각 단계가 훅의 어떤 함수에 대응하는지:

| 스킬 단계 | Hook 함수 | 차이점 |
|-----------|-----------|--------|
| 2단계: 위험도 분류 | `classifyRiskLevel()` | 스킬은 `.claude/risk-areas.yaml` 커스텀 지원 |
| 3단계: 직접 의존성 | `findDirectDependents()` | 스킬은 라인 번호까지 포함 |
| 4단계: 간접 의존성 | `findIndirectDependents()` | 스킬은 이벤트/설정 참조도 포함 |
| 5단계: 도메인 식별 | (없음) | 스킬만의 고유 기능 |
| 6단계: 관련 테스트 | `findRelatedTests()` | 스킬은 의존 파일의 테스트도 탐색 |
| 7단계: 권장 검토자 | (없음) | 스킬만의 고유 기능 |

---

## 관련 스킬 연동

| 스킬 | 연동 시점 | 용도 |
|------|-----------|------|
| `/deps <domain>` | 교차 도메인 영향 발견 시 | 도메인 의존성 시각화 |
| `/coverage <file>` | 관련 테스트 확인 후 | 테스트 커버리지 상세 확인 |
| `/changelog <domain>` | 수정 완료 후 | 변경 이력 기록 확인 |
| `/audit` | 배포 전 | 종합 품질 감사 |

---

## 구현 시 참조 파일

| 파일 | 경로 | 용도 |
|------|------|------|
| Impact Check Hook | `claude-project-team/hooks/pre-edit-impact-check.js` | 핵심 분석 로직 (15개 함수) |
| Risk Area Config | `.claude/risk-areas.yaml` (선택) | 프로젝트별 위험 영역 설정 |
| Project Team Config | `.claude/project-team.yaml` (선택) | 도메인 정의, 에이전트 설정 |
| Quality Gate | `claude-project-team/hooks/QUALITY_GATE.md` | 품질 게이트 기준 |

---

## 설계 문서 참조

- **Section 12.1**: 유지보수 레이어 개요
- **Section 12.3**: Impact Analyzer 상세 명세
- **Section 12.4**: Risk Assessor 위험도 체계
- **Section 12.8**: Maintenance Analyst 에이전트 정의
- **Section 12.9**: 유지보수 워크플로우
