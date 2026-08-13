package com.codehire.controller;

import com.codehire.dto.ApiResponse;
import com.codehire.service.code.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/problem")
@RequiredArgsConstructor
public class ProblemController {


    private final ProblemService problemService;

    @GetMapping
    public ResponseEntity<?> getProblems(
            @RequestParam(defaultValue="") String search,
            @RequestParam(defaultValue="All") String topic,
            @RequestParam(defaultValue="All") String difficulty,
            @RequestParam(defaultValue="1") int page,
            @RequestParam(defaultValue="10") int limit
    ){

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Problems fetched successfully",
                problemService.getProblems(search, topic, difficulty, page, limit)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProblemById(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Problem fetched successfully",
                problemService.getProblemById(id)
        ));
    }


    @GetMapping("/topics")
    public ResponseEntity<?> getTopics() {
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Topics fetched successfully",
                problemService.getTopics()
        ));
    }





}
