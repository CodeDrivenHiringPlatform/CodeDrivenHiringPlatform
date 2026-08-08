package com.codehire.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "mcq_submissions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_mcq_contest",
                        columnNames = {"user_id", "question_set_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class McqContestSubmission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "question_set_id", nullable = false, length = 100)
    private String questionSetId;

    // Made nullable until user submits
    @Column(name = "score_earned", nullable = true)
    private Double scoreEarned;

    // Made nullable until user submits
    @Column(name = "correct_count", nullable = true)
    private Integer correctCount;

    // Made nullable until user submits
    @Column(name = "total_questions", nullable = true)
    private Integer totalQuestions;

    // Timestamp when the user opens/starts the test
    @Builder.Default
    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    // Nullable until final submission
    @Column(name = "submitted_at", nullable = true)
    private LocalDateTime submittedAt;
}