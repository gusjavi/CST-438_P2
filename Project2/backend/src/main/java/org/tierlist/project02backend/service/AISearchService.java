package org.tierlist.project02backend.service;

import com.google.cloud.language.v1.Document;
import com.google.cloud.language.v1.Entity;
import com.google.cloud.language.v1.LanguageServiceClient;
import org.springframework.stereotype.Service;
import org.tierlist.project02backend.model.TierList;
import org.tierlist.project02backend.repository.TierListRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AISearchService {

    private final TierListRepository tierListRepository;

    public AISearchService(TierListRepository tierListRepository) {
        this.tierListRepository = tierListRepository;
    }

    public Set<TierList> search(String query) {
        Set<TierList> resultSet = new HashSet<>();

        try (LanguageServiceClient language = LanguageServiceClient.create()) {
            Document doc = Document.newBuilder()
                    .setContent(query)
                    .setType(Document.Type.PLAIN_TEXT)
                    .build();

            List<Entity> entities = language.analyzeEntities(doc).getEntitiesList();

            if (!entities.isEmpty()) {
                for (Entity entity : entities) {
                    addResultsFromEntity(entity, resultSet);
                }
            } else {
                fallbackSearch(query, resultSet);
            }
        } catch (Exception e) {
            fallbackSearch(query, resultSet);
        }

        return resultSet;
    }

    private void addResultsFromEntity(Entity entity, Set<TierList> resultSet) {
        String keyword = entity.getName().toLowerCase();
        List<TierList> results = tierListRepository.searchByKeyword(keyword);
        resultSet.addAll(results);
    }

    private void addResultsFromKeyword(String keyword, Set<TierList> resultSet) {
        List<TierList> results = tierListRepository.searchByKeyword(keyword.toLowerCase());
        resultSet.addAll(results);
    }
}
