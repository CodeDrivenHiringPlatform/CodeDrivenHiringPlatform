package com.codehire.service.contest;

import com.codehire.document.McqAnswerKey;
import com.codehire.document.McqQuestionSet;
import com.codehire.dto.contest.McqQuestionSetDetailResponse;
import com.codehire.dto.contest.McqQuestionSetListResponse;
import com.codehire.dto.contest.McqResultResponse;
import com.codehire.dto.contest.McqSubmissionRequest;
import com.codehire.entity.McqContestSubmission;
import com.codehire.entity.User;
import com.codehire.entity.UserStats;
import com.codehire.exception.ContestException;
import com.codehire.repository.contest.McqAnswerKeyRepository;
import com.codehire.repository.contest.McqQuestionSetRepository;
import com.codehire.repository.contest.McqContestSubmissionRepository;
import com.codehire.repository.user.UserRepository;
import com.codehire.repository.user.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * NOTE ON THE FIX:
 * The "auto-submit doesn't stick" bug happened because finalizeExpiredSubmission()
 * used to run inside the SAME @Transactional method that then threw a
 * ContestException. Spring rolls back the whole transaction on any unchecked
 * exception, which silently undid the finalize save.
 *
 * Fix: the finalize logic is moved to a separate bean (ContestFinalizationService)
 * annotated with @Transactional(propagation = Propagation.REQUIRES_NEW), so it
 * commits independently in its own transaction BEFORE the ContestException is
 * thrown and the outer transaction rolls back.
 *
 * The second bug (submitContest not checking per-user elapsed time, only the
 * global contest window) is fixed by adding the same elapsed-time check here
 * that already existed in getContestDetails.
 */
@Service
@RequiredArgsConstructor
public class McqContestService {

    private final McqQuestionSetRepository mcqQuestionSetRepository;
    private final McqAnswerKeyRepository mcqAnswerKeyRepository;
    private final McqContestSubmissionRepository mcqContestSubmissionRepository;
    private final UserRepository userRepository;
    private final UserStatsRepository userStatsRepository;
    private final ContestFinalizationService contestFinalizationService;

    public List<McqQuestionSetListResponse> getActiveContests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        LocalDateTime now = LocalDateTime.now();

        // 1. Fetch submitted contest IDs (where submittedAt IS NOT NULL)
        Set<String> submittedSetIds = mcqContestSubmissionRepository.findSubmittedQuestionSetIdsByUser(user);

        // 2. Filter active contests against submitted ID set (In-progress tests stay visible so users can re-enter)
        return mcqQuestionSetRepository.findByStartTimeBeforeAndEndTimeAfter(now, now)
                .stream()
                .filter(contest -> !submittedSetIds.contains(contest.getId()))
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    public List<McqQuestionSetListResponse> getUpcomingContests() {
        LocalDateTime now = LocalDateTime.now();
        return mcqQuestionSetRepository.findByStartTimeAfterOrderByStartTimeAsc(now)
                .stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public McqQuestionSetDetailResponse getContestDetails(String questionSetId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        McqQuestionSet set = mcqQuestionSetRepository.findById(questionSetId)
                .orElseThrow(() -> new RuntimeException("MCQ Contest not found with ID: " + questionSetId));

        LocalDateTime now = LocalDateTime.now();

        if (now.isBefore(set.getStartTime())) {
            throw new ContestException("Contest has not started yet.");
        }
        if (now.isAfter(set.getEndTime())) {
            throw new ContestException("Contest has already ended.");
        }

        // 1. Check if an attempt already exists.
        // synchronized guards against two near-simultaneous first-visit requests
        // both racing past findByUserAndQuestionSetId() and inserting duplicate
        // IN_PROGRESS rows for the same user+contest. For multi-instance deployments,
        // back this with a DB unique constraint on (user_id, question_set_id) as well.
        McqContestSubmission submission;
        boolean isNewAttempt = false;

        synchronized (this) {
            Optional<McqContestSubmission> optionalSubmission =
                    mcqContestSubmissionRepository.findByUserAndQuestionSetId(user, questionSetId);

            if (optionalSubmission.isPresent()) {
                submission = optionalSubmission.get();
            } else {
                submission = McqContestSubmission.builder()
                        .user(user)
                        .questionSetId(set.getId())
                        .startedAt(now)
                        .scoreEarned(null)
                        .correctCount(null)
                        .totalQuestions(null)
                        .submittedAt(null)
                        .build();
                submission = mcqContestSubmissionRepository.save(submission);
                isNewAttempt = true;
            }
        }

        long remainingSeconds;

        if (!isNewAttempt) {
            // If already completed, reject access cleanly
            if (submission.getSubmittedAt() != null) {
                throw new ContestException("You have already submitted this contest.");
            }

            // Calculate remaining seconds based on the original startedAt timestamp
            long elapsedSeconds = ChronoUnit.SECONDS.between(submission.getStartedAt(), now);
            remainingSeconds = (set.getDurationMinutes() * 60L) - elapsedSeconds;

            if (remainingSeconds <= 0) {
                // Finalize in a separate, independently-committing transaction so the
                // save is NOT undone when we throw ContestException below.
                contestFinalizationService.finalizeExpiredSubmission(
                        submission.getId(), set.getId(), user.getEmail());
                throw new ContestException("Your time limit for this contest has expired. It has been automatically submitted.");
            }
        } else {
            remainingSeconds = set.getDurationMinutes() * 60L;
        }

        List<McqQuestionSetDetailResponse.QuestionDto> questions = set.getQuestions().stream()
                .map(q -> McqQuestionSetDetailResponse.QuestionDto.builder()
                        .questionId(q.getQuestionId())
                        .questionText(q.getQuestionText())
                        .options(q.getOptions())
                        .build())
                .collect(Collectors.toList());

        return McqQuestionSetDetailResponse.builder()
                .id(set.getId())
                .title(set.getTitle())
                .topic(set.getTopic())
                .description(set.getDescription())
                .startTime(set.getStartTime())
                .endTime(set.getEndTime())
                .durationMinutes(set.getDurationMinutes())
                .totalMarks(set.getTotalMarks())
                .questions(questions)
                .remainingSeconds(remainingSeconds)
                .build();
    }

    @Transactional
    public McqResultResponse submitContest(McqSubmissionRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        // 1. Fetch existing IN_PROGRESS submission
        McqContestSubmission submission = mcqContestSubmissionRepository
                .findByUserAndQuestionSetId(user, request.getQuestionSetId())
                .orElseThrow(() -> new ContestException("No active attempt found. Please start the contest first."));

        if (submission.getSubmittedAt() != null) {
            throw new ContestException("You have already submitted this contest.");
        }

        McqQuestionSet set = mcqQuestionSetRepository.findById(request.getQuestionSetId())
                .orElseThrow(() -> new RuntimeException("MCQ Contest not found with ID: " + request.getQuestionSetId()));

        LocalDateTime now = LocalDateTime.now();

        // 2. Validate overall contest window
        if (now.isBefore(set.getStartTime())) {
            throw new ContestException("Cannot submit. Contest has not started yet.");
        }
        if (now.isAfter(set.getEndTime())) {
            throw new ContestException("Cannot submit. Contest time window has expired.");
        }

        // 3. Validate the user's OWN elapsed time against the contest duration.
        // This was previously missing entirely, which let users bypass the
        // per-user timer as long as they stayed within the global contest window.
        long elapsedSeconds = ChronoUnit.SECONDS.between(submission.getStartedAt(), now);
        if (elapsedSeconds > set.getDurationMinutes() * 60L) {
            contestFinalizationService.finalizeExpiredSubmission(
                    submission.getId(), set.getId(), user.getEmail());
            throw new ContestException("Your time limit for this contest has expired. It has been automatically submitted.");
        }

        McqAnswerKey answerKey = mcqAnswerKeyRepository.findByQuestionSetId(request.getQuestionSetId())
                .orElseThrow(() -> new RuntimeException("Answer Key not found for contest: " + request.getQuestionSetId()));

        // 4. Evaluate choices (null-safe against a missing/empty answer key map)
        Map<String, Integer> correctAnswersMap =
                answerKey.getCorrectAnswers() != null ? answerKey.getCorrectAnswers() : Map.of();
        Map<String, Integer> userAnswers = request.getAnswers();

        int correctCount = 0;
        int totalQuestions = set.getQuestions() != null ? set.getQuestions().size() : 0;

        if (userAnswers != null && !userAnswers.isEmpty()) {
            for (Map.Entry<String, Integer> entry : userAnswers.entrySet()) {
                String qId = entry.getKey();
                Integer userChoice = entry.getValue();
                Integer correctChoice = correctAnswersMap.get(qId);

                if (correctChoice != null && correctChoice.equals(userChoice)) {
                    correctCount++;
                }
            }
        }

        // 5. Calculate score (explicit double cast so integer division can't truncate)
        double markPerQuestion = totalQuestions > 0 ? (set.getTotalMarks() / (double) totalQuestions) : 0.0;
        double scoreEarned = correctCount * markPerQuestion;

        // 6. Update existing record to COMPLETED
        submission.setScoreEarned(scoreEarned);
        submission.setCorrectCount(correctCount);
        submission.setTotalQuestions(totalQuestions);
        submission.setSubmittedAt(now);
        mcqContestSubmissionRepository.save(submission);

        // 7. Update UserStats — this stays in the SAME transaction as the submission
        // save above (unlike the expired-submission path, which intentionally commits
        // separately). If anything downstream fails, both the submission and the
        // stats update roll back together, which is what we want for a normal submit.
        UserStats userStats = userStatsRepository.findByUser(user)
                .orElseGet(() -> UserStats.builder()
                        .user(user)
                        .totalScore(0.0)
                        .mcqScore(0.0)
                        .mcqQuizzesTaken(0)
                        .mcqQuestionsCorrect(0)
                        .build());

        userStats.setMcqScore(userStats.getMcqScore() + scoreEarned);
        userStats.setTotalScore(userStats.getTotalScore() + scoreEarned);
        userStats.setMcqQuizzesTaken(userStats.getMcqQuizzesTaken() + 1);
        userStats.setMcqQuestionsCorrect(userStats.getMcqQuestionsCorrect() + correctCount);

        userStatsRepository.save(userStats);

        return McqResultResponse.builder()
                .questionSetId(set.getId())
                .totalQuestions(totalQuestions)
                .correctAnswers(correctCount)
                .scoreEarned(scoreEarned)
                .totalMarks(set.getTotalMarks())
                .build();
    }

    private McqQuestionSetListResponse mapToListResponse(McqQuestionSet set) {
        return McqQuestionSetListResponse.builder()
                .id(set.getId())
                .title(set.getTitle())
                .topic(set.getTopic())
                .description(set.getDescription())
                .startTime(set.getStartTime())
                .endTime(set.getEndTime())
                .durationMinutes(set.getDurationMinutes())
                .totalMarks(set.getTotalMarks())
                .totalQuestions(set.getQuestions() != null ? set.getQuestions().size() : 0)
                .build();
    }
}