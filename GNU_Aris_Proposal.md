# Google Summer of Code (GSoC) Proposal: GNU Aris

## 1. Personal Information
* **Name:** Dravin Gupta
* **Email:** dravingupta12@gmail.com
* **GitHub:** [https://github.com/Dravingupta](https://github.com/Dravingupta)
* **LeetCode:** [https://leetcode.com/u/dravingupta/](https://leetcode.com/u/dravingupta/) (Over 200+ C++ algorithmic problems solved)
* **University:** Guru Nanak Dev University, Amritsar
* **Timezone:** IST (UTC +5:30)

## 2. Project Summary / Abstract
**Project Title:** GNU Aris: UI and Feature Enhancements
**Organization:** GNU Project
**Project Size:** 175 Hours (Medium)
**Technologies Used:** C/C++, Qt, QML, CMake, WebAssembly

GNU Aris is a powerful logical proof program that serves as a vital educational tool. However, its effectiveness relies heavily on its usability and the breadth of its logical operations. This proposal outlines a comprehensive plan to significantly enhance GNU Aris by introducing critical UI improvements—such as dynamic zooming, internationalization (language changes), copy/paste/highlight functionalities, and auto-updating correctness feedback—alongside core logical additions like the exclusive disjunction operator and proof by contrapositive. Additionally, this project will resolve existing community issues (e.g., Issue #24) and improve error messaging to lower the learning curve for introductory logic students.

## 3. Project Description & Objectives
The primary objective of this project is to bridge the gap between GNU Aris’s robust backend proof engine and the end-user experience. Students learning formal logic often struggle with unintuitive interfaces or cryptic error parsing. By upgrading the UI via Qt/QML and expanding the C++ core logical parser, we will make Aris more accessible across varied devices (including WebAssembly targets).

**Key Objectives:**
1. **Accessibility & UI/UX:** Implement zoom features for smaller screens, full localization (language change), clipboard interactions, and clear, descriptive error messaging.
2. **Logical Engine Expansion:** Add support for the *Exclusive Disjunction* (XOR) operator and the *Proof by Contrapositive* rule to the existing C++ inference engine.
3. **Interactive Feedback:** Introduce auto-updates for correctness feedback so users can see validation states in real-time as they construct proofs.
4. **Issue Resolution:** Investigate and patch existing bugs, focusing specifically on Issue #24, ensuring robust cross-platform compilation via CMake.

## 4. Technical Approach / Implementation Details
As a software engineer highly proficient in C++ and algorithmic logic, I will tackle both the Qt frontend and the C++ abstract syntax tree (AST) manipulator.

*   **Better Error Messages & Auto-Updates:** 
    I will refactor the error-handling pipeline to catch specific syntax and logical validation errors at the AST level. Instead of silent failures or generic faults, the system will emit localized error codes to the Qt UI, displaying contextual tooltips dynamically.
*   **Zoom Feature & Responsive Qt/QML:**
    Utilizing QML's `Scale` and dynamic layout properties (`Layout.preferredWidth`, anchors), I will introduce a global scaling factor accessible via a UI slider or keyboard shortcuts (`Ctrl++` / `Ctrl+-`), ensuring the proof canvas scales gracefully without degrading rendering quality.
*   **Language Change Option:**
    I will implement Qt's `QTranslator` and `QLocale` framework to load `.qm` translation files dynamically. The UI will feature a dropdown to switch languages at runtime without requiring application restart.
*   **Clipboard Integration (Copy/Paste/Highlighting):**
    Using `QGuiApplication::clipboard()`, I will allow users to serialize selected logical steps into string representations, enabling seamless copy-pasting of premises/conclusions between different Aris instances or text editors.
*   **Exclusive Disjunction & Contrapositive Context:**
    In the core C++ logic engine, I will extend the lexer and parser to recognize the exclusive disjunction token (e.g., `⊕` or `XOR`). I will implement the corresponding inference rules (e.g., from `A ⊕ B` to `(A ∨ B) ∧ ¬(A ∧ B)`). Similarly, I will register the *Proof by Contrapositive* transformation (from `P → Q` to `¬Q → ¬P`) in the rule evaluation matrix.

## 5. Deliverables
*   **Fully Implemented UI Enhancements:** Working Zoom functionality, dynamic Language selector, and native Copy/Paste/Highlight module.
*   **Expanded Logic Features:** C++ implementations for Exclusive Disjunction and Proof by Contrapositive, accompanied by comprehensive unit tests.
*   **Enhanced Feedback System:** Real-time UI correctness feedback and significantly improved, localized error messages.
*   **Issue Triage:** A finalized and merged patch for Bug #24.
*   **Testing & CI:** Complete Qt testing routines and validation of the WebAssembly build target via CMake.

## 6. Expected Timeline / Plan (175 Hours)

*   **Community Bonding (pre-coding):** Engage with Aris maintainers. Study the C++ proof engine's architecture, Lexer/Parser AST generation, and the Qt/QML UI binding layer.
*   **Week 1 (20 hrs) - UI Foundations:** Implement the Zoom scaling feature in QML to support smaller resolutions securely. Begin localization foundation (`QTranslator`).
*   **Week 2 (20 hrs) - Text & Input Handling:** Integrate Qt clipboard APIs. Implement full Copy/Paste/Highlight logic for proof steps. Add functionality to swap the type of an input (Premise vs. Conclusion).
*   **Week 3 (20 hrs) - Logic Engine Expansion 1:** Modify the C++ Lexer/Parser to accept the Exclusive Disjunction operator. Write unit tests for its truth-functional properties.
*   **Week 4 (25 hrs) - Logic Engine Expansion 2:** Implement the Proof by Contrapositive rule into the core inference checker. Ensure edge cases involving complex nested statements are safely evaluated.
*   **Week 5 (25 hrs) - Feedback & Error Messaging:** Overhaul the error reporting classes. Implement auto-updating Qt signals that emit upon every AST modification to provide real-time correctness feedback.
*   **Week 6 (20 hrs) - Bug Fixing & Stabilization:** Focus extensively on analyzing, recreating, and solving Issue #24. Refactor related CMake files to ensure proper WebAssembly target building.
*   **Week 7-8 (45 hrs) - Polish, Testing & Documentation:** Write exhaustive unit tests for all new UI signals and logical operators. Ensure seamless CMake building across Linux/Windows/Wasm. Complete extensive documentation for users and developers. Final submission.

## 7. Qualifications & Experience
I possess a unique blend of high-performance C++ algorithmic logic and modern frontend interface design.

*   **C++ & Algorithmic Logic Mastery:** I have solved over **200+ C++ problems on LeetCode** ([Profile](https://leetcode.com/u/dravingupta/)). This rigorous practice has honed my ability to manipulate complex data structures—such as Abstract Syntax Trees (ASTs)—which is precisely the skill required to expand GNU Aris's logical parsing engine (e.g., adding XOR and Contrapositive rules).
*   **Full-Stack UI/UX Engineering:** As the lead architect of **DiversifyAI**, I designed and implemented highly complex, interactive user interfaces managing dynamic data states. My deep understanding of UI/UX lifecycles perfectly positions me to execute the Qt/QML enhancements like dynamic scaling, real-time correctness feedback loops, and clipboard management.
*   **Tooling:** I am highly proficient with Git, CMake build configurations, and modern memory-safe C++ practices.

## 8. Availability & Commitments
As a university student, my schedule allows me to dedicate the required 15-20 hours per week reliably throughout the Summer. I have no conflicting internships or major academic commitments during the requested coding weeks. I will ensure daily communication via IRC, Mailing Lists, or Matrix.

## 9. Why GNU Aris? / Motivation
GNU Aris embodies the perfect intersection of computer science and pure logic/mathematics. As someone who rigorously studies algorithms and problem-solving, contributing to a tool that teaches formal logic is highly motivating. I believe free software is the best educational equalizer, and I want to empower students globally by making Aris's interface as elegant as the logic it represents.

## 10. Communication & Reporting
I am committed to maintaining extreme transparency. I will:
*   Submit bi-weekly progress reports detailing roadblocks and code diffs.
*   Be highly responsive on GNU IRC channels and development mailing lists.
*   Maintain a public devlog/blog mapping my GSoC journey to help future contributors understand the codebase.
