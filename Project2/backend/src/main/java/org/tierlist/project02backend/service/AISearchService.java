//package org.tierlist.project02backend.service;
//
//import com.google.cloud.language.v1.AnalyzeEntitiesResponse;
//import com.google.cloud.language.v1.Document;
//import com.google.cloud.language.v1.Entity;
//import com.google.cloud.language.v1.LanguageServiceClient;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.tierlist.project02backend.model.TierList;
//import org.tierlist.project02backend.repository.TierListRepository;
//
//import java.util.ArrayList;
//import java.util.HashSet;
//import java.util.List;
//import java.util.Set;
//
//
//// THIS is all Chat stuff, no idea if it's accurate, needs testing
//
//@Service
//public class AISearchService {
//
//    @Autowired
//    private TierListRepository tierListRepository;
//
//    /**
//     * Searches tier lists by processing the query with Google Cloud Natural Language API.
//     * It extracts entities from the query and performs a keyword search on the title/description.
//     * In case of any failure, it falls back to a simple keyword search using the original query.
//     *
//     * Note: Make sure to add the dependency for Google Cloud Language:
//     *   Maven:
//     *     <dependency>
//     *         <groupId>com.google.cloud</groupId>
//     *         <artifactId>google-cloud-language</artifactId>
//     *         <version>2.7.0</version>
//     *     </dependency>
//     * Also, set the GOOGLE_APPLICATION_CREDENTIALS environment variable with your service account key.
//     */
//    public List<TierList> searchTierLists(String query) {
//        Set<TierList> resultSet = new HashSet<>();
//        try (LanguageServiceClient language = LanguageServiceClient.create()) {
//            Document doc = Document.newBuilder()
//                    .setContent(query)
//                    .setType(Document.Type.PLAIN_TEXT)
//                    .build();
//            AnalyzeEntitiesResponse response = language.analyzeEntities(doc);
//            List<Entity> entities = response.getEntitiesList();
//
//            if (!entities.isEmpty()) {
//                for (Entity entity : entities) {
//                    // Convert each extracted entity to lowercase as keyword
//                    String keyword = entity.getName().toLowerCase();
//                    // Use your repository’s custom query (see note below)
//                    List<TierList> partialResults = tierListRepository.searchByKeyword(keyword);
//                    resultSet.addAll(partialResults);
//                }
//            } else {
//                // Fallback to simple keyword search using the original query
//                resultSet.addAll(tierListRepository.searchByKeyword(query.toLowerCase()));
//            }
//        } catch (Exception e) {
//            // Log the exception as needed and fallback to simple keyword search
//            resultSet.addAll(tierListRepository.searchByKeyword(query.toLowerCase()));
//        }
//        return new ArrayList<>(resultSet);
//    }
//}
