package com.codehire.controller;

import com.codehire.dto.ApiResponse;
import com.codehire.dto.contest.McqQuestionSetDetailResponse;
import com.codehire.dto.contest.McqQuestionSetListResponse;
import com.codehire.dto.contest.McqResultResponse;
import com.codehire.dto.contest.McqSubmissionRequest;
import com.codehire.service.contest.McqContestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/contest")
@RequiredArgsConstructor
public class McqContestController {

    private final McqContestService mcqContestService;

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<McqQuestionSetListResponse>>> getActiveContests(Principal principal) {
        List<McqQuestionSetListResponse> activeContests = mcqContestService.getActiveContests(principal.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Active contests retrieved successfully", activeContests));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<McqQuestionSetListResponse>>> getUpcomingContests() {
        List<McqQuestionSetListResponse> upcomingContests = mcqContestService.getUpcomingContests();
        return ResponseEntity.ok(new ApiResponse<>(true, "Upcoming contests retrieved successfully", upcomingContests));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<McqQuestionSetDetailResponse>> getContestDetails(
            @PathVariable("id") String questionSetId,
            Principal principal
    ) {
        // Will initialize attempt on first fetch or return calculated remainingSeconds if resuming
        McqQuestionSetDetailResponse contestDetails = mcqContestService.getContestDetails(questionSetId, principal.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Contest details retrieved successfully", contestDetails));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<McqResultResponse>> submitContest(
            @RequestBody McqSubmissionRequest request,
            Principal principal
    ) {
        // Validates active attempt and updates existing submission record with final score
        McqResultResponse result = mcqContestService.submitContest(request, principal.getName());

        String message = String.format(
                "MCQ submission processed. Correct answers: %d/%d. Total score earned: %.2f",
                result.getCorrectAnswers(),
                result.getTotalQuestions(),
                result.getScoreEarned()
        );

        return ResponseEntity.ok(new ApiResponse<>(true, message, result));
    }
}