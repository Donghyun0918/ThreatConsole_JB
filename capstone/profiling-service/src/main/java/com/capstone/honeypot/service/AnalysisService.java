package com.capstone.honeypot.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AnalysisService {

    @Value("${fastapi.url}")
    private String fastapiUrl;

    public Map<String, Object> analyze(String attackType, String payload, String ipAddress) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
                "attackType", attackType,
                "payload",    payload != null ? payload : "",
                "ipAddress",  ipAddress != null ? ipAddress : ""
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    fastapiUrl + "/analyze", request, Map.class
            );
            return response.getBody();
        } catch (RestClientException e) {
            return Map.of(
                    "riskScore", 50,
                    "severity",  "MEDIUM",
                    "summary",   "자동 분석 실패: " + e.getMessage(),
                    "solution",  "FastAPI 서비스 상태를 확인하세요."
            );
        }
    }
}
