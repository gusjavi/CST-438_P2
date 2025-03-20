package org.tierlist.project02backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.tierlist.project02backend.model.TierList;
import org.tierlist.project02backend.repository.TierListRepository;
import java.util.List;

@Service
public class AISearchService {

    private final TierListRepository tierListRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openai.api.key}")
    private String openAiApiKey;

    public AISearchService(TierListRepository tierListRepository) {
        this.tierListRepository = tierListRepository;
    }

    public List<TierList> searchTierLists(String query) {
        String keyword = extractKeywordWithOpenAI(query);
        return tierListRepository.searchByKeyword(keyword);
    }

    private String extractKeywordWithOpenAI(String query) {
        String prompt = "Extract a concise keyword or short phrase from the following search query to optimize database searching:\n\n"
                + "Query: \"" + query + "\"\nKeyword:";

        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        String requestBody = "{ \"model\": \"gpt-3.5-turbo\", \"messages\": [{\"role\": \"user\", \"content\": \"" + prompt + "\"}], \"max_tokens\": 10, \"temperature\": 0.0 }";

        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

        // Extract keyword safely using JSON parsing (recommended), simplified here for brevity:
        return parseKeywordFromResponse(response.getBody());
    }

    private String parseKeywordFromResponse(String responseBody) {
        // In production use Jackson/Gson; here's a simplified version:
        String marker = "\"content\":\"";
        int start = responseBody.indexOf(marker) + marker.length();
        int end = responseBody.indexOf("\"", start);
        if (start >= marker.length() && end > start) {
            return responseBody.substring(start, end).trim().toLowerCase();
        } else {
            return "";
        }
    }
}
