package com.codehire.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "mcq_answer_keys")
public class McqAnswerKey {

    @Id
    private String id;

    @Field("question_set_id")
    private String questionSetId;

    /**
     * Map of questionId to the correct option index (0, 1, 2, or 3)
     */
    @Field("correct_answers")
    private Map<String, Integer> correctAnswers;
}