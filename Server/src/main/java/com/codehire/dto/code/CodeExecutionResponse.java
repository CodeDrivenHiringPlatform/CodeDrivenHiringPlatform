package com.codehire.dto.code;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class CodeExecutionResponse {

    private int totalTestCases;
    private int passed;
    private int failed;
    private String status;

    private List<TestResult> results;


    @Data
    @AllArgsConstructor
    public static class TestResult {

        private int testCase;
        private Map<String,Object> input;

        private String expectedOutput;
        private String actualOutput;

        private String status;

        private String executionTime;
        private String memory;
    }
}