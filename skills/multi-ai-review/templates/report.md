# Multi-AI Review 최종 리포트 템플릿

## 기본 템플릿

```markdown
# Multi-AI Review Report

**프로젝트**: {{project_name}}
**Phase**: {{phase}}
**리뷰 대상**: {{target_description}}
**리뷰 일시**: {{date}}
**리뷰 유형**: {{review_type}}

---

## 참여 모델

| 모델 | 역할 | 담당 영역 |
|------|------|----------|
| **Claude** | Orchestrator & Integrator | 종합 판단, 최종 결정 |
| **Gemini** | Creative Reviewer | {{gemini_focus}} |
| **GLM** | Detail Reviewer | {{glm_focus}} |

---

## Stage 1: Spec Compliance (GLM)

### 결과 요약
- **상태**: {{stage1_status}} <!-- ✅ Pass / ⚠️ Conditional / ❌ Fail -->
- **Spec 준수율**: {{compliance_rate}}%
- **발견 이슈**: Critical {{critical_count}}건 / High {{high_count}}건 / Medium {{medium_count}}건

### Spec Compliance 상세

| 요구사항 | 상태 | 비고 |
|---------|------|------|
{{spec_compliance_table}}

### 주요 이슈 (GLM 발견)

#### Critical
{{glm_critical_issues}}

#### High
{{glm_high_issues}}

### GLM 종합 의견
{{glm_summary}}

---

## Stage 2: Creative Review (Gemini)

### 결과 요약
- **상태**: {{stage2_status}} <!-- ✅ Excellent / ⚠️ Suggestions / ❌ Issues -->
- **아키텍처 평가**: {{architecture_rating}}
- **개선 제안**: {{suggestion_count}}건
- **대안 아이디어**: {{alternative_count}}건

### 긍정적 평가
{{gemini_positives}}

### 개선 제안 (우선순위별)
{{gemini_suggestions}}

### 대안 아이디어
{{gemini_alternatives}}

### Gemini 종합 의견
{{gemini_summary}}

---

## Stage 3: Integration & Decision (Claude)

### Tree of Thought 분석

```
리뷰 종합
├── GLM 의견 분석
│   ├── Spec 준수율: {{compliance_rate}}%
│   ├── 주요 발견: {{glm_key_findings}}
│   └── 권장 조치: {{glm_recommendation}}
│
├── Gemini 의견 분석
│   ├── 아키텍처 평가: {{architecture_rating}}
│   ├── 핵심 제안: {{gemini_key_suggestions}}
│   └── 혁신 포인트: {{gemini_innovations}}
│
└── Claude 종합 판단
    ├── 의견 일치점: {{agreement_points}}
    ├── 의견 상충점: {{conflict_points}}
    └── 최종 결론: {{final_conclusion}}
```

### 의견 비교 분석

#### 공통 의견 (3개 모델 동의)
{{common_opinions}}

#### 상충 의견 및 해결
| 항목 | GLM 의견 | Gemini 의견 | Claude 판단 |
|------|---------|------------|------------|
{{conflict_resolution_table}}

### Reflection 검증

#### 자체 검토 질문
1. **누락된 관점이 있는가?**
   {{reflection_missing}}

2. **종합 판단에 편향이 없는가?**
   {{reflection_bias}}

3. **추가 고려 사항이 있는가?**
   {{reflection_additional}}

#### 검증 결과
{{reflection_result}}

---

## 최종 판정

### 판정 결과

| 항목 | 결과 |
|------|------|
| **최종 판정** | {{final_verdict}} |
| **조건** | {{verdict_conditions}} |
| **다음 단계** | {{next_steps}} |

### 판정 근거

```
판정: {{final_verdict}}

근거:
1. Spec Compliance: {{spec_basis}}
2. Architecture: {{architecture_basis}}
3. Quality: {{quality_basis}}
4. Risk: {{risk_basis}}
```

### 판정 기준 충족 여부

| 기준 | 요구 조건 | 현재 상태 | 충족 |
|------|----------|----------|------|
| Critical 이슈 | 0건 | {{critical_count}}건 | {{critical_met}} |
| High 이슈 | ≤2건 | {{high_count}}건 | {{high_met}} |
| Spec 준수율 | ≥90% | {{compliance_rate}}% | {{compliance_met}} |
| 아키텍처 평가 | Good 이상 | {{architecture_rating}} | {{architecture_met}} |

---

## 개선 우선순위 Top 5

| 순위 | 중요도 | 항목 | 발견 모델 | 권장 조치 |
|------|--------|------|----------|----------|
| 1 | {{priority1_level}} | {{priority1_item}} | {{priority1_model}} | {{priority1_action}} |
| 2 | {{priority2_level}} | {{priority2_item}} | {{priority2_model}} | {{priority2_action}} |
| 3 | {{priority3_level}} | {{priority3_item}} | {{priority3_model}} | {{priority3_action}} |
| 4 | {{priority4_level}} | {{priority4_item}} | {{priority4_model}} | {{priority4_action}} |
| 5 | {{priority5_level}} | {{priority5_item}} | {{priority5_model}} | {{priority5_action}} |

---

## 상세 이슈 목록

### Critical 이슈
{{all_critical_issues}}

### High 이슈
{{all_high_issues}}

### Medium 이슈
{{all_medium_issues}}

### Low 이슈
{{all_low_issues}}

---

## 부록

### A. 리뷰 메트릭 (evaluation 연동)

| 메트릭 | 값 | 기준 | 상태 |
|--------|-----|------|------|
| 총 이슈 발견 수 | {{total_issues}} | - | - |
| Critical 비율 | {{critical_ratio}}% | <5% | {{critical_status}} |
| 리뷰 커버리지 | {{review_coverage}}% | ≥95% | {{coverage_status}} |
| 모델 간 일치율 | {{agreement_rate}}% | ≥70% | {{agreement_status}} |

### B. 연동 스킬 결과

#### code-review (해당 시)
{{code_review_result}}

#### quality-auditor (해당 시)
{{quality_auditor_result}}

#### vercel-review (해당 시)
{{vercel_review_result}}

### C. 히스토리

| 리뷰 회차 | 일시 | 판정 | 주요 변경 |
|----------|------|------|----------|
{{review_history}}

---

**리포트 생성**: Claude (Orchestrator)
**리뷰 참여**: Claude + Gemini + GLM
**생성 일시**: {{generated_at}}
```

---

## 판정별 요약 템플릿

### Approved (승인)

```markdown
## 최종 판정: ✅ Approved

**축하합니다! 리뷰를 통과했습니다.**

### 요약
- Spec 준수율 {{compliance_rate}}%로 기준 충족
- 아키텍처 평가 {{architecture_rating}}
- Critical/High 이슈 없음

### 다음 단계
1. 즉시 머지 가능
2. (선택) Low/Medium 이슈 개선 고려

### 긍정적 피드백
{{positive_feedback}}
```

### Conditional (조건부 승인)

```markdown
## 최종 판정: ⚠️ Conditional Approval

**마이너 수정 후 머지 가능합니다.**

### 수정 필요 사항
{{required_fixes}}

### 수정 후 확인 방법
- [ ] 위 수정 사항 적용
- [ ] 테스트 통과 확인
- [ ] 재리뷰 없이 머지 가능

### 타임라인
- 권장 수정 기한: {{fix_deadline}}
```

### Revision Required (수정 필요)

```markdown
## 최종 판정: ❌ Revision Required

**주요 수정 후 재리뷰가 필요합니다.**

### 필수 수정 사항

#### Critical
{{critical_fixes}}

#### High
{{high_fixes}}

### 재리뷰 요청 시 확인 사항
- [ ] Critical 이슈 모두 해결
- [ ] High 이슈 해결 또는 정당화
- [ ] 관련 테스트 추가/수정
- [ ] 변경 사항 설명 문서

### 지원 필요 시
{{support_info}}
```

### Rejected (거부)

```markdown
## 최종 판정: ❌❌ Rejected

**근본적인 재설계가 필요합니다.**

### 거부 사유
{{rejection_reasons}}

### 권장 조치
1. 아키텍처 재검토 필요
2. 기획 단계로 회귀 권장
3. 새로운 접근 방식 논의 필요

### 다음 단계
1. 팀 미팅 소집
2. 대안 설계 논의
3. 새 PR로 재시작

### 참고 자료
{{reference_materials}}
```
