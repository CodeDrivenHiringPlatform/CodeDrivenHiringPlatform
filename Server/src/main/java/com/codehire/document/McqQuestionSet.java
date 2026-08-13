package com.codehire.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "mcq_question_sets")
public class McqQuestionSet {

    @Id
    private String id;

    private String title;

    private String topic;

    private String description;

    @Field("start_time")
    private LocalDateTime startTime; // When contest opens

    @Field("end_time")
    private LocalDateTime endTime;   // When contest closes completely

    @Field("duration_minutes")
    private Integer durationMinutes; // Time limit once user starts (e.g., 30 mins)

    @Field("total_marks")
    private Double totalMarks;

    private List<Question> questions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Question {

        @Field("question_id")
        private String questionId;

        @Field("question_text")
        private String questionText;

        private List<String> options; // Exactly 4 options
    }
}