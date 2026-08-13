package com.codehire.dto.code;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Judge0Response {
    private String stdout;
    private String stderr;
    @JsonProperty("compile_output")
    private String compileOutput;
    private String message;
    private Status status;
    private String time;
    private Integer memory;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Status {
        private Integer id;
        private String description; // e.g., "Accepted", "Wrong Answer"
    }
}