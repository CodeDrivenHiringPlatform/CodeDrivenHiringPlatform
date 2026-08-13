package com.codehire.service.code;

import com.codehire.dto.code.Judge0Request;
import com.codehire.dto.code.Judge0Response;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class Judge0Service {

    private final RestClient restClient;

    @Value("${judge0.api.url:http://localhost:2358}")
    private String judge0ApiUrl;

    /**
     * Sends execution request to Judge0 and returns response.
     */
    public Judge0Response execute(int languageId, String sourceCode, String stdin, String expectedOutput) {
        Judge0Request judge0Request = new Judge0Request(
                languageId,
                sourceCode,
                stdin,
                expectedOutput
        );

        Judge0Response response = restClient.post()
                .uri(judge0ApiUrl + "/submissions?wait=true")
                .contentType(MediaType.APPLICATION_JSON)
                .body(judge0Request)
                .retrieve()
                .body(Judge0Response.class);

        if (response == null) {
            throw new RuntimeException("No response received from Judge0.");
        }

        return response;
    }
}