# AI 메타데이터 저장 구조 검토

## 1. AI 추출 대상 항목

- 프로젝트 요약(summary)
- 기술 스택(techStacks)
- 키워드(keywords)
- 프로젝트 도메인(domain)
- 난이도(difficulty)
- 임베딩 벡터(embedding)

## 2. 기존 Project 엔티티와 연결 가능한 항목

| AI 추출 항목 | 기존 저장 위치 | 비고 |
|---|---|---|
| 프로젝트 요약 | Project.summary | AI 요약 결과 저장 가능 |
| 기술 스택 | Project.techStacks | NLP 기반 추출 결과 반영 가능 |
| 도메인 | Project.domain | 프로젝트 분야 분류 결과 저장 가능 |
| 난이도 | Project.difficulty | 분석 결과 기반 난이도 저장 가능 |
| 설명/README | Project.description, Project.readme | 원본 분석 대상 데이터 |

## 3. 별도 저장이 필요한 항목

| 항목 | 분리 저장 이유 |
|---|---|
| keywords | 검색 인덱싱 및 추천 기능에서 별도 활용 가능 |
| embedding | 벡터 검색용 데이터로 일반 프로젝트 정보와 분리 필요 |
| analysisLog | AI 분석 이력 관리 필요 |
| confidenceScore | AI 추출 결과의 신뢰도 관리 필요 |

## 4. 연동 흐름

1. 사용자가 로그인한다.
2. JWT 인증 후 프로젝트를 등록한다.
3. 프로젝트 description 또는 readme를 AI 모듈에 전달한다.
4. AI 모듈이 summary, keywords, techStacks, domain, difficulty, embedding을 생성한다.
5. 백엔드는 Project 엔티티와 AI 메타데이터 저장 구조에 결과를 반영한다.
6. 검색 및 추천 기능에서 해당 데이터를 활용한다.

## 5. 검토 결과

기본 프로젝트 정보는 기존 Project 엔티티에 저장하고, 검색 및 추천에 직접 활용되는 keywords, embedding, analysisLog 등은 별도 AI 메타데이터 구조로 분리하는 것이 적절하다고 판단하였다.

## 6. 기존 AI 연동 포트 구조 검토

현재 백엔드에는 AI 기능을 직접 구현하기보다 포트 인터페이스를 통해 외부 AI 모듈과 연결할 수 있는 구조가 마련되어 있다. 주요 검토 대상은 `AiSummaryPort`, `EmbeddingPort`, `ExtractedMetadata`, `ProjectIndexDocument`이다.

`AiSummaryPort`는 프로젝트의 README와 설명(description)을 입력받아 요약 결과를 생성하고, 텍스트 기반 메타데이터를 추출하는 역할을 담당한다. 이때 추출되는 메타데이터는 `ExtractedMetadata` 구조로 관리되며, 기술 스택(techStacks), 도메인(domain), 난이도(difficulty)를 포함한다.

`EmbeddingPort`는 프로젝트 설명이나 README와 같은 텍스트 데이터를 임베딩 벡터로 변환하는 역할을 한다. 단일 텍스트뿐 아니라 여러 텍스트를 한 번에 변환할 수 있는 batch 구조도 포함되어 있어, 향후 프로젝트 추천이나 벡터 검색 기능과 연결될 수 있다.

`ProjectIndexDocument`는 검색 인덱싱에 활용될 프로젝트 문서 구조로, projectId, title, summary, description, techStacks, year, semester, difficulty 정보를 포함한다. 따라서 AI 요약 결과와 프로젝트 메타데이터는 검색 시스템에 전달될 수 있는 형태로 정리되어 있음을 확인하였다.

## 7. Project 엔티티 및 검색 인덱스와의 연결 방식

기존 `Project` 엔티티에는 title, summary, description, readme, techStacks, year, semester, difficulty, domain 등의 필드가 존재한다. 이 중 summary, techStacks, difficulty, domain은 AI 분석 결과와 직접 연결될 수 있는 항목이다.

AI 모듈이 README와 description을 분석하면, 요약 결과는 `Project.summary`에 반영할 수 있고, 기술 스택·도메인·난이도는 `ExtractedMetadata` 결과를 바탕으로 기존 프로젝트 정보에 반영할 수 있다. 이후 검색에 필요한 데이터는 `ProjectIndexDocument` 형태로 변환하여 OpenSearch와 같은 검색 시스템에 전달하는 방식이 적절하다고 판단하였다.

## 8. 2주차 검토 결과

2주차에는 팀원이 정의한 NLP 기반 추출 대상 항목과 기존 백엔드의 Project 엔티티 및 AI 연동 포트 구조를 비교하였다. 검토 결과, summary, techStacks, domain, difficulty 등은 기존 Project 엔티티와 직접 연결할 수 있으며, 검색에 필요한 title, summary, description, techStacks, year, semester, difficulty는 `ProjectIndexDocument` 구조로 정리할 수 있음을 확인하였다.

반면 embedding 벡터는 일반 프로젝트 정보와 성격이 다르기 때문에 별도 저장 구조나 벡터 검색 시스템과 연동하는 방식이 적절하다고 판단하였다. 이를 통해 AI 분석 결과 저장 구조와 검색·추천 기능 연동 방향을 구체화하였다.