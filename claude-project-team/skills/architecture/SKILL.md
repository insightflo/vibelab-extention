---
name: architecture
description: 프로젝트 아키텍처 맵 조회 및 시각화. 도메인 구조, API 카탈로그, 레이어 구조, 기술 스택 분석. /architecture 트리거.
version: 1.0.0
updated: 2026-02-08
---

# Architecture Map (아키텍처 맵 조회)

> **목적**: 프로젝트의 **전체 아키텍처를 조회하고 시각화**합니다.
> 도메인 구조, API 카탈로그, 레이어 구조, 기술 스택 정보를 한눈에 파악할 수 있습니다.
>
> **Hook 연동**: `architecture-updater.js` 훅이 Write/Edit 시 자동으로 아키텍처 문서를 업데이트하지만,
> 이 스킬은 **사용자 요청에 따라 정리된 형태로 조회/시각화**하는 용도입니다.
>
> | 구분 | Hook (`architecture-updater.js`) | Skill (`/architecture`) |
> |------|----------------------------------|------------------------|
> | 시점 | Write/Edit 후 자동 실행 | 사용자 요청 시 |
> | 범위 | 변경된 파일 기준 증분 업데이트 | 전체 또는 서브커맨드별 조회 |
> | 출력 | `.claude/architecture/` 문서 자동 갱신 | 대화형 시각화 리포트 |
> | 용도 | 문서 자동 유지 | 아키텍처 이해, 온보딩, 리뷰 |

---

## 스킬 발동 조건

다음 명령어 또는 자연어로 이 스킬을 호출할 수 있습니다:

- `/architecture` - 전체 아키텍처 개요
- `/architecture domains` - 도메인 구조 시각화
- `/architecture api` - API 카탈로그
- `/architecture layers` - 레이어별 구조
- `/architecture tech` - 기술 스택 정보
- `/architecture <도메인명>` - 특정 도메인 상세
- "아키텍처 보여줘"
- "전체 구조 파악하고 싶어"
- "API 목록 보여줘"
- "기술 스택이 뭐야?"
- "도메인 구조 시각화해줘"

---

## 절대 금지 사항

1. **코드를 직접 수정하지 마세요** - 이 스킬은 조회/시각화 전용입니다.
2. **추측으로 구조를 판단하지 마세요** - 반드시 실제 파일 시스템과 코드를 기반으로 분석하세요.
3. **존재하지 않는 파일이나 도메인을 보고하지 마세요** - 실제 탐색 결과만 사용하세요.
4. **아키텍처 문서를 직접 생성/수정하지 마세요** - 문서 생성은 `architecture-updater.js` 훅의 책임입니다.

---

## 실행 단계 (Execution Steps)

이 스킬이 발동되면 다음 순서로 작업을 수행합니다:

```
/architecture [서브커맨드] 수신
    |
    v
[1] 서브커맨드 파싱 (Subcommand Resolution)
    |
    v
[2] 기존 아키텍처 문서 확인 (Architecture Doc Discovery)
    |
    v
[3] 프로젝트 구조 탐색 (Project Structure Scan)
    |
    v
[4] 서브커맨드별 분석 (Targeted Analysis)
    |
    +--> (없음/전체): 전체 아키텍처 개요
    +--> domains: 도메인 구조 분석
    +--> api: API 엔드포인트 수집
    +--> layers: 레이어 구조 분석
    +--> tech: 기술 스택 감지
    +--> <도메인명>: 특정 도메인 상세
    |
    v
[5] 시각화 출력 (Visualization Output)
```

---

### 1단계: 서브커맨드 파싱 (Subcommand Resolution)

사용자 입력을 분석하여 서브커맨드를 결정합니다.

| 입력 | 서브커맨드 | 설명 |
|------|-----------|------|
| `/architecture` | `overview` | 전체 아키텍처 개요 |
| `/architecture domains` | `domains` | 도메인 구조 시각화 |
| `/architecture api` | `api` | API 카탈로그 |
| `/architecture layers` | `layers` | 레이어별 구조 |
| `/architecture tech` | `tech` | 기술 스택 정보 |
| `/architecture <도메인명>` | `domain-detail` | 특정 도메인 상세 |

**서브커맨드 결정 로직:**

1. 예약 키워드(`domains`, `api`, `layers`, `tech`)와 정확히 일치하면 해당 서브커맨드
2. 예약 키워드가 아닌 인자가 있으면: 도메인명으로 해석하여 `domain-detail` 모드
3. 인자가 없으면: `overview` 모드

---

### 2단계: 기존 아키텍처 문서 확인 (Architecture Doc Discovery)

`architecture-updater.js` 훅이 자동 생성한 문서가 있는지 먼저 확인합니다.

```bash
# 아키텍처 문서 디렉토리 확인
ls -la .claude/architecture/ 2>/dev/null

# 주요 문서 존재 여부
ls .claude/architecture/ARCHITECTURE.md 2>/dev/null
ls .claude/architecture/api-catalog.md 2>/dev/null
ls .claude/architecture/dependency-matrix.md 2>/dev/null
ls .claude/architecture/domains/ 2>/dev/null
```

**문서 존재 시**: 기존 문서를 기반 데이터로 활용하되, 실제 코드와의 정합성을 검증합니다.
**문서 부재 시**: 실시간으로 프로젝트를 스캔하여 분석합니다.

---

### 3단계: 프로젝트 구조 탐색 (Project Structure Scan)

프로젝트의 전체 디렉토리 구조를 파악합니다.

**탐색 대상 디렉토리 패턴:**

| 패턴 | 설명 | 예시 |
|------|------|------|
| `src/domains/<name>/` | DDD 도메인 디렉토리 | `src/domains/member/` |
| `app/domains/<name>/` | App 기반 도메인 | `app/domains/order/` |
| `domains/<name>/` | 최상위 도메인 | `domains/product/` |
| `packages/<name>/` | 모노레포 패키지 | `packages/auth/` |
| `modules/<name>/` | 모듈 기반 구조 | `modules/payment/` |

**레이어 식별 패턴:**

| 레이어 | 디렉토리 패턴 | 역할 |
|--------|-------------|------|
| API/Route | `api/`, `routes/`, `endpoints/`, `controllers/`, `views/` | 외부 인터페이스 |
| Service | `services/`, `usecases/`, `application/` | 비즈니스 로직 |
| Model/Entity | `models/`, `entities/`, `domain/` | 도메인 모델 |
| Schema | `schemas/`, `dto/`, `serializers/` | 데이터 전송 객체 |
| Repository | `repositories/`, `dao/`, `persistence/` | 데이터 접근 |
| Infrastructure | `infrastructure/`, `adapters/`, `gateways/` | 외부 연동 |
| Config | `config/`, `settings/` | 설정 |
| Middleware | `middleware/`, `interceptors/` | 미들웨어 |
| Test | `tests/`, `test/`, `spec/`, `__tests__/` | 테스트 |
| Utility | `utils/`, `helpers/`, `lib/`, `common/`, `shared/` | 공통 유틸 |

```bash
# 프로젝트 루트 구조
ls -d */ 2>/dev/null

# 소스 디렉토리 구조 탐색 (일반적인 패턴)
ls -d src/*/ app/*/ domains/*/ packages/*/ modules/*/ 2>/dev/null

# 프로젝트 설정 파일 확인 (기술 스택 파악용)
ls package.json pyproject.toml requirements.txt go.mod Cargo.toml pom.xml build.gradle Gemfile composer.json 2>/dev/null

# 프로젝트 팀 설정 확인
cat .claude/project-team.yaml 2>/dev/null
```

---

### 4단계: 서브커맨드별 분석 (Targeted Analysis)

서브커맨드에 따라 적절한 분석을 수행합니다.

#### 4-A. 전체 아키텍처 개요 (`overview`)

모든 분석을 통합하여 전체 아키텍처를 보여줍니다.

**분석 항목:**

1. **도메인 구조**: 도메인 디렉토리 패턴으로 도메인 식별
2. **도메인별 요약**: 각 도메인의 파일 수, 엔드포인트 수, 의존 도메인
3. **도메인 간 의존성**: 도메인 간 import/API 호출 관계
4. **API 요약**: 전체 엔드포인트 수, HTTP 메서드별 분포
5. **기술 스택 요약**: 주요 프레임워크, 언어, DB

**데이터 소스 우선순위:**

1. `.claude/architecture/ARCHITECTURE.md` 문서 (있으면 기반 데이터로 활용)
2. `.claude/architecture/domains/*.md` (도메인별 상세 정보)
3. `.claude/architecture/api-catalog.md` (API 카탈로그)
4. `.claude/architecture/dependency-matrix.md` (의존성 매트릭스)
5. 실시간 파일 시스템 스캔 (문서가 없거나 정합성 검증 시)

#### 4-B. 도메인 구조 (`domains`)

프로젝트의 도메인 경계와 관계를 시각화합니다.

**분석 방법:**

1. 도메인 디렉토리 탐색 (3단계의 도메인 패턴 적용)
2. 각 도메인 내 파일을 역할별로 분류 (`architecture-updater.js`의 `classifyDomainFileRole()` 기준):
   - `service`, `model`, `route`, `schema`, `controller`, `repository`
   - `middleware`, `utility`, `test`, `config`, `migration`, `entity`, `interface`
3. 도메인 간 의존성 추출 (import/require 파싱)
4. Mermaid 다이어그램 생성

```bash
# 도메인 디렉토리 탐색
ls -d src/domains/*/ app/domains/*/ domains/*/ packages/*/ modules/*/ 2>/dev/null

# 각 도메인의 파일 목록
find <도메인경로> -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" 2>/dev/null | head -50

# 도메인 간 참조 탐색
grep -rn "from.*<타도메인>" --include="*.py" <도메인경로> 2>/dev/null
grep -rn "import.*<타도메인>" --include="*.ts" --include="*.js" <도메인경로> 2>/dev/null
```

#### 4-C. API 카탈로그 (`api`)

모든 API 엔드포인트를 수집하고 정리합니다.

**지원하는 프레임워크 패턴:**

| 프레임워크 | 데코레이터/메서드 패턴 | 예시 |
|-----------|----------------------|------|
| FastAPI | `@router.{method}("/path")` | `@router.get("/users")` |
| FastAPI | `@app.{method}("/path")` | `@app.post("/login")` |
| Flask | `@app.route("/path", methods=[...])` | `@app.route("/users", methods=["GET"])` |
| Flask | `@blueprint.route("/path")` | `@bp.route("/items")` |
| Express | `router.{method}('/path', handler)` | `router.get('/users', getUsers)` |
| Express | `app.{method}('/path', handler)` | `app.post('/login', login)` |
| Django REST | `@api_view(['GET'])` | `@api_view(['GET', 'POST'])` |
| Spring | `@GetMapping("/path")` | `@GetMapping("/users")` |

```bash
# API 파일 탐색
find . -path "*/routes/*" -o -path "*/api/*" -o -path "*/endpoints/*" -o -path "*/controllers/*" -o -path "*/views/*" 2>/dev/null | grep -E "\.(py|js|ts|tsx|jsx)$"

# FastAPI/Flask 엔드포인트 추출
grep -rn "@router\.\|@app\.\|@blueprint\.\|@bp\." --include="*.py" . 2>/dev/null

# Express 엔드포인트 추출
grep -rn "router\.\(get\|post\|put\|delete\|patch\)\|app\.\(get\|post\|put\|delete\|patch\)" --include="*.js" --include="*.ts" . 2>/dev/null
```

**API 카탈로그 정보 수집:**

| 항목 | 설명 | 추출 방법 |
|------|------|-----------|
| Method | HTTP 메서드 | 데코레이터/메서드 파싱 |
| Path | URL 경로 | 데코레이터 인자 파싱 |
| Handler | 핸들러 함수명 | 데코레이터 다음 줄의 def/function |
| Domain | 소속 도메인 | 파일 경로에서 도메인 추출 |
| File | 정의된 파일 | 파일 경로 |
| Auth | 인증 필요 여부 | Depends(auth), middleware 감지 |

#### 4-D. 레이어 구조 (`layers`)

프로젝트를 레이어별로 분류하여 보여줍니다.

**분석 방법:**

1. 프로젝트 내 모든 디렉토리를 레이어 패턴과 매칭
2. 각 레이어에 속하는 파일 수 집계
3. 레이어 간 의존 방향 분석 (위반 감지)
4. Mermaid 다이어그램 생성

**레이어 간 의존성 규칙 (Clean Architecture):**

```
[허용되는 의존 방향]

  API/Route  -->  Service  -->  Model/Entity
      |              |               ^
      v              v               |
  Schema/DTO   Repository   Infrastructure
                     |
                     v
                  Database
```

**레이어 위반 감지:**

| 위반 유형 | 설명 | 심각도 |
|-----------|------|--------|
| Model -> Service | 도메인 모델이 서비스에 의존 | HIGH |
| Model -> Repository | 도메인 모델이 저장소에 의존 | HIGH |
| Model -> API | 도메인 모델이 API 레이어에 의존 | CRITICAL |
| Repository -> API | 저장소가 API 레이어에 의존 | HIGH |
| Service -> Route | 서비스가 라우터에 의존 | MEDIUM |

```bash
# 레이어별 파일 카운트
find . -path "*/api/*" -name "*.py" -o -name "*.ts" -o -name "*.js" 2>/dev/null | wc -l
find . -path "*/services/*" -name "*.py" -o -name "*.ts" -o -name "*.js" 2>/dev/null | wc -l
find . -path "*/models/*" -name "*.py" -o -name "*.ts" -o -name "*.js" 2>/dev/null | wc -l
find . -path "*/repositories/*" -name "*.py" -o -name "*.ts" -o -name "*.js" 2>/dev/null | wc -l

# 레이어 간 import 방향 검증
# 예: model 디렉토리에서 service를 import하는지 (위반)
grep -rn "from.*services\|import.*services" --include="*.py" models/ 2>/dev/null
```

#### 4-E. 기술 스택 (`tech`)

프로젝트에서 사용하는 기술 스택을 자동 감지하고 정리합니다.

**감지 방법:**

| 카테고리 | 감지 소스 | 감지 항목 |
|----------|----------|-----------|
| 언어 | 파일 확장자 분포 | `.py`, `.js`, `.ts`, `.go`, `.java`, `.rs` |
| 프레임워크 | 설정 파일, import 패턴 | FastAPI, Django, Express, Next.js, Spring |
| DB | 설정 파일, ORM import | PostgreSQL, MySQL, MongoDB, Redis |
| ORM | import 패턴 | SQLAlchemy, Prisma, TypeORM, GORM |
| 테스트 | 설정 파일, 패턴 | pytest, jest, vitest, go test |
| 인프라 | 설정 파일 | Docker, K8s, Terraform |
| CI/CD | 워크플로우 파일 | GitHub Actions, GitLab CI |
| 패키지 매니저 | Lock 파일 | pip, npm, pnpm, yarn, bun |

```bash
# 패키지 매니저/언어 설정 파일
cat package.json 2>/dev/null | head -30
cat pyproject.toml 2>/dev/null | head -30
cat requirements.txt 2>/dev/null | head -30
cat go.mod 2>/dev/null | head -10
cat Cargo.toml 2>/dev/null | head -20
cat pom.xml 2>/dev/null | head -30
cat build.gradle 2>/dev/null | head -30
cat Gemfile 2>/dev/null | head -20
cat composer.json 2>/dev/null | head -20

# Docker/인프라 설정
ls Dockerfile docker-compose*.yml docker-compose*.yaml 2>/dev/null
ls -d .github/workflows/ .gitlab-ci.yml Jenkinsfile 2>/dev/null
ls k8s/ kubernetes/ helm/ terraform/ 2>/dev/null

# 파일 확장자 분포
find . -type f -name "*.py" | wc -l
find . -type f -name "*.ts" -o -name "*.tsx" | wc -l
find . -type f -name "*.js" -o -name "*.jsx" | wc -l
find . -type f -name "*.go" | wc -l
find . -type f -name "*.java" | wc -l
find . -type f -name "*.rs" | wc -l

# 프레임워크 감지 (import 패턴)
grep -rn "from fastapi\|import fastapi" --include="*.py" . 2>/dev/null | head -3
grep -rn "from django\|import django" --include="*.py" . 2>/dev/null | head -3
grep -rn "from flask\|import flask" --include="*.py" . 2>/dev/null | head -3
grep -rn "require('express')\|from 'express'" --include="*.js" --include="*.ts" . 2>/dev/null | head -3
grep -rn "from 'next\|from 'react\|from 'vue\|from 'svelte" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | head -3

# DB 감지
grep -rn "sqlalchemy\|prisma\|typeorm\|mongoose\|sequelize\|gorm" --include="*.py" --include="*.ts" --include="*.js" --include="*.go" . 2>/dev/null | head -5
```

#### 4-F. 특정 도메인 상세 (`domain-detail`)

특정 도메인의 상세 구조를 보여줍니다.

**분석 항목:**

1. 도메인 디렉토리 트리 구조
2. 파일별 역할 분류 (service, model, route, schema, repository 등)
3. 도메인 내 API 엔드포인트 목록
4. 외부 의존성 (이 도메인이 사용하는 외부 모듈)
5. 피의존성 (이 도메인을 사용하는 외부 모듈)
6. 주요 클래스/함수 목록

```bash
# 도메인 디렉토리 구조
find <도메인경로> -type f | head -50

# 도메인 내 API 엔드포인트
grep -rn "@router\.\|@app\.\|@blueprint\.\|router\.\(get\|post\|put\|delete\)" --include="*.py" --include="*.js" --include="*.ts" <도메인경로> 2>/dev/null

# 외부 의존성 (도메인 외부 import)
grep -rn "^from \|^import " --include="*.py" <도메인경로> 2>/dev/null | grep -v "from \." | head -30
grep -rn "import.*from\|require(" --include="*.ts" --include="*.js" <도메인경로> 2>/dev/null | head -30

# 이 도메인에 의존하는 외부 파일
grep -rn "from.*<도메인명>\|import.*<도메인명>" --include="*.py" --include="*.ts" --include="*.js" . 2>/dev/null | grep -v "<도메인경로>"

# 기존 도메인 문서 확인
cat .claude/architecture/domains/<도메인명>.md 2>/dev/null
```

---

## 출력 형식

### 전체 아키텍처 개요 (`/architecture`)

```
===========================================================
  Architecture Overview
===========================================================

  Project: <프로젝트명>
  Generated: <YYYY-MM-DD HH:MM>
  Source: <.claude/architecture/ 기반|실시간 스캔>

-----------------------------------------------------------
  Domain Map (Mermaid)
-----------------------------------------------------------

  ```mermaid
  graph TB
    subgraph "Project Architecture"
      member["Member<br/>Files: 12, APIs: 5"]
      order["Order<br/>Files: 18, APIs: 12"]
      product["Product<br/>Files: 8, APIs: 6"]
      payment["Payment<br/>Files: 10, APIs: 4"]
    end

    order -->|"API 2, import 3"| member
    order -->|"API 2"| product
    order -->|"import 1"| payment
    payment -->|"API 1"| order

    style member fill:#4CAF50,color:#fff
    style product fill:#4CAF50,color:#fff
    style order fill:#FF9800,color:#fff
    style payment fill:#2196F3,color:#fff
  ```

-----------------------------------------------------------
  Domain Summary
-----------------------------------------------------------

  | Domain  | Files | APIs | Dependencies    | Role             |
  |---------|-------|------|-----------------|------------------|
  | member  | 12    | 5    | none            | Core (stable)    |
  | product | 8     | 6    | none            | Core (stable)    |
  | order   | 18    | 12   | member, product | Business Logic   |
  | payment | 10    | 4    | order           | Business Logic   |

-----------------------------------------------------------
  API Summary
-----------------------------------------------------------

  Total Endpoints: 27
  | Method | Count |
  |--------|-------|
  | GET    | 12    |
  | POST   | 8     |
  | PUT    | 4     |
  | DELETE | 3     |

-----------------------------------------------------------
  Tech Stack (Top)
-----------------------------------------------------------

  | Category   | Technology           |
  |------------|----------------------|
  | Language   | Python 3.14          |
  | Framework  | FastAPI              |
  | ORM        | SQLAlchemy 2.0       |
  | Database   | PostgreSQL           |
  | Test       | pytest               |

-----------------------------------------------------------
  Architecture Documents
-----------------------------------------------------------

  [Available] .claude/architecture/ARCHITECTURE.md
  [Available] .claude/architecture/api-catalog.md
  [Available] .claude/architecture/dependency-matrix.md
  [Available] .claude/architecture/domains/member.md
  [Available] .claude/architecture/domains/order.md

  Tip: Use /architecture <subcommand> for details
  - /architecture domains  -> Domain structure
  - /architecture api      -> API catalog
  - /architecture layers   -> Layer structure
  - /architecture tech     -> Full tech stack

===========================================================
```

### 도메인 구조 (`/architecture domains`)

```
===========================================================
  Domain Structure
===========================================================

  Domains Found: <N>
  Total Files: <N>
  Domain Detection: <패턴>

-----------------------------------------------------------
  Domain Dependency Diagram (Mermaid)
-----------------------------------------------------------

  ```mermaid
  graph LR
    member["Member<br/>12 files"]
    order["Order<br/>18 files"]
    product["Product<br/>8 files"]
    payment["Payment<br/>10 files"]

    order -->|"5 refs"| member
    order -->|"3 refs"| product
    order -->|"2 refs"| payment
    payment -->|"1 ref"| order

    style member fill:#4CAF50,color:#fff
    style product fill:#4CAF50,color:#fff
  ```

-----------------------------------------------------------
  Domain Details
-----------------------------------------------------------

  ### member (12 files)

  | Role       | Count | Key Files                           |
  |------------|-------|-------------------------------------|
  | service    | 3     | user_service.py, auth_service.py    |
  | model      | 2     | user.py, role.py                    |
  | route      | 2     | user_router.py, auth_router.py      |
  | schema     | 2     | user_schema.py, auth_schema.py      |
  | repository | 1     | user_repository.py                  |
  | test       | 2     | test_user.py, test_auth.py          |

  ### order (18 files)

  | Role       | Count | Key Files                           |
  |------------|-------|-------------------------------------|
  | service    | 4     | order_service.py, discount_svc.py   |
  | model      | 3     | order.py, order_item.py, cart.py    |
  | route      | 2     | order_router.py, cart_router.py     |
  | schema     | 3     | order_schema.py, cart_schema.py     |
  | repository | 2     | order_repo.py, cart_repo.py         |
  | test       | 4     | test_order.py, test_cart.py, ...    |

  (... repeat for each domain ...)

-----------------------------------------------------------
  Cross-Domain Dependencies
-----------------------------------------------------------

  | Source  | Target  | Refs | Type         |
  |---------|---------|------|--------------|
  | order   | member  | 5    | API + import |
  | order   | product | 3    | API          |
  | order   | payment | 2    | import       |
  | payment | order   | 1    | API          |

===========================================================
```

### API 카탈로그 (`/architecture api`)

```
===========================================================
  API Catalog
===========================================================

  Total Endpoints: <N>
  Domains with APIs: <N>
  Source: <api-catalog.md|실시간 스캔>

-----------------------------------------------------------
  member Domain (5 endpoints)
-----------------------------------------------------------

  | Method | Path                    | Handler        | Auth |
  |--------|-------------------------|----------------|------|
  | GET    | /api/members            | list_members   | Yes  |
  | GET    | /api/members/{id}       | get_member     | Yes  |
  | POST   | /api/members            | create_member  | Yes  |
  | PUT    | /api/members/{id}       | update_member  | Yes  |
  | DELETE | /api/members/{id}       | delete_member  | Yes  |

  File: src/domains/member/api/router.py

-----------------------------------------------------------
  order Domain (12 endpoints)
-----------------------------------------------------------

  | Method | Path                    | Handler         | Auth |
  |--------|-------------------------|-----------------|------|
  | GET    | /api/orders             | list_orders     | Yes  |
  | GET    | /api/orders/{id}        | get_order       | Yes  |
  | POST   | /api/orders             | create_order    | Yes  |
  | PUT    | /api/orders/{id}        | update_order    | Yes  |
  | DELETE | /api/orders/{id}        | cancel_order    | Yes  |
  | POST   | /api/orders/{id}/pay    | process_payment | Yes  |
  | GET    | /api/cart               | get_cart        | Yes  |
  | POST   | /api/cart/items         | add_to_cart     | Yes  |
  | DELETE | /api/cart/items/{id}    | remove_from_cart| Yes  |
  | ...    | ...                     | ...             | ...  |

  Files: src/domains/order/api/order_router.py,
         src/domains/order/api/cart_router.py

-----------------------------------------------------------
  (... repeat for each domain ...)
-----------------------------------------------------------

-----------------------------------------------------------
  Summary by Method
-----------------------------------------------------------

  ```mermaid
  pie title "API Methods Distribution"
    "GET" : 12
    "POST" : 8
    "PUT" : 4
    "DELETE" : 3
  ```

===========================================================
```

### 레이어 구조 (`/architecture layers`)

```
===========================================================
  Layer Structure
===========================================================

  Architecture Style: <Layered|Clean|Hexagonal|Unknown>
  Layers Detected: <N>

-----------------------------------------------------------
  Layer Diagram (Mermaid)
-----------------------------------------------------------

  ```mermaid
  graph TB
    subgraph "Presentation Layer"
      api["API/Routes<br/>14 files"]
      schema["Schemas/DTO<br/>10 files"]
    end

    subgraph "Business Layer"
      service["Services<br/>12 files"]
      middleware["Middleware<br/>3 files"]
    end

    subgraph "Domain Layer"
      model["Models/Entities<br/>8 files"]
      interface["Interfaces<br/>4 files"]
    end

    subgraph "Infrastructure Layer"
      repo["Repositories<br/>6 files"]
      infra["Infrastructure<br/>5 files"]
      config["Config<br/>3 files"]
    end

    api --> service
    service --> model
    service --> repo
    repo --> model

    style api fill:#2196F3,color:#fff
    style service fill:#FF9800,color:#fff
    style model fill:#4CAF50,color:#fff
    style repo fill:#9C27B0,color:#fff
  ```

-----------------------------------------------------------
  Layer Summary
-----------------------------------------------------------

  | Layer          | Directory Pattern      | Files | Domains |
  |----------------|------------------------|-------|---------|
  | API/Route      | api/, routes/          | 14    | 4       |
  | Schema/DTO     | schemas/, dto/         | 10    | 4       |
  | Service        | services/              | 12    | 4       |
  | Model/Entity   | models/, entities/     | 8     | 4       |
  | Repository     | repositories/          | 6     | 4       |
  | Infrastructure | infrastructure/        | 5     | 2       |
  | Middleware      | middleware/            | 3     | 1       |
  | Config         | config/                | 3     | 1       |
  | Test           | tests/                 | 20    | 4       |
  | Utility        | utils/, helpers/       | 5     | 2       |

-----------------------------------------------------------
  Layer Violations
-----------------------------------------------------------

  | Severity | File                          | Violation                     |
  |----------|-------------------------------|-------------------------------|
  | HIGH     | models/order.py:L15           | imports from services/         |
  | MEDIUM   | services/user_service.py:L42  | imports from routes/           |

  Total Violations: 2
  Clean Architecture Compliance: 97%

===========================================================
```

### 기술 스택 (`/architecture tech`)

```
===========================================================
  Technology Stack
===========================================================

  Project: <프로젝트명>
  Detected: <YYYY-MM-DD>

-----------------------------------------------------------
  Core Stack
-----------------------------------------------------------

  | Category         | Technology        | Version   | Config File        |
  |------------------|-------------------|-----------|--------------------|
  | Language          | Python            | 3.14      | pyproject.toml     |
  | Framework         | FastAPI           | 0.115.x   | pyproject.toml     |
  | ORM               | SQLAlchemy        | 2.0.x     | pyproject.toml     |
  | Database          | PostgreSQL        | 16.x      | docker-compose.yml |
  | DB Driver         | asyncpg           | 0.30.x    | pyproject.toml     |
  | Migration         | Alembic           | 1.14.x    | pyproject.toml     |
  | Validation        | Pydantic          | 2.x       | pyproject.toml     |

-----------------------------------------------------------
  Development Tools
-----------------------------------------------------------

  | Category         | Technology        | Config File            |
  |------------------|-------------------|------------------------|
  | Test Framework    | pytest            | pyproject.toml         |
  | Linter            | ruff              | pyproject.toml         |
  | Type Checker      | mypy              | pyproject.toml         |
  | Formatter         | ruff format       | pyproject.toml         |
  | Package Manager   | pip               | requirements.txt       |

-----------------------------------------------------------
  Infrastructure
-----------------------------------------------------------

  | Category         | Technology        | Config File            |
  |------------------|-------------------|------------------------|
  | Container         | Docker            | Dockerfile             |
  | Orchestration     | Docker Compose    | docker-compose.yml     |
  | CI/CD             | GitHub Actions    | .github/workflows/     |
  | Cache             | Redis             | docker-compose.yml     |

-----------------------------------------------------------
  File Distribution
-----------------------------------------------------------

  | Extension | Count | Percentage |
  |-----------|-------|------------|
  | .py       | 85    | 62%        |
  | .ts       | 30    | 22%        |
  | .yaml     | 12    | 9%         |
  | .md       | 10    | 7%         |

  ```mermaid
  pie title "Source File Distribution"
    "Python (.py)" : 85
    "TypeScript (.ts)" : 30
    "YAML (.yaml)" : 12
    "Markdown (.md)" : 10
  ```

===========================================================
```

### 특정 도메인 상세 (`/architecture <도메인명>`)

```
===========================================================
  Domain Detail: <도메인명>
===========================================================

  Domain: <도메인명>
  Path: <도메인 경로>
  Files: <N>
  APIs: <N>

-----------------------------------------------------------
  Directory Structure
-----------------------------------------------------------

  <도메인명>/
  +-- api/
  |   +-- router.py            (route, 6 endpoints)
  +-- services/
  |   +-- order_service.py     (service, core logic)
  |   +-- discount_service.py  (service, calculation)
  +-- models/
  |   +-- order.py             (model, SQLAlchemy)
  |   +-- order_item.py        (model, SQLAlchemy)
  +-- schemas/
  |   +-- order_schema.py      (schema, Pydantic)
  |   +-- request_schema.py    (schema, Pydantic)
  +-- repositories/
  |   +-- order_repository.py  (repository, CRUD)
  +-- tests/
      +-- test_order.py        (test, 15 cases)
      +-- test_discount.py     (test, 8 cases)

-----------------------------------------------------------
  API Endpoints
-----------------------------------------------------------

  | Method | Path                 | Handler         |
  |--------|----------------------|-----------------|
  | GET    | /api/orders          | list_orders     |
  | GET    | /api/orders/{id}     | get_order       |
  | POST   | /api/orders          | create_order    |
  | PUT    | /api/orders/{id}     | update_order    |
  | DELETE | /api/orders/{id}     | cancel_order    |
  | POST   | /api/orders/{id}/pay | process_payment |

-----------------------------------------------------------
  Internal Structure (Mermaid)
-----------------------------------------------------------

  ```mermaid
  graph TB
    router["router.py<br/>6 endpoints"]
    order_svc["order_service.py<br/>core logic"]
    discount_svc["discount_service.py<br/>calculation"]
    order_model["order.py<br/>SQLAlchemy"]
    order_repo["order_repository.py<br/>CRUD"]

    router --> order_svc
    router --> discount_svc
    order_svc --> order_repo
    order_svc --> order_model
    discount_svc --> order_model
    order_repo --> order_model
  ```

-----------------------------------------------------------
  External Dependencies (Outgoing)
-----------------------------------------------------------

  | Target Domain | Ref Type | Details                          |
  |---------------|----------|----------------------------------|
  | member        | API      | GET /api/members/{id} (grade)    |
  | member        | import   | member.models.User               |
  | product       | API      | GET /api/products/{id} (price)   |
  | payment       | import   | payment.services.process_payment |

-----------------------------------------------------------
  Dependents (Incoming)
-----------------------------------------------------------

  | Source Domain | Ref Type | Details                          |
  |---------------|----------|----------------------------------|
  | payment       | API      | GET /api/orders/{id}             |
  | notification  | import   | order.events.ORDER_CREATED       |

-----------------------------------------------------------
  Risk Assessment
-----------------------------------------------------------

  | File                  | Risk Level | Reason                    |
  |-----------------------|------------|---------------------------|
  | order_service.py      | HIGH       | Core business logic       |
  | discount_service.py   | HIGH       | Financial calculation     |
  | router.py             | MEDIUM     | API interface             |
  | order.py              | MEDIUM     | Data model                |
  | order_repository.py   | LOW        | Standard CRUD             |

===========================================================
```

---

## 데이터 소스 우선순위

이 스킬은 다음 우선순위로 데이터를 수집합니다:

| 우선순위 | 소스 | 설명 |
|---------|------|------|
| 1 | `.claude/architecture/*.md` | Hook이 자동 생성한 문서 (최신 상태라면 가장 효율적) |
| 2 | `.claude/project-team.yaml` | 프로젝트 팀 설정 (도메인 정의) |
| 3 | 실시간 파일 시스템 스캔 | 문서가 없거나 정합성 검증 필요 시 |

**정합성 검증:**

아키텍처 문서가 존재하더라도 다음 경우 실시간 스캔으로 보완합니다:

- 문서의 `Last updated` 시간이 24시간 이상 경과
- 서브커맨드가 문서에 포함되지 않은 정보를 요구 (예: `tech` 서브커맨드)
- 사용자가 명시적으로 "최신 정보" 또는 "다시 스캔"을 요청

---

## 다른 스킬과의 관계

| 관련 스킬 | 관계 | 설명 |
|-----------|------|------|
| `/deps` | 보완 | `/architecture`는 전체 구조, `/deps`는 의존성 심층 분석 |
| `/impact` | 보완 | `/architecture`는 정적 구조, `/impact`는 변경 영향도 |
| `/changelog` | 보완 | `/architecture`는 현재 상태, `/changelog`는 변경 이력 |
| `/coverage` | 보완 | `/architecture`는 구조, `/coverage`는 테스트 커버리지 |

**자동 연계 안내:**

분석 결과에서 특정 도메인이나 파일에 대해 더 깊은 분석이 필요한 경우,
사용자에게 관련 스킬을 안내합니다:

```
Tip: 더 자세한 분석이 필요하면:
  - /deps order       -> order 도메인 의존성 심층 분석
  - /impact <파일>    -> 특정 파일 변경 영향도
  - /changelog order  -> order 도메인 변경 이력
```

---

## 에러 처리

| 상황 | 대응 |
|------|------|
| 도메인 디렉토리 미발견 | "도메인 디렉토리를 찾을 수 없습니다. 프로젝트 구조를 확인해주세요." 메시지 출력 |
| 아키텍처 문서 미존재 | 실시간 스캔 모드로 전환, "아키텍처 문서가 아직 생성되지 않았습니다. 실시간 스캔 결과입니다." 안내 |
| 소스 파일 없음 | "소스 코드 파일을 찾을 수 없습니다. 프로젝트 루트를 확인해주세요." 메시지 출력 |
| 특정 도메인 미발견 | "'{도메인명}' 도메인을 찾을 수 없습니다. /architecture domains로 전체 목록을 확인해주세요." 안내 |
| 설정 파일 파싱 실패 | 해당 카테고리를 "Unknown"으로 표시, 다른 분석은 계속 진행 |
