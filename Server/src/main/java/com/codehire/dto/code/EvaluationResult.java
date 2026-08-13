package com.codehire.dto.code;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationResult {
    private boolean passed;
    private int totalTestCases;
    private int passedTestCases;
    private List<TestCaseResult> testCaseResults;

    private int totalHiddenTestCases;
    private int passedHiddenTestCases;
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseResult {
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private boolean passed;
        private String status; // e.g., "Accepted", "Wrong Answer", "Time Limit Exceeded", "Compilation Error"
        private String error;  // Captures stderr or compile error message if present
    }
}