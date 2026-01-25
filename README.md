# 🌌 Inflo's VibeLab Extension

**VibeLab v1.7.4+의 기획/태스크 시스템 위에서, 더 안전하고 정밀한 구현을 돕는 확장 스킬 팩**

> ⚠️ **필수 요구사항**: 이 확장팩은 [VibeLab Skills v1.7.4+](https://vibelabs.kr/skills/new)이 설치된 환경에서만 정상 작동합니다.

VibeLab의 `/socrates`와 `/tasks-generator`가 만들어낸 기획 문서와 태스크 목록을 기반으로, **레이어별 점진적 구현**, **맥락 복구**, **품질 감사** 등 고급 엔지니어링 기능을 제공합니다.

---

## 🚀 확장 스킬 (Extension Skills)

VibeLab의 기본 스킬과 시너지를 극대화하는 4가지 프리미엄 도구입니다.

### 1. 🏃 Agile Sprint Master (`/agile`)

- **의존**: `docs/planning/06-tasks.md`
- **특징**: "뼈대-근육-스킨" 레이어별 점진적 구현. 
  - `/agile auto`: 신규 프로젝트의 전체 레이어 자동 실행 및 체크포인트.
  - `/agile iterate`: 디자인/기능/로직 변경 시 영향받는 레이어만 스마트하게 반복 구현.

### 2. 🚑 Context Recover (`/recover`)

- **의존**: `docs/planning/*.md`, Git 상태, `.claude/orchestrate-state.json`
- **특징**: 대화가 끊기거나 기억이 소실된 시점에서 즉시 작업 맥락을 복구합니다.
  - v1.7.4: 오케스트레이터의 마지막 태스크 ID를 추적하여 정밀한 재개 제안.

### 3. 🧭 Workflow Guide (`/workflow`)

- **의존**: 프로젝트 전체 상태
- **특징**: VibeLab과 본 확장팩의 스킬 중 현재 상황에 가장 적합한 다음 단계를 추천합니다. (기존 `/guide`에서 `/workflow`로 통합 및 고도화)

### 4. 🔍 Quality Auditor (`/audit`)

- **의존**: 기획 문서 및 코드베이스
- **특징**: 정량적 품질 점수(Score) 산출 및 정밀 코드 감사.
  - v1.7.4: **2단계 리뷰 프로세스**(Spec Compliance → Code Quality) 및 **DDD(Demo-Driven Development) 검증** 지원.


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

1. **기획**: `/socrates` (VibeLab) → 아이디어를 정밀 문서로
2. **태스크**: `/tasks-generator` (VibeLab) → 레이어별 태스크 생성 (`/tasks-generator from-docs` 권장)
3. **구현**: **`/agile auto` (Extension)** → 🦴💪✨ 레이어별 자동 구현
4. **품질**: **`/audit` (Extension)** → 2단계 정밀 품질 감사 및 DDD 검증
5. **재개**: **`/recover` (Extension)** → 끊긴 작업 맥락 및 오케스트레이션 복구

---

**Inflo Team**
_Enhancing VibeLab with Precision Engineering._
