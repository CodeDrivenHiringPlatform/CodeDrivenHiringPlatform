package com.codehire.dto.code;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionRequest {
    private String problemId;
    private String languageId; // e.g., "54" (C++), "62" (Java), "63" (JavaScript)
    private String sourceCode;
}