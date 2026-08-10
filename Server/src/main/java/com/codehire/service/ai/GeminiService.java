package com.codehire.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public JsonNode analyzeProfile(String prompt) throws Exception {

        String url =
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key="
                        + apiKey;

        String requestBody = """
                {
                  "contents": [
                    {
                      "parts": [
                        {
                          "text": %s
                        }
                      ]
                    }
                  ]
                }
                """.formatted("\"" + prompt.replace("\"", "\\\"") + "\"");

        String response = restClient.post()
                .uri(url)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .retrieve()
                .body(String.class);

        System.out.println("Gemini Response:");
        System.out.println(response);

        JsonNode root = objectMapper.readTree(response);

        JsonNode candidates = root.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            return objectMapper.createObjectNode();
        }

        JsonNode parts = candidates.get(0)
                .path("content")
                .path("parts");

        if (!parts.isArray() || parts.isEmpty()) {
            return objectMapper.createObjectNode();
        }

        String aiText = parts.get(0)
                .path("text")
                .asText();

        return objectMapper.readTree(aiText);
    }
}