package com.codehire.dto.contest;

import com.codehire.dto.contest.QuestionDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class McqQuestionSetResponse {
    private String id;
    private String title;
    private String topic;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private Double totalMarks;
    private List<QuestionDto> questions;
}