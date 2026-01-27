# 🌌 Inflo's VibeLab Extension

**VibeLab Skills 위에서 더 안전하고 정밀한 구현을 돕는 확장 스킬 팩 v2.0**

> ⚠️ **필수 요구사항**: 이 확장팩은 [VibeLab Skills](https://vibelabs.kr/skills/new)이 설치된 환경에서만 정상 작동합니다.

VibeLab의 `/socrates`와 `/tasks-generator`가 만들어낸 기획 문서와 태스크 목록을 기반으로, **레이어별 점진적 구현**, **맥락 복구**, **품질 감사**, **워크플로우 라우팅** 등 고급 엔지니어링 기능을 제공합니다.

---

## 📊 바이브랩스킬 vs 우리스킬 (역할 분담)

| 구분 | 스킬 | 역할 | 시점 |
|------|------|------|------|
| **바이브랩** | `/socrates` | 기획 컨설팅 | 프로젝트 시작 |
| **바이브랩** | `/tasks-generator` | 태스크 생성 | 기획 완료 후 |
| **바이브랩** | `/auto-orchestrate` | 완전 자동화 (30~200개) | 대규모 구현 |
| **바이브랩** | `/code-review` | 2단계 코드 리뷰 | 기능 완료 |
| **우리스킬** | `/workflow` | **메타 허브** - 스킬 라우팅 | 언제든지 |
| **우리스킬** | `/agile` | 레이어별 스프린트 (1~30개) | 소규모 구현 |
| **우리스킬** | `/recover` | 범용 복구 허브 | 작업 중단 시 |
| **우리스킬** | `/audit` | 배포 전 종합 감사 | 배포 전 |

---

## 🚀 확장 스킬 (Extension Skills) v2.0

### 1. 🧭 Workflow Guide (`/workflow`) - 메타 허브

**31개 스킬 중 최적의 스킬을 자동 추천**

```
/workflow
```

- **역할**: 프로젝트 상태 자동 진단 → 최적 스킬 1~2개 추천
- **특징**:
  - 바이브랩스킬 27개 + 우리스킬 4개 전체 카탈로그 관리
  - 태스크 규모별 구현 스킬 선택 가이드
  - 품질 게이트 체크리스트
- **MCP 의존성**: 없음

### 2. 🏃 Agile Sprint Master (`/agile`)

**레이어별 점진적 구현 (Skeleton → Muscles → Skin)**

```bash
/agile auto          # 신규 프로젝트 전체 레이어 자동 실행
/agile iterate "변경사항"  # 영향받는 레이어만 스마트 수정
/agile status        # 현재 스프린트 상태 확인
```

- **역할**: 1~30개 태스크를 사용자와 협업하며 체크포인트 기반 구현
- **특징**:
  - 🦴 Skeleton: 전체 레이아웃, 더미 데이터
  - 💪 Muscles: 실제 데이터 연동, 비즈니스 로직
  - ✨ Skin: 디자인 시스템 정밀 적용, 애니메이션
- **MCP 의존성**: playwright (선택적, 스크린샷 시)

### 3. 🔄 Context Recover (`/recover`)

**모든 유형의 중단된 작업 복구**

```
/recover
```

- **역할**: CLI 중단, 네트워크 끊김, 에이전트 오류 후 작업 복구
- **특징**:
  - orchestrate-state.json 기반 자동화 재개
  - Git Worktree 상태 점검
  - 미완료 코드 파일 탐지
- **MCP 의존성**: 없음

### 4. 🕵️ Quality Auditor (`/audit`)

**배포 전 기획 정합성 + 동적 검증**

```
/audit
```

- **역할**: Phase 완료 또는 배포 전 종합 품질 감사
- **특징**:
  - 2단계 리뷰 (Spec Compliance → Code Quality)
  - DDD (Demo-Driven Development) 검증
  - 기본 테스트 명령어 실행 (`npm test`, `pytest`)
  - 품질 점수 산출 (90+: PASS, 70-89: CAUTION, <70: FAIL)
- **MCP 의존성**: playwright (선택적, 브라우저 검증 시)

---

## 🔧 MCP 의존성

| 스킬 | 필수 MCP | 비고 |
|------|----------|------|
| `/workflow` | 없음 | 기본 도구만 사용 |
| `/agile` | playwright (선택적) | 스크린샷 캡처 시에만 |
| `/recover` | 없음 | 기본 도구만 사용 |
| `/audit` | playwright (선택적) | 브라우저 검증 시에만 |

> **모든 스킬이 MCP 없이도 핵심 기능은 동작합니다.**

---

## 🛠️ 설치 방법 (Quick Start)

### 0단계: VibeLab 먼저 설치

https://vibelabs.kr/skills/new

### 1단계: 본 확장팩 설치

**🪟 Windows (PowerShell)**

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-windows.ps1
```

**🍎 macOS / 🐧 Linux**

```bash
chmod +x ./scripts/install-unix.sh && ./scripts/install-unix.sh
```

---

## 🤝 권장 워크플로우

```
시작
  │
  ├─ "뭐부터 해야 해?" ──────────── /workflow (우리스킬)
  │
  ├─ 아이디어만 있음 ────────────── /socrates (바이브랩)
  │
  ├─ 기획 완료 ──────────────────── /tasks-generator (바이브랩)
  │
  ├─ 구현 시작
  │   ├─ 1~30개 태스크 ──────────── /agile auto (우리스킬)
  │   └─ 30~200개 태스크 ─────────── /auto-orchestrate (바이브랩)
  │
  ├─ 기능 수정 ──────────────────── /agile iterate (우리스킬)
  │
  ├─ 코드 리뷰 ──────────────────── /code-review (바이브랩)
  │
  ├─ 배포 전 감사 ───────────────── /audit (우리스킬)
  │
  └─ 작업 중단 시 ───────────────── /recover (우리스킬)
```

---

## 📁 프로젝트 구조

```
vibelab-extension/
├── skills/                    # 우리스킬 (4개)
│   ├── workflow-guide/        # v2.0.0 - 메타 허브
│   ├── agile/                 # v1.9.0 - 레이어별 스프린트
│   ├── recover/               # v1.9.0 - 범용 복구
│   └── quality-auditor/       # v2.0.0 - 종합 감사
├── scripts/                   # 설치 스크립트
│   ├── install-windows.ps1
│   └── install-unix.sh
├── LICENSE                    # MIT License
└── README.md                  # 이 파일
```

---

## 📋 버전 히스토리

| 버전 | 날짜 | 주요 변경 |
|------|------|-----------|
| **v2.0.0** | 2026-01-27 | MCP 의존성 제거, workflow-guide 메타 허브 강화 |
| v1.9.0 | 2026-01-27 | 바이브랩스킬과 역할 분담 명확화 |
| v1.8.0 | 2026-01-26 | 스킬 간 연동 강화, 복구 워크플로우 추가 |
| v1.7.4 | 2026-01-25 | 2단계 리뷰, DDD 검증 추가 |

---

## 📄 라이선스

MIT License - Copyright (c) 2026 Inflo Team

---

**Inflo Team**
_Enhancing VibeLab with Precision Engineering._
