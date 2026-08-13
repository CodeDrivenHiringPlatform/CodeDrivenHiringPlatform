package com.codehire.document;

import lombok.Data;
import lombok.ToString;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.annotation.Id;

import java.util.List;
import java.util.Map;

@Data
@Document(collection = "public_test_cases")
@ToString
public class PublicTestCase {

    @Id
    private String id;

    @Field("problem_id")
    private String problemId;

    private String title;

    @Field("test_cases")
    private List<TestCase> testCases;

    @Data
    public static class TestCase {

        @Field("example_num")
        private int exampleNum;

        private Map<String, Object> input;

        private String output;
    }
}