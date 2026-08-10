package com.codehire.controller;

import com.codehire.dto.ApiResponse;
import com.codehire.dto.user.CandidateProfileResponse;
import com.codehire.dto.user.CandidateSubmissionsResponse;
import com.codehire.dto.user.LeaderboardResponse;
import com.codehire.service.user.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> getProfile(Principal principal) {
        CandidateProfileResponse response = candidateService.getCandidateProfile(principal.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile retrieved successfully", response));
    }

    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> updateProfile(
            @RequestParam("name") String name,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "skills", required = false) String skills,
            @RequestParam(value = "education", required = false) String education,
            @RequestParam(value = "experience", required = false) String experience,
            @RequestParam(value = "projects", required = false) String projects,
            @RequestParam(value = "links", required = false) String links,
            @RequestParam(value = "profilePic", required = false) MultipartFile profilePic,
            Principal principal
    ) throws IOException {

        CandidateProfileResponse updatedProfile = candidateService.updateCandidateProfile(
                principal.getName(),
                name,
                bio,
                skills,
                education,
                experience,
                projects,
                links,
                profilePic
        );

        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", updatedProfile));
    }
    @PostMapping("/profile/analyze")
    public ResponseEntity<?> analyzeProfile(Principal principal) {

        Object response = candidateService.analyzeCandidateProfile(principal.getName());

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Profile analyzed successfully", response)
        );
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardResponse>>> getLeaderboard() {
        List<LeaderboardResponse> leaderboard = candidateService.getLeaderboard();
        return ResponseEntity.ok(new ApiResponse<>(true, "Leaderboard fetched successfully", leaderboard));
    }

    @GetMapping("/submissions")
    public ResponseEntity<ApiResponse<CandidateSubmissionsResponse>> getCandidateSubmissions(Principal principal) {
        CandidateSubmissionsResponse response = candidateService.getCandidateSubmissions(principal.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Submissions fetched successfully", response));
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getPublicProfile(@PathVariable Long id) {
        CandidateProfileResponse profile = candidateService.getPublicProfileByUserId(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Public profile retrieved successfully", profile));
    }
}