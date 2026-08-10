package com.codehire.dto.contest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class McqResultResponse {

    private String questionSetId;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Double scoreEarned;
    private Double totalMarks;
}