package com.codehire.service.code;

import com.codehire.document.Problem;
import com.codehire.dto.code.AiEvaluationResponse;
import com.codehire.dto.code.EvaluationResult;
import com.codehire.dto.code.Judge0Response;
import com.codehire.dto.code.SubmissionRequest;
import com.codehire.dto.code.SubmissionResponse;
import com.codehire.entity.Submission;
import com.codehire.entity.User;
import com.codehire.entity.UserStats;
import com.codehire.repository.code.PrivateTestCaseRepository;
import com.codehire.repository.code.ProblemRepository;
import com.codehire.repository.code.SubmissionRepository;
import com.codehire.repository.user.UserRepository;
import com.codehire.repository.user.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CodeService {

    private final ProblemRepository problemRepository;
    private final PrivateTestCaseRepository privateTestCaseRepository;
    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private final UserStatsRepository userStatsRepository;
    private final Judge0Service judge0Service;
    private final AiEvaluationService aiEvaluationService;

    private static final double DEFAULT_PROBLEM_SCORE = 100.0;

    public EvaluationResult runCode(SubmissionRequest request) {
        return runTestCases(request);
    }

    @Transactional
    public SubmissionResponse submitCode(SubmissionRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        boolean isFirstSubmission = !submissionRepository.existsByUserAndProblemId(user, request.getProblemId());

        // 1. Run basic (public) test cases
        EvaluationResult result = runTestCases(request);

        // STOP HERE: If public test cases fail, raise an exception immediately
        if (!result.isPassed()) {
            throw new RuntimeException("Submission failed: Public test cases did not pass.");
        }

        // 2. Fetch problem details and run hidden test cases
        Problem problem = problemRepository.findByProblemId(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found with ID: " + request.getProblemId()));

        String wrapperTemplate = problem.getWrappers().get(request.getLanguageId());
        if (wrapperTemplate == null) {
            throw new IllegalArgumentException("Unsupported language ID: " + request.getLanguageId());
        }

        String finalExecutableCode = wrapperTemplate.replace("// USER_CODE_PLACEHOLDER", request.getSourceCode());
        int languageId = Integer.parseInt(request.getLanguageId());

        int passedHiddenCount = 0;
        int totalHiddenCount = 0;

        var privateTestCaseOpt = privateTestCaseRepository.findByProblemId(request.getProblemId());

        if (privateTestCaseOpt.isPresent() && privateTestCaseOpt.get().getHiddenTestCases() != null) {
            var hiddenCases = privateTestCaseOpt.get().getHiddenTestCases();
            totalHiddenCount = hiddenCases.size();

            for (var hiddenCase : hiddenCases) {
                Judge0Response response = judge0Service.execute(
                        languageId,
                        finalExecutableCode,
                        hiddenCase.getInput(),
                        hiddenCase.getExpectedOutput()
                );

                String statusDesc = response.getStatus() != null ? response.getStatus().getDescription() : "";
                String stdout = response.getStdout() != null ? response.getStdout().trim() : "";
                String expected = hiddenCase.getExpectedOutput() != null ? hiddenCase.getExpectedOutput().trim() : "";

                if ("Accepted".equalsIgnoreCase(statusDesc) && stdout.equals(expected)) {
                    passedHiddenCount++;
                }
            }
        }

        // 3. Call AI Evaluation Service
        AiEvaluationResponse aiEvaluation = aiEvaluationService.evaluate(
                request.getSourceCode(),
                problem.getDescription(),
                request.getLanguageId()
        );

        // Build SubmissionResponse payload
        SubmissionResponse submissionResponse = SubmissionResponse.builder()
                .passed(result.isPassed())
                .totalTestCases(result.getTotalTestCases())
                .passedTestCases(result.getPassedTestCases())
                .totalHiddenTestCases(totalHiddenCount)
                .passedHiddenTestCases(passedHiddenCount)
                .testCaseResults(result.getTestCaseResults())
                .aiEvaluation(aiEvaluation)
                .isFirstSubmission(isFirstSubmission)
                .build();

        // 4. Calculate score
        double earnedScore = DEFAULT_PROBLEM_SCORE + (passedHiddenCount * 10.0);

        // 5. Save Submission ONLY on first submission
        boolean allPassed = result.isPassed() && (passedHiddenCount == totalHiddenCount);

        if (isFirstSubmission) {
            Submission submission = Submission.builder()
                    .user(user)
                    .problemId(request.getProblemId())
                    .languageId(request.getLanguageId())
                    .sourceCode(request.getSourceCode())
                    .scoreEarned(earnedScore)
                    .isPassed(true)
                    .submittedAt(LocalDateTime.now())
                    .build();

            submissionRepository.save(submission);
        }

        // 6. Update UserStats ONLY on first submission
        if (isFirstSubmission) {
            UserStats userStats = userStatsRepository.findByUser(user)
                    .orElseGet(() -> UserStats.builder()
                            .user(user)
                            .totalScore(0.0)
                            .problemsSolved(0)
                            .totalSubmissions(0)
                            .build());

            userStats.setTotalScore(userStats.getTotalScore() + earnedScore);
            if (allPassed) {
                userStats.setProblemsSolved(userStats.getProblemsSolved() + 1);
            }
            userStats.setTotalSubmissions(userStats.getTotalSubmissions() + 1);

            userStatsRepository.save(userStats);
        }

        return submissionResponse;
    }

    private EvaluationResult runTestCases(SubmissionRequest request) {
        Problem problem = problemRepository.findByProblemId(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found with ID: " + request.getProblemId()));

        String wrapperTemplate = problem.getWrappers().get(request.getLanguageId());
        if (wrapperTemplate == null) {
            throw new IllegalArgumentException("Unsupported language ID: " + request.getLanguageId());
        }

        String finalExecutableCode = wrapperTemplate.replace("// USER_CODE_PLACEHOLDER", request.getSourceCode());

        List<EvaluationResult.TestCaseResult> testCaseResults = new ArrayList<>();
        int passedCount = 0;
        int languageId = Integer.parseInt(request.getLanguageId());

        for (Problem.TestCase testCase : problem.getTestCases()) {
            Judge0Response judge0Response = judge0Service.execute(
                    languageId,
                    finalExecutableCode,
                    testCase.getInput(),
                    testCase.getExpectedOutput()
            );

            String statusDesc = judge0Response.getStatus() != null ? judge0Response.getStatus().getDescription() : "Unknown";
            String stdout = judge0Response.getStdout() != null ? judge0Response.getStdout().trim() : "";
            String expected = testCase.getExpectedOutput() != null ? testCase.getExpectedOutput().trim() : "";

            String error = judge0Response.getCompileOutput() != null ? judge0Response.getCompileOutput()
                    : (judge0Response.getStderr() != null ? judge0Response.getStderr() : judge0Response.getMessage());

            boolean isPassed = "Accepted".equalsIgnoreCase(statusDesc) && stdout.equals(expected);
            if (isPassed) {
                passedCount++;
            }

            testCaseResults.add(EvaluationResult.TestCaseResult.builder()
                    .input(testCase.getInput())
                    .expectedOutput(expected)
                    .actualOutput(stdout)
                    .passed(isPassed)
                    .status(statusDesc)
                    .error(error)
                    .build());
        }

        boolean overallPassed = (passedCount == problem.getTestCases().size());

        return EvaluationResult.builder()
                .passed(overallPassed)
                .totalTestCases(problem.getTestCases().size())
                .passedTestCases(passedCount)
                .testCaseResults(testCaseResults)
                .build();
    }
}