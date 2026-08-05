package com.codehire.controller;

import com.codehire.dto.ApiResponse;

import com.codehire.dto.contest.McqQuestionSetResponse;
import com.codehire.dto.contest.McqQuestionSetRequest;
import com.codehire.service.admin.AdminMcqContestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/mcq-sets")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminMcqContestController {

    private final AdminMcqContestService adminMcqContestService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<McqQuestionSetResponse>>> getAllQuestionSets() {
        List<McqQuestionSetResponse> questionSets = adminMcqContestService.getAllQuestionSets();
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Question sets retrieved successfully", questionSets)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<McqQuestionSetResponse>> getQuestionSetById(@PathVariable String id) {
        McqQuestionSetResponse questionSet = adminMcqContestService.getQuestionSetById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Question set retrieved successfully", questionSet)
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<McqQuestionSetResponse>> createQuestionSet(@RequestBody McqQuestionSetRequest request) {
        McqQuestionSetResponse createdSet = adminMcqContestService.createQuestionSet(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>(true, "Question set created successfully", createdSet)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<McqQuestionSetResponse>> updateQuestionSet(
            @PathVariable String id,
            @RequestBody McqQuestionSetRequest request) {
        McqQuestionSetResponse updatedSet = adminMcqContestService.updateQuestionSet(id, request);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Question set updated successfully", updatedSet)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestionSet(@PathVariable String id) {
        adminMcqContestService.deleteQuestionSet(id);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Question set deleted successfully", null)
        );
    }
}