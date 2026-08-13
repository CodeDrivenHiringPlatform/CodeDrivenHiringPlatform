package com.codehire.dto.code;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiEvaluationRequest {

    private String code;

    @JsonProperty("problem_description")
    private String problemDescription;

    private String language;
}