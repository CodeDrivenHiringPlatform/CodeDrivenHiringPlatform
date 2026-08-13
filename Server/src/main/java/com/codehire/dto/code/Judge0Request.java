package com.codehire.dto.code;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Judge0Request {

    @JsonProperty("language_id")
    private Integer languageId;

    @JsonProperty("source_code")
    private String sourceCode;

    private String stdin;

    @JsonProperty("expected_output")
    private String expectedOutput;
}