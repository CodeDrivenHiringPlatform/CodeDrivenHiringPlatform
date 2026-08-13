package com.codehire.dto.code;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiEvaluationResponse {

    @JsonProperty("overall_score")
    private Integer overallScore;

    private String verdict;
    private String summary;
    private Approach approach;
    private Complexity complexity;

    @JsonProperty("code_quality")
    private CodeQuality codeQuality;

    private Optimization optimization;

    @JsonProperty("edge_cases")
    private List<String> edgeCases;

    @JsonProperty("interview_feedback")
    private InterviewFeedback interviewFeedback;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Approach {
        private String description;
        private String algorithm;
        private String correctness;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Complexity {
        private String time;
        private String space;
        private String explanation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CodeQuality {
        private Integer score;
        private List<String> strengths;
        private List<String> issues;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Optimization {
        private Boolean needed;
        private List<String> suggestions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewFeedback {
        private List<String> strengths;

        @JsonProperty("areas_to_improve")
        private List<String> areasToImprove;

        private String recommendation;
    }
}