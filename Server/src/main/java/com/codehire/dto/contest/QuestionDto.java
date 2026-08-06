package com.codehire.dto.contest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    private String questionId;
    private String questionText;
    private List<String> options;
    private Integer correctAnswerIndex; // 0, 1, 2, or 3
}