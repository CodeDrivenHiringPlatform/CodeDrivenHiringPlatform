package com.codehire.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;
import java.util.Map;

/**
 * MongoDB Entity representing a Coding Problem document in the 'problems' collection.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "problems")
public class Problem {

    @Id
    private String id; // Maps to MongoDB's default "_id" ($oid)

    private String title;

    @Field("problem_id")
    private String problemId;

    @Field("frontend_id")
    private String frontendId;

    private String difficulty;

    @Field("problem_slug")
    private String problemSlug;

    private List<String> topics;

    private String description;

    private List<Example> examples;

    private List<String> constraints;

    @Field("follow_ups")
    private List<String> followUps;

    private List<String> hints;

    /**
     * Map of language keys to boilerplate starter code.
     * Example keys: "cpp", "java", "javascript", "python"
     */
    @Field("code_snippets")
    private Map<String, String> codeSnippets;

    /**
     * Map of Judge0 Language IDs to runnable wrapper templates containing // USER_CODE_PLACEHOLDER.
     * Example keys: "54" (C++), "62" (Java), "63" (JavaScript)
     */
    private Map<String, String> wrappers;

    @Field("test_cases")
    private List<TestCase> testCases;

    /**
     * Represents an example provided in the problem description.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Example {

        @Field("example_num")
        private Integer exampleNum;

        @Field("example_text")
        private String exampleText;

        private List<String> images;
    }

    /**
     * Represents a test case used for evaluating user code submissions against Judge0.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCase {

        private String input;

        @Field("expected_output")
        private String expectedOutput;
    }
}