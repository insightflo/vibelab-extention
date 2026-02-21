# Phase 4: QA Manager 상세 가이드

## 역할
품질 기준 정의, 테스트 전략

## 산출물
`management/quality-gates.md`

## Task 호출

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

## 완료 조건
- [ ] `management/quality-gates.md` 생성됨
- [ ] 각 기준에 구체적인 수치 포함
- [ ] 체크리스트 형식 포함

## 산출물 예시

```markdown
# Quality Gates

## 1. Test Coverage
| Type | Target | Current |
|------|--------|---------|
| Unit | ≥ 80% | - |
| Integration | 100% (critical APIs) | - |
| E2E | 100% (happy path) | - |

## 2. Code Quality
| Metric | Threshold |
|--------|-----------|
| Lint errors | 0 |
| Type errors | 0 |
| Cyclomatic complexity | ≤ 10 |
| Duplication | ≤ 5% |

## 3. Performance
| Metric | Target |
|--------|--------|
| API P95 | ≤ 200ms |
| LCP | ≤ 2.5s |
| FID | ≤ 100ms |
| CLS | ≤ 0.1 |

## 4. Security
- [ ] OWASP Top 10 scan passed
- [ ] No critical/high vulnerabilities
- [ ] Secrets scan passed

## 5. Code Review Checklist
- [ ] Requirements met
- [ ] Tests included
- [ ] Docs updated
- [ ] Performance reviewed
- [ ] Security reviewed

## 6. Release Criteria
- [ ] All tests pass
- [ ] Code review approved
- [ ] Quality gates pass
- [ ] Staging verified
```
