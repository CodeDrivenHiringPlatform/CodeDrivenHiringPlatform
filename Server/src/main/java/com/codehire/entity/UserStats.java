package com.codehire.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Table(name = "user_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserStats extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Column(name = "total_score", nullable = false)
    private Double totalScore = 0.0;

    @Builder.Default
    @Column(name = "coding_score", nullable = false)
    private Double codingScore = 0.0;

    // Future-Proofing: Points earned from MCQ contests/quizzes
    @Builder.Default
    @Column(name = "mcq_score", nullable = false)
    private Double mcqScore = 0.0;

    // Streak Tracking
    @Builder.Default
    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak = 0;

    @Builder.Default
    @Column(name = "longest_streak", nullable = false)
    private Integer longestStreak = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    // Coding Metrics
    @Builder.Default
    @Column(name = "problems_solved", nullable = false)
    private Integer problemsSolved = 0;

    @Builder.Default
    @Column(name = "total_submissions", nullable = false)
    private Integer totalSubmissions = 0;

    // Future-Proofing: MCQ Contest Metrics
    @Builder.Default
    @Column(name = "mcq_quizzes_taken", nullable = false)
    private Integer mcqQuizzesTaken = 0;

    @Builder.Default
    @Column(name = "mcq_questions_correct", nullable = false)
    private Integer mcqQuestionsCorrect = 0;
}