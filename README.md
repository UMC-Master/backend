# ✨ Git Commit Message Guidelines  

커밋 메시지를 명확하고 간결하게 작성하며 아래의 형식을 따르세요:  

```plaintext
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### 📝 기억해야 할 규칙
#### ✏️ Subject Line
* 🔸 형식: <type>(<scope>): <subject>
* ✅ 현재 시제를 사용하세요 (예: add, fix, update)
* ❌ 문장 끝에 구두점을 사용하지 마세요.
* 🔡 첫 글자는 소문자로 시작합니다.

* * *

### ✅ Allowed <type> Values
|Type|설명|
|:---|:---|
|✨feat|  새로운 기능 추가|
|🐛fix|  버그 수정|
|📚docs|  문서 업데이트|
|🎨style|	 코드 스타일 변경 (포맷팅 등)|
|🔧refactor|	 기능 변화 없는 코드 리팩토링|
|🧪test|	 테스트 추가 또는 업데이트|
|🔨chore|	 빌드, 도구 설정 등 유지보수 작업|

* * *

### 🖋️ Message Body
* 📖 변경 이유를 명확히 설명하세요.
* 🛠️ 이전 코드와의 차이점을 기술하세요.
* ✅ 항상 현재 시제를 사용하고, 간결하게 작성하세요.

* * *

### ⚠️ Breaking Changes

기존 코드와 호환되지 않는 중요한 변경이 있을 경우, BREAKING CHANGE 섹션을 작성하세요:

```
BREAKING CHANGE: <변경 내용 설명>
<마이그레이션 단계>
```

* * *

### 📌 Referencing Issues

관련된 이슈를 푸터에 Closes 키워드를 사용하여 연결하세요:

```
Closes #123  
Closes #456, #789  
```

* * *

# Example
```
feat($browser): onUrlChange event (popstate/hashchange/polling)

Added new event to $browser:
- forward popstate event if available
- forward hashchange event if popstate not available
- do polling when neither popstate nor hashchange available

Breaks $browser.onHashChange, which was removed (use onUrlChange instead)
```
```
fix($compile): couple of unit tests for IE9

Older IEs serialize html uppercased, but IE9 does not...
Would be better to expect case insensitive, unfortunately jasmine does
not allow to user regexps for throw expectations.

Closes #392
Breaks foo.bar api, foo.baz should be used instead
```
```feat(directive): ng:disabled, ng:checked, ng:multiple, ng:readonly, ng:selected

New directives for proper binding these attributes in older browsers (IE).
Added coresponding description, live examples and e2e tests.

Closes #351
```
```
style($location): add couple of missing semi colons
```
```
docs(guide): updated fixed docs from Google Docs

Couple of typos fixed:
- indentation
- batchLogbatchLog -> batchLog
- start periodic checking
- missing brace
```
```
feat($compile): simplify isolate scope bindings

Changed the isolate scope binding options to:
  - @attr - attribute binding (including interpolation)
  - =model - by-directional model binding
  - &expr - expression execution binding

This change simplifies the terminology as well as
number of choices available to the developer. It
also supports local name aliasing from the parent.

BREAKING CHANGE: isolate scope bindings definition has changed and
the inject option for the directive controller injection was removed.

To migrate the code follow the example below:

Before:

scope: {
  myAttr: 'attribute',
  myBind: 'bind',
  myExpression: 'expression',
  myEval: 'evaluate',
  myAccessor: 'accessor'
}

After:

scope: {
  myAttr: '@',
  myBind: '@',
  myExpression: '&',
  // myEval - usually not useful, but in cases where the expression is assignable, you can use '='
  myAccessor: '=' // in directive's template change myAccessor() to myAccessor
}

The removed `inject` wasn't generaly useful for directives so there should be no code using it.
```

# 📚 GitFlow Branch Strategy Guide

### ⚠️ 커밋 규칙

1. 이슈 번호를 커밋 메시지 앞에 붙입니다.
    * 예: #123 feat: add login functionality
2. 커밋 메시지는 영어로 작성합니다.

* * *

### 📂 브랜치 구조 및 용도
#### 1️⃣ main
* 목적: 안정적인 릴리즈 버전 유지.
* 용도: 최종 사용자에게 배포되는 확정된 코드 저장소.
* 주의: main 브랜치는 항상 배포 가능한 상태여야 합니다.

* * *

#### 2️⃣ develop
* 목적: 다음 릴리즈 준비를 위한 개발 진행.
* 용도: 모든 기능(feature) 브랜치가 병합되는 기본 브랜치.
* 주의: release 브랜치로 이동하기 전까지 테스트 완료 상태를 유지해야 합니다.

* * *

#### 3️⃣ feature/<기능명>
* 목적: 새로운 기능 개발 및 개선.
* 용도: develop 브랜치에서 분기하여 작업.
* 작업 완료 후: Pull Request를 통해 develop에 병합합니다.

* * *

#### 4️⃣ hotfix/<버그명>
* 목적: 릴리즈된 버전에서 긴급한 문제 해결.
* 용도: main 브랜치에서 분기하여 수정 후, main과 develop에 병합합니다.

* * *

### 🛠️ 상세 작업 절차
#### 🚀 새 기능 개발
1. 브랜치 생성
     ```
    git checkout develop
    git pull origin develop
    git checkout -b feature/<기능명>
     ```
2. 개발 및 커밋
     ```
     git add .
     git commit -m "#<이슈번호> feat: <기능명에 대한 설명>"
     ```
3. 병합 요청 (Pull Request)
    * develop 브랜치로 Pull Request 생성.
    * 코드 리뷰를 거쳐 병합 승인.

* * *

#### ⚡ 긴급 수정 (Hotfix)
1. 브랜치 생성
     ```
    git checkout main
    git pull origin main
    git checkout -b hotfix/<버그명>
     ```
2. 버그 수정 및 커밋
     ```
     git add .
     git commit -m "#<이슈번호> fix: <버그명에 대한 설명>"
     ```
3. 병합 및 배포
     ```
     git push origin hotfix/<버그명>
     ```
     * main 브랜치에 병합 후 배포 진행.
     * 수정 내용을 develop 브랜치에도 병합합니다.

* * *

### 📊 브랜치 전략 요약

|브랜치|목적|사용 시기|
|:---|:---|:---|
|main|	배포 가능한 안정된 코드|	릴리즈 및 배포
|develop|	개발 진행|	기능 개발
|feature|	새 기능 개발|	기능 추가/수정
|hotfix|	긴급 수정|긴급 버그 수정
