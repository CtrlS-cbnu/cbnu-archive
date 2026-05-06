# 3주차 프로젝트 검색·추천 인덱싱 검토

## 1. 검토 목적

프로젝트 검색 및 AI 추천 기능에서 활용할 수 있는 인덱싱 대상 필드를 확인하였다. 시험 전 주로 인해 장시간 구현 작업은 진행하지 못하였으나, 기존 백엔드 구조를 기준으로 검색 시스템에 전달할 수 있는 프로젝트 데이터 항목을 검토하였다.

## 2. 검토 대상

- Project 엔티티
- ProjectResponse 구조
- ProjectIndexDocument 구조
- Project 등록 및 조회 API 응답 데이터

## 3. 인덱싱 대상 필드

| 필드 | 활용 목적 |
|---|---|
| projectId | 검색 결과와 상세 조회 연결 |
| title | 프로젝트명 기반 검색 |
| summary | AI 요약 기반 검색 |
| description | 프로젝트 설명 기반 검색 |
| techStacks | 기술 스택 필터링 |
| year | 연도별 검색 |
| semester | 학기별 검색 |
| difficulty | 난이도 기반 필터링 |
| domain | 프로젝트 분야 기반 필터링 |

## 4. 검토 결과

ProjectIndexDocument 구조는 검색 시스템에 전달할 프로젝트 문서 구조로 활용할 수 있으며, 프로젝트 등록 또는 수정 이후 검색 인덱싱 단계에서 사용될 수 있다고 판단하였다. 임베딩 기반 추천 기능을 고려할 경우 description 또는 readme를 기반으로 벡터 데이터를 생성하고, 이를 별도 검색 시스템과 연동하는 방식이 필요하다.

따라서 일반 키워드 검색은 title, summary, description, techStacks 중심으로 구성하고, 조건 검색은 year, semester, difficulty, domain을 활용하는 방식이 적절하다고 정리하였다.