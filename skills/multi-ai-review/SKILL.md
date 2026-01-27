---
name: multi-ai-review
description: Claude + Gemini + GLM 멀티-AI 리뷰 오케스트레이션. 3단계 리뷰 시스템으로 Spec Compliance(GLM) -> Creative Review(Gemini) -> Integration(Claude) 수행.
trigger: /review, "리뷰해줘", "검토해줘", "코드 리뷰", "기획서 리뷰", "아키텍처 리뷰"
---

# Multi-AI Review 스킬 (완전 자동화)

> **Agentic Design Pattern**: MCP 프로토콜을 통한 멀티 에이전트 자동 협업

## 개요

Claude(오케스트레이터) + Gemini(MCP) + GLM(MCP)가 **완전 자동화**된 리뷰를 수행합니다.
사용자 개입 없이 여러 라운드의 리뷰-반박-합의 과정을 자동으로 진행합니다.

---

## MCP 소스 설정

### 필수 환경 변수

```bash
# ~/.zshrc 또는 ~/.bashrc에 추가
export GEMINI_API_KEY="your_gemini_api_key"
export GLM_API_KEY="your_glm_api_key"
```

### API Key 발급 방법

- **Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **GLM**: [智谱AI Open Platform](https://open.bigmodel.cn/)

자세한 설정은 `sources/gemini/guide.md`, `sources/glm/guide.md` 참조

---

## 자동화된 리뷰 워크플로우

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Fully Automated Multi-AI Review                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Round 1: Initial Review (병렬 실행)                                    │
│  ├── [MCP] mcp__glm__analyze_code_architecture()                        │
│  └── [MCP] mcp__gemini__gemini_generate_text()                          │
│                                                                          │
│  Round 2: Cross-Review (반박 단계)                                      │
│  ├── GLM이 Gemini 의견 검토 → 반박/동의                                 │
│  └── Gemini가 GLM 의견 검토 → 반박/동의                                 │
│                                                                          │
│  Round 3: Consensus Building (합의 도출)                                │
│  ├── 상충 의견 재검토                                                    │
│  └── 최종 의견 수렴                                                      │
│                                                                          │
│  Final: Claude Integration                                               │
│  ├── Tree of Thought로 모든 의견 평가                                   │
│  ├── Reflection으로 자체 검증                                            │
│  └── 최종 판정 및 리포트 생성                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 실행 방법

### Step 1: 리뷰 요청 분석

사용자 요청을 분석하여 리뷰 유형을 결정합니다:

```markdown
## 리뷰 유형 분석

- **리뷰 유형**: {architecture | code | planning | test | frontend | security | quality}
- **대상 파일**: {파일 목록}
- **리뷰 라운드**: {1-3 라운드, 기본 2라운드}
```

### Step 2: Round 1 - Initial Review (병렬 실행)

**GLM과 Gemini에게 동시에 리뷰 요청:**

```typescript
// GLM에게 Spec Compliance 리뷰 요청
const glmResult = await mcp__glm__analyze_code_architecture({
  code: targetCode,
  focus: ["spec_compliance", "SOLID", "logic_consistency"]
});

// Gemini에게 Creative Review 요청
const geminiResult = await mcp__gemini__gemini_generate_text({
  prompt: `[Creative Reviewer]
  다음 코드/문서를 아키텍처, UX, 혁신성 관점에서 리뷰해주세요:
  ${targetContent}`,
  model: "gemini-2.5-pro"
});
```

### Step 3: Round 2 - Cross-Review (반박 단계)

**각 모델이 상대방의 의견을 검토:**

```typescript
// GLM이 Gemini 의견 검토
const glmCrossReview = await mcp__glm__review_technical_decision({
  decision: geminiResult.suggestions,
  context: "Gemini의 개선 제안에 대한 기술적 타당성 검토"
});

// Gemini가 GLM 의견 검토
const geminiCrossReview = await mcp__gemini__gemini_generate_text({
  prompt: `[Cross Review]
  GLM의 다음 리뷰 의견을 검토하고, 동의/반박 의견을 제시해주세요:
  ${glmResult.issues}`,
  model: "gemini-2.5-pro"
});
```

### Step 4: Round 3 - Consensus (선택적)

**상충 의견이 있을 경우 추가 라운드:**

```typescript
// 상충 의견 식별
const conflicts = identifyConflicts(glmCrossReview, geminiCrossReview);

if (conflicts.length > 0) {
  // GLM에게 최종 의견 요청
  const glmFinal = await mcp__glm__consult_architecture({
    query: `다음 상충 의견에 대한 최종 판단: ${conflicts}`,
    context: "멀티-AI 리뷰 합의 도출"
  });

  // Gemini에게 최종 의견 요청
  const geminiFinal = await mcp__gemini__gemini_generate_text({
    prompt: `[Final Consensus]
    상충 의견: ${conflicts}
    최종 판단을 제시해주세요.`
  });
}
```

### Step 5: Claude Integration

**모든 의견을 종합하여 최종 판정:**

```markdown
## Tree of Thought 분석

```
리뷰 종합 (자동 수집)
├── GLM Round 1: {initial_review}
├── Gemini Round 1: {initial_review}
├── GLM Cross-Review: {cross_review}
├── Gemini Cross-Review: {cross_review}
├── 합의된 의견: {consensus}
├── 남은 상충 의견: {remaining_conflicts}
└── Claude 최종 판단: {final_decision}
```

## Reflection 검증

1. 모든 관점이 충분히 반영되었는가?
2. 상충 의견 해결이 합리적인가?
3. 추가 검토가 필요한 부분은?
```

---

## MCP 도구 매핑

### GLM MCP 도구

| 도구 | 용도 | 사용 단계 |
|------|------|----------|
| `mcp__glm__analyze_code_architecture` | 코드 아키텍처 분석 | Round 1 |
| `mcp__glm__review_technical_decision` | 기술 결정 검토 | Round 2 |
| `mcp__glm__consult_architecture` | 아키텍처 상담 | Round 3 |
| `mcp__glm__design_system_architecture` | 시스템 설계 | 필요시 |

### Gemini MCP 도구

| 도구 | 용도 | 사용 단계 |
|------|------|----------|
| `mcp__gemini__gemini_generate_text` | 텍스트 리뷰 | Round 1, 2, 3 |
| `mcp__gemini__gemini_analyze_image` | 다이어그램 분석 | 아키텍처 리뷰 |
| `mcp__gemini__gemini_count_tokens` | 토큰 계산 | 사전 검증 |

---

## 리뷰 유형별 자동화 전략

### 코드 리뷰

```
Round 1:
├── GLM: analyze_code_architecture (SOLID, 패턴 분석)
└── Gemini: 가독성, 유지보수성, 개선 제안

Round 2:
├── GLM: Gemini 개선 제안의 기술적 타당성 검토
└── Gemini: GLM 이슈의 실용성 검토

Final:
└── Claude: code-review 스킬 연동, 최종 판정
```

### 아키텍처 리뷰

```
Round 1:
├── GLM: design_system_architecture (구조 분석)
├── Gemini: gemini_analyze_image (다이어그램 분석)
└── Gemini: 창의적 대안 제안

Round 2:
├── GLM: Gemini 대안의 기술적 실현 가능성 검토
└── Gemini: GLM 분석의 혁신성 검토

Final:
└── Claude: reasoning (ToT) 연동, 최종 결정
```

### 기획서/PRD 리뷰

```
Round 1:
├── Gemini: 완전성, 명확성, 실현 가능성 리뷰
└── GLM: 논리적 일관성, 기술 요구사항 검증

Round 2:
├── GLM: Gemini 피드백의 구체성 검토
└── Gemini: GLM 검증 결과의 사용자 관점 검토

Final:
└── Claude: socrates 스킬 연동, 개선 방향 제시
```

---

## 반박 프로토콜

### Cross-Review 규칙

각 모델은 상대방 의견을 검토할 때 다음 형식을 따릅니다:

```markdown
## Cross-Review: {상대 모델} 의견 검토

### 동의하는 의견
1. {의견 1}: 동의 - {이유}
2. {의견 2}: 동의 - {이유}

### 반박하는 의견
1. {의견 3}: 반박
   - 원래 의견: {요약}
   - 반박 근거: {이유}
   - 대안 제안: {대안}

### 추가 의견
- {상대가 놓친 관점}
```

### 합의 도출 규칙

1. **2:0 동의**: 즉시 채택
2. **1:1 상충**: Claude가 최종 판단
3. **0:2 반박**: 재검토 또는 제외

---

## 최종 리포트 자동 생성

모든 라운드가 완료되면 `templates/report.md` 형식으로 자동 생성:

```markdown
# Multi-AI Review Report (Automated)

## 리뷰 참여 모델
| 모델 | 라운드 | 주요 기여 |
|------|--------|----------|
| GLM | 1, 2, 3 | Spec Compliance, 기술 검토 |
| Gemini | 1, 2, 3 | Creative Review, 대안 제안 |
| Claude | Final | 종합 판정 |

## 라운드별 결과 요약

### Round 1: Initial Review
- **GLM**: {요약}
- **Gemini**: {요약}

### Round 2: Cross-Review
- **합의된 이슈**: {N}건
- **상충 의견**: {M}건

### Round 3: Consensus (해당시)
- **해결된 상충**: {K}건

## 최종 판정
| 항목 | 결과 |
|------|------|
| **판정** | {Approved/Conditional/Revision Required} |
| **합의율** | {X}% |
| **주요 이슈** | {Critical: N, High: M} |

## 개선 우선순위 Top 5
{자동 생성}
```

---

## 활성화 조건

다음 상황에서 자동 활성화:
- `/review` 명령어 실행 시
- "리뷰해줘", "검토해줘" 키워드 감지
- Phase 완료 후 머지 전
- PR 생성 전 코드 검토 요청

---

## 필수 조건

1. **환경 변수 설정**
   - `GEMINI_API_KEY`: Google AI Studio에서 발급
   - `GLM_API_KEY`: 智谱AI에서 발급

2. **MCP 서버 활성화**
   - `.mcp.json`에 gemini, glm 서버 설정 필요
   - Craft Agent 재시작 필요

---

## 참조 파일

- `templates/gemini-prompt.md` - Gemini용 프롬프트 템플릿
- `templates/glm-prompt.md` - GLM용 프롬프트 템플릿
- `templates/report.md` - 최종 리포트 템플릿
- `sources/gemini/guide.md` - Gemini API 설정 가이드
- `sources/glm/guide.md` - GLM API 설정 가이드
