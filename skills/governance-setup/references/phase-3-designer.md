# Phase 3: Chief Designer 상세 가이드

## 역할
디자인 시스템 정의, UI/UX 가이드라인

## 산출물
`design/system/*.md`

## Task 호출

```
Task({
  subagent_type: "frontend-specialist",
  description: "Designer: 디자인 시스템 정의",
  prompt: `
## 역할: Chief Designer

당신은 이 프로젝트의 Chief Designer입니다. 디자인 시스템을 정의하세요.

## 입력 정보
- PRD: docs/planning/01-prd.md (사용자 요구사항)
- Screen Specs: specs/screens/*.yaml (있는 경우)

## 산출물: design/system/ 폴더

### design/system/tokens.md
디자인 토큰 정의:
- Color Palette (Primary, Secondary, Neutral, Semantic)
- Typography Scale (Font family, sizes, weights)
- Spacing Scale (4px base grid)
- Border Radius, Shadows

### design/system/components.md
컴포넌트 규칙:
- Button variants (Primary, Secondary, Ghost, Danger)
- Input fields (Text, Select, Checkbox, Radio)
- Card, Modal, Toast
- 상태별 스타일 (Default, Hover, Active, Disabled, Error)

### design/system/layout.md
레이아웃 규칙:
- Grid system (12-column)
- Breakpoints (Mobile, Tablet, Desktop)
- Container widths
- Page templates

### design/system/accessibility.md
접근성 가이드:
- Color contrast ratios (WCAG AA)
- Focus indicators
- ARIA labels 규칙
- Keyboard navigation

## 주의사항
- 구현 코드 작성 금지 (CSS/Tailwind 예시만 포함)
- 일관성 있는 디자인 언어 정의
`
})
```

## 완료 조건
- [ ] `design/system/` 폴더 생성됨
- [ ] 최소 4개 문서 작성됨
- [ ] Color palette에 최소 5가지 색상 정의됨

## 디자인 토큰 예시

```markdown
# Design Tokens

## Colors

### Primary
- primary-50: #EEF2FF
- primary-500: #6366F1
- primary-900: #312E81

### Neutral
- gray-50: #F9FAFB
- gray-500: #6B7280
- gray-900: #111827

### Semantic
- success: #10B981
- warning: #F59E0B
- error: #EF4444
- info: #3B82F6

## Typography

| Name | Size | Weight | Line Height |
|------|------|--------|-------------|
| h1 | 2.25rem | 700 | 2.5rem |
| h2 | 1.875rem | 600 | 2.25rem |
| body | 1rem | 400 | 1.5rem |
| small | 0.875rem | 400 | 1.25rem |

## Spacing
- 4px (xs), 8px (sm), 16px (md), 24px (lg), 32px (xl)
```
