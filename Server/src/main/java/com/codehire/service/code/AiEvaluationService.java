package com.codehire.service.code;

import com.codehire.dto.code.AiEvaluationRequest;
import com.codehire.dto.code.AiEvaluationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class AiEvaluationService {

    private final RestClient restClient;

    @Value("${ai.evaluation.api.url:http://localhost:8000}")
    private String aiEvaluationApiUrl;

    public AiEvaluationResponse evaluate(String code, String problemDescription, String language) {
        AiEvaluationRequest request = new AiEvaluationRequest(code, problemDescription, language);

        AiEvaluationResponse response = restClient.post()
                .uri(aiEvaluationApiUrl + "/evaluate")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(AiEvaluationResponse.class);

        if (response == null) {
            throw new RuntimeException("No response received from AI Evaluation service.");
        }

        return response;
    }
}