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
public class SubmissionResponse {

    private boolean passed;
    private int totalTestCases;
    private int passedTestCases;
    private int totalHiddenTestCases;
    private int passedHiddenTestCases;
    private List<EvaluationResult.TestCaseResult> testCaseResults;
    private AiEvaluationResponse aiEvaluation;
    private boolean isFirstSubmission;
}