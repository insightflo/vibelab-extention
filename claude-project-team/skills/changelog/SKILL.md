---
name: changelog
description: 프로젝트 변경 이력 조회. 기간별, 도메인별, 유형별 필터링 및 통계. /changelog 트리거.
version: 1.0.0
updated: 2026-02-07
---

# Changelog Viewer (변경 이력 조회)

> **목적**: `changelog-recorder.js` 훅이 자동으로 기록한 **변경 이력을 조회, 필터링, 통계** 합니다.
>
> **Hook 연동**: `changelog-recorder.js` 훅이 PostToolUse[Write|Edit] 시 자동으로
> `.claude/changelog/{YYYY-MM}.yaml`에 변경 내역을 기록합니다.
> 이 스킬은 기록된 데이터를 **읽기 전용으로 조회**합니다.
>
> | 구분 | Hook (`changelog-recorder.js`) | Skill (`/changelog`) |
> |------|--------------------------------|----------------------|
> | 시점 | Write/Edit 시 자동 실행 | 사용자 요청 시 |
> | 동작 | YAML 파일에 엔트리 추가 | YAML 파일 읽기 + 필터 + 통계 |
> | 출력 | additionalContext 주입 | 대화형 리포트 |
> | 용도 | 변경 기록 (쓰기) | 변경 조회 (읽기) |

---

## 스킬 발동 조건

다음 명령어 또는 자연어로 이 스킬을 호출할 수 있습니다:

- `/changelog`
- `/changelog --since <날짜>`
- `/changelog --domain <도메인명>`
- `/changelog --type <변경유형>`
- `/changelog --stats`
- `/변경이력`
- "최근 변경 이력 보여줘"
- "이번 달 변경사항 확인"
- "order 도메인 변경 이력"

---

## 절대 금지 사항

1. **변경 이력을 수정하지 마세요** - 이 스킬은 조회 전용입니다.
2. **YAML 파일을 직접 편집하지 마세요** - `changelog-recorder.js` 훅만 기록합니다.
3. **존재하지 않는 엔트리를 추측하지 마세요** - 반드시 실제 YAML 파일을 파싱하세요.

---

## 명령어 옵션

| 옵션 | 설명 | 예시 |
|------|------|------|
| (없음) | 현재 월의 최근 변경 이력 (최대 20건) | `/changelog` |
| `--since <날짜>` | 특정 날짜 이후의 변경 이력 | `/changelog --since 2026-02-01` |
| `--until <날짜>` | 특정 날짜 이전의 변경 이력 | `/changelog --until 2026-02-07` |
| `--last <기간>` | 최근 N일/주 변경 이력 | `/changelog --last 7d`, `--last 2w` |
| `--domain <이름>` | 특정 도메인만 필터 | `/changelog --domain order` |
| `--type <유형>` | 특정 변경 유형만 필터 | `/changelog --type fix` |
| `--stats` | 변경 통계 출력 | `/changelog --stats` |
| `--file <경로>` | 특정 파일의 변경 이력 | `/changelog --file order/services/discount_service.py` |

**옵션 조합 가능:**

```
/changelog --domain order --type fix --last 7d
/changelog --since 2026-02-01 --until 2026-02-07 --stats
/changelog --domain payment --stats
```

---

## 실행 단계 (Execution Steps)

이 스킬이 발동되면 다음 순서로 작업을 수행합니다:

```
/changelog [옵션] 수신
    |
    v
[1] 옵션 파싱 (필터 조건 추출)
    |
    v
[2] 대상 YAML 파일 결정 (날짜 범위 기반)
    |
    v
[3] YAML 파일 읽기 및 파싱
    |
    v
[4] 필터 적용 (도메인, 유형, 파일, 날짜)
    |
    v
[5] 정렬 (최신순)
    |
    v
[6] 리포트 출력 (또는 통계 출력)
```

---

### 1단계: 옵션 파싱

사용자 입력에서 필터 조건을 추출합니다.

**파싱 규칙:**

| 입력 패턴 | 추출 결과 |
|-----------|-----------|
| `--since 2026-02-01` | `since = 2026-02-01T00:00:00` |
| `--until 2026-02-07` | `until = 2026-02-07T23:59:59` |
| `--last 7d` | `since = (오늘 - 7일)` |
| `--last 2w` | `since = (오늘 - 14일)` |
| `--last 1m` | `since = (오늘 - 30일)` |
| `--domain order` | `domain = "order"` |
| `--type fix` | `type = "fix"` |
| `--stats` | `mode = "stats"` |
| `--file path/to/file.py` | `file = "path/to/file.py"` |
| (인자 없음) | 현재 월, 최근 20건 |

**자연어 변환:**

| 자연어 | 변환 결과 |
|--------|-----------|
| "최근 변경 이력" | `/changelog` (기본) |
| "이번 달 변경사항" | `/changelog --last 1m` |
| "order 도메인 변경" | `/changelog --domain order` |
| "버그 수정 이력" | `/changelog --type fix` |
| "변경 통계" | `/changelog --stats` |

### 2단계: 대상 YAML 파일 결정

날짜 범위를 기반으로 읽어야 할 YAML 파일을 결정합니다.

**저장 위치:** `.claude/changelog/{YYYY-MM}.yaml`

**파일 결정 로직:**

```
날짜 범위가 없으면:
  -> 현재 월 파일만 (.claude/changelog/2026-02.yaml)

--since 2026-01-15 --until 2026-02-07:
  -> 2026-01.yaml + 2026-02.yaml (2개 파일)

--last 7d (2026-02-07 기준):
  -> 2026-02.yaml만 (7일 범위가 2월 내)

--last 2w (2026-02-07 기준):
  -> 2026-01.yaml + 2026-02.yaml (14일이므로 1월도 포함)
```

**YAML 파일 탐색:**

```bash
# 프로젝트 루트 기준 changelog 디렉토리의 YAML 파일 목록
ls .claude/changelog/*.yaml
```

파일이 없으면 "변경 이력이 없습니다."를 출력하고 종료합니다.

### 3단계: YAML 파일 읽기 및 파싱

`changelog-recorder.js`가 생성한 YAML 형식을 파싱합니다.

**엔트리 형식 (YAML):**

```yaml
entries:
  - date: 2026-02-07T14:30:00
    type: feature
    domain: order
    files:
      - order/services/discount_service.py
      - order/schemas/discount.py
    description: "Create discount_service in order"
    impact:
      - "external dependency added: member-api"
```

**파싱 시 주의사항:**

- `date` 필드는 ISO 8601 형식 (`YYYY-MM-DDTHH:MM:SS`)
- `type` 필드: `feature`, `fix`, `refactor`, `docs`, `test` 중 하나
- `domain` 필드: 도메인명 문자열
- `files` 필드: 프로젝트 상대 경로 배열
- `description` 필드: YAML 문자열 (따옴표 포함 가능)
- `impact` 필드: 영향도 설명 배열 (빈 경우 `["none"]`)

**파싱 방법:**

YAML 파일을 Read 도구로 읽은 후, 다음 규칙으로 파싱합니다:

1. `entries:` 헤더를 찾아 건너뜁니다
2. `- date:` 로 시작하는 줄이 새 엔트리의 시작입니다
3. 이후 `type:`, `domain:`, `files:`, `description:`, `impact:` 필드를 순서대로 추출합니다
4. `files:` 와 `impact:` 아래의 `- ` 항목은 배열로 수집합니다
5. 따옴표로 감싼 값은 따옴표를 벗깁니다

### 4단계: 필터 적용

파싱된 엔트리에 필터 조건을 적용합니다.

**필터 적용 순서:**

1. **날짜 필터** (`--since`, `--until`, `--last`):
   - 엔트리의 `date` 필드와 비교
   - ISO 8601 문자열 비교 (사전순 비교 가능)

2. **도메인 필터** (`--domain`):
   - 엔트리의 `domain` 필드와 대소문자 무시 비교
   - 부분 일치 지원: `--domain order`는 `order`, `order-api` 모두 매칭

3. **유형 필터** (`--type`):
   - 엔트리의 `type` 필드와 정확히 일치
   - 유효한 유형: `feature`, `fix`, `refactor`, `docs`, `test`

4. **파일 필터** (`--file`):
   - 엔트리의 `files` 배열에서 부분 문자열 일치
   - `--file discount_service.py`는 `order/services/discount_service.py`에 매칭

**필터가 없으면:** 현재 월 전체 엔트리를 최신순으로 최대 20건 반환합니다.

### 5단계: 정렬

필터링된 엔트리를 **최신순** (날짜 내림차순)으로 정렬합니다.

### 6단계: 리포트 출력

모드에 따라 다른 형식으로 출력합니다:

- **기본 모드**: 변경 이력 목록
- **통계 모드** (`--stats`): 도메인별/유형별 통계

---

## 출력 형식

### 기본 리포트 (변경 이력 목록)

```
===========================================================
  Changelog: <필터 설명>
===========================================================

  Period: <시작일> ~ <종료일>
  Total: <N건>

-----------------------------------------------------------
  2026-02-07 (3건)
-----------------------------------------------------------
  [Feature] Create discount_service in order
     domain: order
     files:  order/services/discount_service.py
             order/schemas/discount.py
     impact: external dependency added: member-api

  [Fix] Fix issue in payment_service
     domain: payment
     files:  payment/services/payment_service.py
     impact: none

  [Refactor] Refactor order_service
     domain: order
     files:  order/services/order_service.py
     impact: none

-----------------------------------------------------------
  2026-02-06 (1건)
-----------------------------------------------------------
  [Test] Update test test_discount.py
     domain: order
     files:  tests/order/test_discount.py
     impact: none

===========================================================
```

### 도메인 필터 리포트

```
===========================================================
  Changelog: order domain
===========================================================

  Period: 2026-02-01 ~ 2026-02-07
  Total: 5건 (order domain)

-----------------------------------------------------------
  2026-02-07 (2건)
-----------------------------------------------------------
  [Feature] Create discount_service in order
     files:  order/services/discount_service.py
             order/schemas/discount.py
     impact: external dependency added: member-api

  [Refactor] Refactor order_service
     files:  order/services/order_service.py
     impact: none

-----------------------------------------------------------
  2026-02-05 (3건)
-----------------------------------------------------------
  [Feature] Add new functionality to order_api in order
     files:  order/api/router.py
     impact: API endpoint modification

  [Fix] Fix issue in order_validator
     files:  order/validators/order_validator.py
     impact: none

  [Test] Add test file test_order_api.py
     files:  tests/order/test_order_api.py
     impact: none

===========================================================
```

### 유형 필터 리포트

```
===========================================================
  Changelog: fix changes
===========================================================

  Period: last 7 days
  Total: 3건 (type: fix)

-----------------------------------------------------------
  2026-02-07
-----------------------------------------------------------
  [Fix] Fix issue in payment_service
     domain: payment
     files:  payment/services/payment_service.py
     impact: none

-----------------------------------------------------------
  2026-02-05
-----------------------------------------------------------
  [Fix] Fix issue in order_validator
     domain: order
     files:  order/validators/order_validator.py
     impact: none

  [Fix] Fix issue in auth_middleware
     domain: auth
     files:  src/middleware/auth_middleware.py
     impact: API endpoint modification

===========================================================
```

### 통계 리포트 (`--stats`)

```
===========================================================
  Changelog Statistics
===========================================================

  Period: 2026-02-01 ~ 2026-02-07
  Total changes: 24건

-----------------------------------------------------------
  By Domain
-----------------------------------------------------------
  order       ############ 12건 (50.0%)
  payment     ######       6건 (25.0%)
  auth        ###          3건 (12.5%)
  root        ##           2건 ( 8.3%)
  member      #            1건 ( 4.2%)

-----------------------------------------------------------
  By Type
-----------------------------------------------------------
  feature     ############ 12건 (50.0%)
  fix         ######       6건 (25.0%)
  refactor    ###          3건 (12.5%)
  test        ##           2건 ( 8.3%)
  docs        #            1건 ( 4.2%)

-----------------------------------------------------------
  By Day
-----------------------------------------------------------
  02-07       ########     8건
  02-06       #####        5건
  02-05       ####         4건
  02-04       ###          3건
  02-03       ##           2건
  02-02       #            1건
  02-01       #            1건

-----------------------------------------------------------
  Most Changed Files (Top 5)
-----------------------------------------------------------
  1. order/services/discount_service.py    (4 changes)
  2. payment/services/payment_service.py   (3 changes)
  3. order/api/router.py                   (2 changes)
  4. src/middleware/auth_middleware.py       (2 changes)
  5. order/schemas/discount.py             (1 change)

-----------------------------------------------------------
  Most Active Domains by Type
-----------------------------------------------------------
  order:    feature(5) fix(3) refactor(2) test(2)
  payment:  fix(3) feature(2) refactor(1)
  auth:     feature(1) fix(1) refactor(1)

===========================================================
```

### 도메인 + 통계 조합 리포트

```
===========================================================
  Changelog Statistics: order domain
===========================================================

  Period: 2026-02-01 ~ 2026-02-07
  Total changes: 12건 (order domain)

-----------------------------------------------------------
  By Type
-----------------------------------------------------------
  feature     ######       6건 (50.0%)
  fix         ###          3건 (25.0%)
  refactor    ##           2건 (16.7%)
  test        #            1건 ( 8.3%)

-----------------------------------------------------------
  By Day
-----------------------------------------------------------
  02-07       ####         4건
  02-06       ###          3건
  02-05       ###          3건
  02-03       ##           2건

-----------------------------------------------------------
  Most Changed Files (Top 5)
-----------------------------------------------------------
  1. order/services/discount_service.py    (4 changes)
  2. order/api/router.py                   (2 changes)
  3. order/schemas/discount.py             (1 change)
  4. order/services/order_service.py       (1 change)
  5. order/validators/order_validator.py   (1 change)

===========================================================
```

### 파일 필터 리포트

```
===========================================================
  Changelog: discount_service.py
===========================================================

  Period: all available
  Total: 4건 (file: discount_service.py)

-----------------------------------------------------------
  Change History
-----------------------------------------------------------
  2026-02-07T14:30  [Feature] Create discount_service in order
  2026-02-06T10:15  [Refactor] Refactor discount_service
  2026-02-05T16:45  [Fix] Fix issue in discount_service
  2026-02-03T09:00  [Feature] Add new functionality to discount_service in order

===========================================================
```

### 변경 이력이 없을 때

```
===========================================================
  Changelog: <필터 설명>
===========================================================

  No changes found.

  Possible reasons:
  - changelog-recorder.js 훅이 아직 실행되지 않았습니다
  - .claude/changelog/ 디렉토리에 YAML 파일이 없습니다
  - 필터 조건에 해당하는 변경 이력이 없습니다

  Tip: 소스 파일을 수정하면 훅이 자동으로 변경 이력을 기록합니다.

===========================================================
```

---

## 사용 예시

### 예시 1: 기본 조회 (현재 월 최근 이력)

```
> /changelog

===========================================================
  Changelog: February 2026
===========================================================

  Period: 2026-02-01 ~ 2026-02-07
  Total: 15건

-----------------------------------------------------------
  2026-02-07 (3건)
-----------------------------------------------------------
  [Feature] Create discount_service in order
     domain: order
     files:  order/services/discount_service.py
     impact: external dependency added: member-api

  [Fix] Fix issue in payment_service
     domain: payment
     files:  payment/services/payment_service.py
     impact: none

  [Refactor] Refactor order_service
     domain: order
     files:  order/services/order_service.py
     impact: none

  ... (12건 더)

===========================================================
```

### 예시 2: 도메인 + 기간 필터

```
> /changelog --domain order --last 7d

===========================================================
  Changelog: order domain (last 7 days)
===========================================================

  Period: 2026-02-01 ~ 2026-02-07
  Total: 5건 (order domain)

-----------------------------------------------------------
  2026-02-07 (2건)
-----------------------------------------------------------
  [Feature] Create discount_service in order
     files:  order/services/discount_service.py
             order/schemas/discount.py
     impact: external dependency added: member-api

  [Refactor] Refactor order_service
     files:  order/services/order_service.py
     impact: none

-----------------------------------------------------------
  2026-02-05 (3건)
-----------------------------------------------------------
  [Feature] Add new functionality to order_api in order
     files:  order/api/router.py
     impact: API endpoint modification

  [Fix] Fix issue in order_validator
     files:  order/validators/order_validator.py
     impact: none

  [Test] Add test file test_order_api.py
     files:  tests/order/test_order_api.py
     impact: none

===========================================================
```

### 예시 3: 버그 수정 이력만 조회

```
> /changelog --type fix

===========================================================
  Changelog: fix changes (February 2026)
===========================================================

  Period: 2026-02-01 ~ 2026-02-07
  Total: 6건 (type: fix)

-----------------------------------------------------------
  2026-02-07
-----------------------------------------------------------
  [Fix] Fix issue in payment_service
     domain: payment
     files:  payment/services/payment_service.py
     impact: none

-----------------------------------------------------------
  2026-02-05
-----------------------------------------------------------
  [Fix] Fix issue in order_validator
     domain: order
     files:  order/validators/order_validator.py
     impact: none

  [Fix] Fix issue in auth_middleware
     domain: auth
     files:  src/middleware/auth_middleware.py
     impact: API endpoint modification

  ... (3건 더)

===========================================================
```

### 예시 4: 변경 통계

```
> /changelog --stats

===========================================================
  Changelog Statistics (February 2026)
===========================================================

  Period: 2026-02-01 ~ 2026-02-07
  Total changes: 24건

-----------------------------------------------------------
  By Domain
-----------------------------------------------------------
  order       ############ 12건 (50.0%)
  payment     ######       6건 (25.0%)
  auth        ###          3건 (12.5%)
  root        ##           2건 ( 8.3%)
  member      #            1건 ( 4.2%)

-----------------------------------------------------------
  By Type
-----------------------------------------------------------
  feature     ############ 12건 (50.0%)
  fix         ######       6건 (25.0%)
  refactor    ###          3건 (12.5%)
  test        ##           2건 ( 8.3%)
  docs        #            1건 ( 4.2%)

-----------------------------------------------------------
  By Day
-----------------------------------------------------------
  02-07       ########     8건
  02-06       #####        5건
  02-05       ####         4건
  02-04       ###          3건
  02-03       ##           2건
  02-02       #            1건
  02-01       #            1건

-----------------------------------------------------------
  Most Changed Files (Top 5)
-----------------------------------------------------------
  1. order/services/discount_service.py    (4 changes)
  2. payment/services/payment_service.py   (3 changes)
  3. order/api/router.py                   (2 changes)
  4. src/middleware/auth_middleware.py       (2 changes)
  5. order/schemas/discount.py             (1 change)

===========================================================
```

### 예시 5: 도메인별 통계

```
> /changelog --domain payment --stats

===========================================================
  Changelog Statistics: payment domain
===========================================================

  Period: 2026-02-01 ~ 2026-02-07
  Total changes: 6건 (payment domain)

-----------------------------------------------------------
  By Type
-----------------------------------------------------------
  fix         ###          3건 (50.0%)
  feature     ##           2건 (33.3%)
  refactor    #            1건 (16.7%)

-----------------------------------------------------------
  By Day
-----------------------------------------------------------
  02-07       ##           2건
  02-06       ##           2건
  02-05       #            1건
  02-03       #            1건

-----------------------------------------------------------
  Most Changed Files (Top 3)
-----------------------------------------------------------
  1. payment/services/payment_service.py   (3 changes)
  2. payment/api/router.py                 (2 changes)
  3. payment/models/transaction.py         (1 change)

===========================================================
```

### 예시 6: 특정 파일의 변경 이력

```
> /changelog --file discount_service.py

===========================================================
  Changelog: discount_service.py
===========================================================

  Period: all available
  Total: 4건 (file: discount_service.py)

-----------------------------------------------------------
  Change History
-----------------------------------------------------------
  2026-02-07T14:30  [Feature] Create discount_service in order
                    impact: external dependency added: member-api

  2026-02-06T10:15  [Refactor] Refactor discount_service
                    impact: none

  2026-02-05T16:45  [Fix] Fix issue in discount_service
                    impact: none

  2026-02-03T09:00  [Feature] Add new functionality to discount_service in order
                    impact: internal dependency added: order.models

===========================================================
```

---

## Hook 연동 (changelog-recorder.js)

### 관계 설명

`changelog-recorder.js` 훅은 **Write/Edit 도구 사용 시 자동으로 실행**되며 변경 이력을 기록합니다.
이 스킬은 훅이 기록한 데이터를 **읽기 전용으로 조회**합니다.

```
[changelog-recorder.js] ----기록----> .claude/changelog/{YYYY-MM}.yaml
                                              |
                                         읽기 전용
                                              |
[/changelog 스킬] <----조회----> 사용자에게 리포트 출력
```

### 데이터 흐름

```
사용자: "discount_service.py 구현해줘"
    |
    v
[Claude: Write 실행] --> discount_service.py 생성
    |
    v
[자동] changelog-recorder.js 실행 (PostToolUse[Write])
    |-- 도메인 추출: order (경로 패턴 분석)
    |-- 변경 유형 감지: feature (새 파일 생성)
    |-- 설명 생성: "Create discount_service in order"
    |-- 영향도 감지: external dependency added
    |
    v
[기록] .claude/changelog/2026-02.yaml에 엔트리 추가

    ...이후...

사용자: "/changelog --domain order"
    |
    v
[이 스킬 실행]
    |-- .claude/changelog/2026-02.yaml 읽기
    |-- domain == "order" 필터 적용
    |-- 최신순 정렬
    |
    v
[리포트 출력]
```

### 엔트리 필드 설명 (changelog-recorder.js 기준)

| 필드 | 생성 방식 | 설명 |
|------|-----------|------|
| `date` | `new Date().toISOString()` | 변경 시각 (초 단위) |
| `type` | `detectChangeType()` | `feature`, `fix`, `refactor`, `docs`, `test` |
| `domain` | `extractDomain()` | 파일 경로에서 도메인 추출 |
| `files` | `toRelativePath()` | 프로젝트 상대 경로 배열 |
| `description` | `generateDescription()` | 변경 요약 |
| `impact` | `detectImpact()` | 의존성/API/모델 영향 |

### 도메인 추출 규칙 (changelog-recorder.js와 동일)

| 경로 패턴 | 추출 도메인 |
|-----------|-------------|
| `src/domains/<domain>/...` | `<domain>` |
| `app/domains/<domain>/...` | `<domain>` |
| `domains/<domain>/...` | `<domain>` |
| `packages/<domain>/...` | `<domain>` |
| `modules/<domain>/...` | `<domain>` |
| `app/api/routes/<domain>.py` | `<domain>` |
| `app/services/<domain>_service.py` | `<domain>` |
| `app/models/<domain>.py` | `<domain>` |
| (해당 없음) | `root` |

### 변경 유형 판별 규칙 (changelog-recorder.js와 동일)

| 유형 | 판별 기준 |
|------|-----------|
| `test` | 파일 경로에 `tests/`, `test_`, `.test.`, `.spec.` 포함 |
| `docs` | 확장자 `.md`, `.rst`, `.txt`, `.adoc`, `.mdx` |
| `feature` | 새 파일 생성 또는 새 함수/클래스 추가 |
| `fix` | 주석에 fix/bug/patch 키워드 또는 에러 핸들링 추가 |
| `refactor` | 주석에 refactor/restructure 키워드 또는 유사 크기 변경 |

---

## 구현 상세: YAML 파싱 방법

YAML 파일을 Read 도구로 읽은 후 다음 규칙으로 파싱합니다.

**전체 파싱 절차:**

```
1. Read 도구로 .claude/changelog/{YYYY-MM}.yaml 읽기
2. 줄 단위로 분할
3. "entries:" 줄은 건너뜀
4. "  - date:" 패턴 발견 시 새 엔트리 시작
5. 이어지는 줄에서 type, domain, description 추출
6. "    files:" 헤더 아래의 "      - " 항목을 배열로 수집
7. "    impact:" 헤더 아래의 "      - " 항목을 배열로 수집
8. 다음 "  - date:" 발견 시 현재 엔트리 완료, 새 엔트리 시작
```

**따옴표 처리:**
- `"value"` -> `value` (더블 따옴표 제거)
- `'value'` -> `value` (싱글 따옴표 제거)
- `value` -> `value` (따옴표 없으면 그대로)

---

## 통계 계산 방법

### 도메인별 집계

```
entries를 domain 필드로 그룹핑
각 그룹의 건수 계산
건수 내림차순 정렬
비율(%) = (그룹 건수 / 전체 건수) * 100
```

### 유형별 집계

```
entries를 type 필드로 그룹핑
각 그룹의 건수 계산
건수 내림차순 정렬
비율(%) = (그룹 건수 / 전체 건수) * 100
```

### 일별 집계

```
entries의 date 필드에서 날짜(YYYY-MM-DD) 추출
날짜별 건수 계산
날짜 내림차순 정렬
```

### 파일별 집계 (Most Changed Files)

```
모든 entries의 files 배열을 풀어서 단일 리스트화
파일 경로별 등장 횟수 계산
횟수 내림차순 정렬
상위 5개 표시
```

### 막대 그래프 표현

```
최대값 = 가장 건수가 많은 항목
최대 막대 길이 = 12자 (#)
각 항목의 막대 = round(건수 / 최대값 * 12)
최소 1자 보장 (건수 > 0이면)
```

---

## 관련 스킬 연동

| 스킬 | 연동 시점 | 용도 |
|------|-----------|------|
| `/impact <file>` | 변경이 많은 파일 발견 시 | 해당 파일의 영향도 분석 |
| `/deps <domain>` | 교차 도메인 변경 발견 시 | 도메인 의존성 확인 |
| `/coverage <file>` | 변경이 잦은 파일 발견 시 | 테스트 커버리지 확인 |

**연동 안내 예시:**

```
Tip: order 도메인에 변경이 집중되어 있습니다.
  -> /impact order/services/discount_service.py  (영향도 분석)
  -> /deps order                                 (의존성 확인)
```

---

## 구현 시 참조 파일

| 파일 | 경로 | 용도 |
|------|------|------|
| Changelog Recorder Hook | `claude-project-team/hooks/changelog-recorder.js` | YAML 형식, 파싱, 도메인/유형 추출 로직 |
| Changelog YAML 파일 | `.claude/changelog/{YYYY-MM}.yaml` | 실제 변경 이력 데이터 |
| Impact Skill | `claude-project-team/skills/impact/SKILL.md` | 관련 스킬 참조 |

---

## 설계 문서 참조

- **Section 12.6**: Change Log (변경 이력) - YAML 형식 정의
- **Section 12.10**: 유지보수 Hook 목록 - changelog-recorder.js 명세
- **Section 12.11**: 유지보수 스킬 목록 - /changelog 스킬 정의
