package com.codehire.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "private_test_cases")
public class PrivateTestCase {

    @Id
    private String id;

    @Field("problem_id")
    private String problemId;

    @Field("problem_slug")
    private String problemSlug;

    @Field("hidden_test_cases")
    private List<HiddenTestCase> hiddenTestCases;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HiddenTestCase {
        private String input;

        @Field("expected_output")
        private String expectedOutput;
    }
}