package com.codehire.service.contest;

import com.codehire.document.McqQuestionSet;
import com.codehire.entity.McqContestSubmission;
import com.codehire.entity.User;
import com.codehire.entity.UserStats;
import com.codehire.repository.contest.McqContestSubmissionRepository;
import com.codehire.repository.contest.McqQuestionSetRepository;
import com.codehire.repository.user.UserRepository;
import com.codehire.repository.user.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Handles finalizing a contest submission whose per-user time limit has expired.
 *
 * This MUST live in its own Spring bean (not as a plain method inside
 * McqContestService called via `this.`) because Propagation.REQUIRES_NEW only
 * takes effect when the call passes through the Spring AOP proxy. A self-invoked
 * `this.finalizeExpiredSubmission(...)` call bypasses the proxy entirely and the
 * REQUIRES_NEW annotation would be silently ignored.
 *
 * By running in REQUIRES_NEW, this method opens a brand-new transaction, commits
 * it independently, and returns — BEFORE the caller (McqContestService) throws
 * ContestException and rolls back its own (outer) transaction. That's what fixes
 * the original bug: the finalize save no longer gets wiped out by the rollback.
 */
@Service
@RequiredArgsConstructor
public class ContestFinalizationService {

    private final McqContestSubmissionRepository mcqContestSubmissionRepository;
    private final McqQuestionSetRepository mcqQuestionSetRepository;
    private final UserRepository userRepository;
    private final UserStatsRepository userStatsRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void finalizeExpiredSubmission(Long submissionId, String questionSetId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        McqContestSubmission submission = mcqContestSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));

        if (submission.getSubmittedAt() != null) {
            return;
        }

        McqQuestionSet set = mcqQuestionSetRepository.findById(questionSetId)
                .orElseThrow(() -> new RuntimeException("MCQ Contest not found with ID: " + questionSetId));

        int totalQuestions = set.getQuestions() != null ? set.getQuestions().size() : 0;

        submission.setScoreEarned(0.0);
        submission.setCorrectCount(0);
        submission.setTotalQuestions(totalQuestions);
        submission.setSubmittedAt(LocalDateTime.now());
        mcqContestSubmissionRepository.save(submission);

        UserStats userStats = userStatsRepository.findByUser(user)
                .orElseGet(() -> UserStats.builder()
                        .user(user)
                        .totalScore(0.0)
                        .mcqScore(0.0)
                        .mcqQuizzesTaken(0)
                        .mcqQuestionsCorrect(0)
                        .build());

        userStats.setMcqQuizzesTaken(userStats.getMcqQuizzesTaken() + 1);
        userStatsRepository.save(userStats);
    }
}