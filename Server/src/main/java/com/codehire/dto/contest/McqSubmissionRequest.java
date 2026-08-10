package com.codehire.dto.contest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class McqSubmissionRequest {

    private String questionSetId;

    /**
     * Map of questionId -> selectedOptionIndex (0, 1, 2, or 3)
     */
    private Map<String, Integer> answers;
}