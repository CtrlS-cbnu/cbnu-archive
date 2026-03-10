# 📚 AI 인터렉션 기반 교내 프로젝트 지식 아카이브 (AI-ARCHIVE)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## 📖 목차 (Table of Contents)
1. [프로젝트 개요](#1-프로젝트-개요)
2. [핵심 기능](#2-핵심-기능)
3. [시스템 구성 및 아키텍처](#3-시스템-구성-및-아키텍처)
4. [프로젝트 구조 (Monorepo)](#4-프로젝트-구조-monorepo)
5. [로컬 실행 가이드 (Getting Started)](#5-로컬-실행-가이드-getting-started)
6. [팀 구성 및 담당 업무](#6-팀-구성-및-담당-업무)

---

## 1. 프로젝트 개요

충북대학교 내 다양한 정보기술 프로젝트 산출물이 GitHub 조직 저장소, 개인 저장소, 개인 폴더 등에 분산되어 축적·공유되지 못하는 문제를 해결하기 위해, **프로젝트 자료를 통합 저장하고 자연어 기반으로 탐색·추천할 수 있는 지능형 마이크로서비스(MSA) 아카이브 플랫폼**을 구축하는 프로젝트입니다.

이 플랫폼은 기존의 단순한 웹 기반 전시형 아카이브를 넘어, 사용자가 자연어로 질문하면 관련 프로젝트, 기술 스택, 유사 사례, 난이도 등을 추출해주고 비교·추천까지 제공하는 **대화형 AI 기반 아카이브**를 목표로 합니다.

---

## 2. 핵심 기능

### 🗂️ 프로젝트 아카이브
* 프로젝트 정보 구조화 저장 (문서, 산출물, 소스코드 보관)
* 연도, 관련 과목, 핵심 기술 스택 등 다차원 필터링 기능 지원

### 🤖 AI 기반 검색 및 추천 (자연어 인터랙션)
* **자연어 질의 기반 프로젝트 탐색:** (예: "의료 분야에서 AI를 사용한 프로젝트 예시를 찾아줘")
* **Hybrid Search:** 키워드 기반 메타데이터 검색과 벡터 유사도 기반 시맨틱 검색 결합
* **RAG (Retrieval-Augmented Generation):** LLM을 활용한 검색 결과 기반 프로젝트 맞춤 요약 및 추천 대화 제공

### 📊 메타데이터 자동 추출 및 분석 파이프라인
* 프로젝트 업로드 시 `README.md` 및 소스 코드 파일들을 자동 분석
* 프로젝트의 도메인 파악, 사용 기술 스택 분류, 난이도 및 주요 구현 기능 등을 지능적으로 추출하여 검색 정확도 향상

---

## 3. 시스템 구성 및 아키텍처

본 프로젝트는 안정성과 확장성을 위해 각 기능이 서비스 단위로 분리된 **MSA 구조 (Main Backend + AI Backend)** 를 채택하였습니다.

### 💻 기술 스택 (Tech Stack)
* **Frontend:** React 18+ (Vite 빌드, Tailwind CSS, Zustand/React Query 상태 관리)
* **Main Backend:** Spring Boot 3.x (Java 17+, 클라이언트 API Gateway 역할, 핵심 비즈니스 로직 및 사용자 인증)
* **AI/Search Backend:** FastAPI (Python 3.9+, 임베딩 모델 실행, LLM API 통신 전담)
* **AI Models:** Claude API (자연어 요약/추천), `bge-small` / `e5-small` (경량 오픈소스 임베딩 모델)

### 🗄️ 데이터베이스 및 인프라 (Database & Infrastructure)
* **RDBMS:** PostgreSQL 15+
* **Vector DB:** `pgvector` extension (PostgreSQL의 확장 기능을 사용하여 관계형 메타데이터와 벡터 임베딩 데이터를 동시에 관리)
* **Object Storage:** MinIO (로컬 개발 시나리오 지원, 프로덕션에서는 AWS S3 또는 Supabase Storage 활용 계획)
* **Containerization:** Docker & Docker Compose (개별 서비스의 격리 및 배포 표준화)

---

## 4. 프로젝트 구조 (Monorepo)

본 단일 저장소(Monorepo) 내에 프론트엔드, API 서버, AI 서비스 및 인프라 구성 파일이 논리적으로 분리되어 통합 관리됩니다.

```text
cbnu-archive/
├── frontend/              # 사용자가 인터랙션하는 React 기반 웹 애플리케이션 화면
├── backend/               # 엔터프라이즈 레벨의 메인 API 제공 Spring Boot 서버
├── ai-service/            # AI 모델 연동 및 고속 처리를 담당하는 FastAPI 서버
└── infra/                 # Docker-compose 구성, 초기 스키마(pgvector 등) 세팅
```

---

## 5. 로컬 실행 가이드 (Getting Started)

원활한 로컬 개발을 위해 `docker-compose.yml` 파일이 프로젝트 루트에 준비되어 있습니다. 아래 명령어로 데이터베이스(PostgreSQL) 및 MinIO 스토리지 등 필수 인프라 환경을 한 번에 실행시킬 수 있습니다.

### 필수 조건 (Prerequisites)
- Docker 및 Docker Compose가 설치된 환경

### 🚀 실행 방법
1. **저장소 클론 (Clone Repository):**
   ```bash
   git clone https://github.com/CtrlS-cbnu/cbnu-archive.git
   cd cbnu-archive
   ```
2. **인프라 컨테이너 실행 (Launch Infra Containers):**
   ```bash
   # 프로젝트 루트의 docker-compose.yml을 이용하여 백그라운드 환경(-d)에서 실행
   docker-compose up -d
   ```
   > **Note:** 위 명령어를 실행하면 `pgvector` 확장이 포함된 PostgreSQL 컨테이너와 MinIO 스토리지 노드가 로컬 호스트의 포트로 매핑되어 구동됩니다.
3. **개별 서비스 실행 (각 애플리케이션 README 참조):**
   - 개발을 원하는 디렉토리로 이동하여 별도의 명령어로 실행합니다.
   - **Frontend:** `cd frontend` 후 `npm install && npm run dev`
   - **Backend:** `cd backend` 후 `./gradlew bootRun`
   - **AI-Service:** `cd ai-service` 후 `pip install -r requirements.txt && uvicorn main:app --reload`

---

## 6. 팀 구성 및 담당 업무 (Team CtrlS)

| 팀원 | 담당 분야 | 주요 업무 |
| :---: | :---: | :--- |
| **오재식** | AI | 프로젝트 메타데이터 자동 추출 모듈 구현, Claude RAG 파이프라인 구축, 임베딩 모델 선정 및 벡터 검색 시스템 최적화 |
| **유현우** | Frontend | 전체 UI/UX 기획 및 Tailwind CSS 적용, 상태 최적화, 메인 API 연동 및 자연어 인터랙션(챗) 뷰 렌더링 |
| **김순겸** | DB | 데이터베이스 스키마 설계(ERD), 속도 향상을 위한 메타데이터 정규화, pgvector 인덱싱 전략 구축 |
| **안준석** | Backend | Spring Boot 기반 API 게이트웨이 설계, 사용자 인증/권한 로직 개발, MSA 서비스 간 연동 인터페이스 통합 |

---
*본 프로젝트는 정보기술 관련 학부생들의 프로젝트 산출물이 파편화되는 문제를 해결하고, AI 기반 대화형 검색을 통해 효율적인 지식 전승과 학습 탐색을 지원하고자 설계되었습니다.*
