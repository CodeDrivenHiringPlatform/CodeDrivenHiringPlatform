package com.codehire.service.user;
import com.codehire.service.ai.GeminiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.codehire.document.McqQuestionSet;
import com.codehire.document.Problem;
import com.codehire.document.Profile;
import com.codehire.dto.user.CandidateProfileResponse;
import com.codehire.dto.user.CandidateSubmissionsResponse;
import com.codehire.dto.user.LeaderboardResponse;
import com.codehire.entity.McqContestSubmission;
import com.codehire.entity.Submission;
import com.codehire.entity.User;
import com.codehire.entity.UserStats;
import com.codehire.exception.UserException;
import com.codehire.repository.code.ProblemRepository;
import com.codehire.repository.code.SubmissionRepository;
import com.codehire.repository.contest.McqContestSubmissionRepository;
import com.codehire.repository.contest.McqQuestionSetRepository;
import com.codehire.repository.user.ProfileRepository;
import com.codehire.repository.user.UserRepository;
import com.codehire.repository.user.UserStatsRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final UserRepository userRepository;
    private final UserStatsRepository userStatsRepository;
    private final ProfileRepository profileRepository;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;
    private final SubmissionRepository submissionRepository;
    private final McqContestSubmissionRepository mcqContestSubmissionRepository;
    private final ProblemRepository problemRepository;
    private final McqQuestionSetRepository mcqQuestionSetRepository;
    private final GeminiService geminiService;


    public CandidateSubmissionsResponse getCandidateSubmissions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserException("User not found with email: " + email));

        // 1. Fetch Code Submissions & map to DTOs
        List<Submission> codeSubmissions = submissionRepository.findByUser(user);
        List<CandidateSubmissionsResponse.CodeSubmissionItemDto> codeDtos = codeSubmissions.stream()
                .map(sub -> {
                    Problem problem = problemRepository.findByProblemId(sub.getProblemId()).orElse(null);
                    return CandidateSubmissionsResponse.CodeSubmissionItemDto.builder()
                            .submissionId(sub.getId())
                            .problemId(sub.getProblemId())
                            .problemTitle(problem != null ? problem.getTitle() : "Unknown Problem")
                            .difficulty(problem != null ? problem.getDifficulty() : "N/A")
                            .topics(problem != null ? problem.getTopics() : List.of())
                            .languageId(sub.getLanguageId())
                            .sourceCode(sub.getSourceCode())
                            .scoreEarned(sub.getScoreEarned())
                            .isPassed(sub.getIsPassed())
                            .submittedAt(sub.getSubmittedAt())
                            .build();
                })
                .toList();

        // 2. Fetch MCQ Submissions & map to DTOs
        List<McqContestSubmission> mcqSubmissions = mcqContestSubmissionRepository.findByUser(user);
        List<CandidateSubmissionsResponse.McqSubmissionItemDto> mcqDtos = mcqSubmissions.stream()
                .map(sub -> {
                    McqQuestionSet set = mcqQuestionSetRepository.findById(sub.getQuestionSetId()).orElse(null);
                    return CandidateSubmissionsResponse.McqSubmissionItemDto.builder()
                            .submissionId(sub.getId())
                            .questionSetId(sub.getQuestionSetId())
                            .contestTitle(set != null ? set.getTitle() : "Unknown Contest")
                            .topic(set != null ? set.getTopic() : "N/A")
                            .scoreEarned(sub.getScoreEarned())
                            .totalMarks(set != null ? set.getTotalMarks() : 0.0)
                            .correctCount(sub.getCorrectCount())
                            .totalQuestions(sub.getTotalQuestions())
                            .submittedAt(sub.getSubmittedAt())
                            .build();
                })
                .toList();

        // 3. Assemble and return wrapper DTO
        return CandidateSubmissionsResponse.builder()
                .codeSubmissions(codeDtos)
                .mcqSubmissions(mcqDtos)
                .build();
    }
    
    
    public Map<String, Object> analyzeCandidateProfile(String email) {

        try {

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserException("User not found with email: " + email));

            UserStats stats = userStatsRepository.findByUser(user)
                    .orElseGet(() -> UserStats.builder().totalScore(0.0).build());

            Profile profile = profileRepository.findByUserId(user.getId())
                    .orElseGet(() -> Profile.builder().userId(user.getId()).build());

            
            String skills = profile.getSkills() == null ? "Not Provided" :
                profile.getSkills().stream()
                        .map(skill -> skill.getName() + " (" + skill.getLevel() + ")")
                        .collect(Collectors.joining(", "));

        String education = profile.getEducation() == null ? "Not Provided" :
                profile.getEducation().stream()
                        .map(edu -> edu.getDegree() + " - " +
                                edu.getInstitution() + " (" +
                                edu.getStartYear() + " - " +
                                edu.getEndYear() + ")")
                        .collect(Collectors.joining("\n"));

        String experience = profile.getExperience() == null ? "Not Provided" :
                profile.getExperience().stream()
                        .map(exp -> exp.getRole() + " at " +
                                exp.getCompany() +
                                "\nDescription: " + exp.getDescription())
                        .collect(Collectors.joining("\n\n"));

        String projects = profile.getProjects() == null ? "Not Provided" :
                profile.getProjects().stream()
                        .map(project -> project.getTitle() +
                                "\nDescription: " + project.getDescription() +
                                "\nLink: " + project.getLink())
                        .collect(Collectors.joining("\n\n"));

        String links = profile.getLinks() == null || profile.getLinks().isEmpty()
                ? "Not Provided"
                : profile.getLinks().entrySet().stream()
                        .map(entry -> entry.getKey() + ": " + entry.getValue())
                        .collect(Collectors.joining("\n"));
            
            String prompt = """
    You are an expert technical recruiter.

    Analyze the following candidate profile.

    Name: %s

    Total Score: %s

    Bio:
    %s

    Skills:
    %s

    Education:
    %s

    Experience:
    %s

    Projects:
    %s

    Links:
    %s

  Return ONLY a valid JSON object.

Use exactly this format:

{
  "overallScore": 0,
  "professionalSummary": "",
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "atsScore": 0,
  "interviewReadiness": "",
  "suggestions": []
}

Rules:
- Return ONLY JSON.
- No markdown.
- No explanation.
- No ```json.
- No extra text.
- overallScore and atsScore must be integers between 0 and 100.
- strengths, weaknesses, missingSkills and suggestions must be arrays of strings.

    
    """
                    .formatted(
                            user.getName(),
                            stats.getTotalScore(),
                            profile.getBio(),
                            skills,
                            education,
                            experience,
                            projects,
                            links
                    );

            JsonNode aiResponse = geminiService.analyzeProfile(prompt);

            Map<String, Object> response = new java.util.HashMap<>();
            response.put("analysis", aiResponse);

            return response;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to analyze profile", e);
        }
    }
    public CandidateProfileResponse getPublicProfileByUserId(Long userId) {
        // 1. Fetch User from MySQL by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with ID: " + userId));

        // 2. Fetch UserStats from MySQL
        UserStats stats = userStatsRepository.findByUser(user)
                .orElseGet(() -> UserStats.builder().totalScore(0.0).build());

        // 3. Fetch Profile from MongoDB by userId
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> Profile.builder().userId(user.getId()).build());

        // 4. Build and return response
        return CandidateProfileResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profilePic(user.getProfilePic())
                .totalScore(stats.getTotalScore())
                .bio(profile.getBio())
                .skills(profile.getSkills() != null ? profile.getSkills() : List.of())
                .education(profile.getEducation() != null ? profile.getEducation() : List.of())
                .experience(profile.getExperience() != null ? profile.getExperience() : List.of())
                .projects(profile.getProjects() != null ? profile.getProjects() : List.of())
                .certificates(profile.getCertificates() != null ? profile.getCertificates() : List.of())
                .links(profile.getLinks() != null ? profile.getLinks() : Map.of())
                .resumeUrl(profile.getResumeUrl())
                .build();
    }

    /**
     * Get combined Candidate Profile data from MySQL and MongoDB
     */
    public CandidateProfileResponse getCandidateProfile(String email) {
        // 1. Fetch User from MySQL
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserException("User not found with email: " + email));

        // 2. Fetch UserStats from MySQL
        UserStats stats = userStatsRepository.findByUser(user)
                .orElseGet(() -> UserStats.builder().totalScore(0.0).build());

        // 3. Fetch Profile from MongoDB
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> Profile.builder().userId(user.getId()).build());

        // 4. Combine into unified DTO
        return CandidateProfileResponse.builder()
                .name(user.getName())
                .email(user.getEmail())
                .profilePic(user.getProfilePic())
                .totalScore(stats.getTotalScore())
                .bio(profile.getBio())
                .skills(profile.getSkills() != null ? profile.getSkills() : List.of())
                .education(profile.getEducation() != null ? profile.getEducation() : List.of())
                .experience(profile.getExperience() != null ? profile.getExperience() : List.of())
                .projects(profile.getProjects() != null ? profile.getProjects() : List.of())
                .links(profile.getLinks() != null ? profile.getLinks() : Map.of())
                .build();
    }

    /**
     * Update Candidate Profile (Handles image upload + JSON string parsing)
     */
    @Transactional
    public CandidateProfileResponse updateCandidateProfile(
            String email,
            String name,
            String bio,
            String skillsJson,
            String educationJson,
            String experienceJson,
            String projectsJson,
            String linksJson,
            MultipartFile profilePic
    ) throws IOException {

        // 1. Fetch User from MySQL
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserException("User not found with email: " + email));

        // 2. Update User basic info
        if (name != null && !name.trim().isEmpty()) {
            user.setName(name.trim());
        }

        // Handle profile picture update if a new file is uploaded
        if (profilePic != null && !profilePic.isEmpty()) {
            String fileName = fileStorageService.saveFile(profilePic);
            user.setProfilePic(fileName);
        }

        userRepository.save(user);

        // 3. Fetch or initialize MongoDB Profile
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> Profile.builder().userId(user.getId()).build());

        // 4. Parse JSON strings into Java Objects using ObjectMapper
        if (skillsJson != null && !skillsJson.isEmpty()) {
            profile.setSkills(objectMapper.readValue(skillsJson, new TypeReference<List<Profile.Skill>>() {}));
        }
        if (educationJson != null && !educationJson.isEmpty()) {
            profile.setEducation(objectMapper.readValue(educationJson, new TypeReference<List<Profile.Education>>() {}));
        }
        if (experienceJson != null && !experienceJson.isEmpty()) {
            profile.setExperience(objectMapper.readValue(experienceJson, new TypeReference<List<Profile.Experience>>() {}));
        }
        if (projectsJson != null && !projectsJson.isEmpty()) {
            profile.setProjects(objectMapper.readValue(projectsJson, new TypeReference<List<Profile.Project>>() {}));
        }
        if (linksJson != null && !linksJson.isEmpty()) {
            profile.setLinks(objectMapper.readValue(linksJson, new TypeReference<Map<String, String>>() {}));
        }

        profile.setBio(bio);
        profile.setProfileCompleted(true);

        profileRepository.save(profile);

        // 5. Return updated profile view
        return getCandidateProfile(email);
    }


    public List<LeaderboardResponse> getLeaderboard() {
        List<UserStats> statsList = userStatsRepository.findAllTopRankedUsers();

        return statsList.stream()
                .map(stats -> LeaderboardResponse.builder()
                        .userId(stats.getUser().getId())
                        .name(stats.getUser().getName())
                        .profilePic(stats.getUser().getProfilePic())
                        .totalScore(stats.getTotalScore())
                        .problemsSolved(stats.getProblemsSolved())
                        .build())
                .toList();
    }
}