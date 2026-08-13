package com.codehire.controller;

import com.codehire.dto.ApiResponse;
import com.codehire.dto.code.EvaluationResult;
import com.codehire.dto.code.SubmissionRequest;
import com.codehire.dto.code.SubmissionResponse;
import com.codehire.service.code.CodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/code")
@RequiredArgsConstructor
public class CodeController {

    private final CodeService codeService;

    @PostMapping("/run")
    public ResponseEntity<ApiResponse<EvaluationResult>> runCode(@RequestBody SubmissionRequest request) {
        EvaluationResult result = codeService.runCode(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Code executed successfully", result));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<SubmissionResponse>> submitCode(
            @RequestBody SubmissionRequest request,
            Principal principal
    ) {
        SubmissionResponse result = codeService.submitCode(request, principal.getName());

        String submissionInfo = result.isFirstSubmission()
                ? "Code submitted successfully and score generated."
            : "Code already submitted previously. No score generated.";

        String message = String.format(
                "%s Public test cases: %d/%d passed. Hidden test cases: %d/%d passed.",
                submissionInfo,
                result.getPassedTestCases(),
                result.getTotalTestCases(),
                result.getPassedHiddenTestCases(),
                result.getTotalHiddenTestCases()
        );

        boolean success = result.isPassed() &&
                (result.getPassedHiddenTestCases() == result.getTotalHiddenTestCases());

        return ResponseEntity.ok(new ApiResponse<>(true, message, result));
    }
}