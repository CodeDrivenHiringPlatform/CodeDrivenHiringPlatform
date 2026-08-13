package com.codehire.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "submissions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_problem",
                        columnNames = {"user_id", "problem_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Submission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "problem_id", nullable = false, length = 100)
    private String problemId;

    @Column(name = "language_id", nullable = false, length = 20)
    private String languageId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String sourceCode;

    @Column(nullable = false)
    private Double scoreEarned;

    @Column(nullable = false)
    private Boolean isPassed;

    @Builder.Default
    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();
}