package org.tierlist.project02backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.tierlist.project02backend.model.*;
import org.tierlist.project02backend.model.TierList;
import org.tierlist.project02backend.service.AISearchService;
import org.tierlist.project02backend.service.TierListService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tierlists")
public class TierListController {

    private final TierListService tierListService;
    private final AISearchService aiSearchService;

    public TierListController(TierListService tierListService, AISearchService aiSearchService) {
        this.tierListService = tierListService;
        this.aiSearchService = aiSearchService;
    }

    @PostMapping
    public TierList createTierList(@RequestBody TierList tierList) {
        return tierListService.createTierList(tierList);
    }

    // OG endpoint to return all tier lists
    @GetMapping
    public List<TierList> getTierLists() {
        return tierListService.getAllTierLists();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TierList> getTierListById(@PathVariable Long id) {
        return ResponseEntity.of(tierListService.getTierListById(id));
    }

    @GetMapping("/{id}/items")
    public List<TierListItem> getTierListItems(@PathVariable Long id) {
        return tierListService.getTierListItems(id);
    }

    @PostMapping("/{id}/items")
    public TierListItem addTierListItem(@PathVariable Long id, @RequestBody TierListItem item) {
        return tierListService.addTierListItem(id, item);
    }

    @GetMapping("/{id}/ratings")
    public List<TierListRating> getTierListRatings(@PathVariable Long id) {
        return tierListService.getTierListRatings(id);
    }

    @PostMapping("/{tierListId}/items/{itemId}/rate")
    public TierListRating rateTierListItem(
            @PathVariable Long tierListId,
            @PathVariable Long itemId,
            @RequestParam("userId") String userId,
            @RequestParam("ranking") TierListRating.Ranking ranking) {
        return tierListService.rateTierListItem(tierListId, itemId, userId, ranking);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeTierList(
            @PathVariable Long id,
            @RequestParam("userId") String userId) {
        tierListService.likeTierList(id, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> unlikeTierList(
            @PathVariable Long id,
            @RequestParam("userId") String userId) {
        tierListService.unlikeTierList(id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/likes/count")
    public Map<String, Integer> countLikes(@PathVariable Long id) {
        int count = tierListService.countLikesByTierListId(id);
        return Map.of("count", count);
    }

    @GetMapping("/user/{userId}")
    public List<TierList> getUserTierLists(@PathVariable String userId) {
        return tierListService.getTierListsByUser(userId);
    }
    
    // New endpoint for paginated, sorted, and filtered tier lists
    @GetMapping("/paginated")
    public ResponseEntity<?> getPaginatedTierLists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String category) {
        // This method delegates to our service layer which should return a Page<TierList>
        return ResponseEntity.ok(tierListService.getTierLists(page, size, sortBy, category));
    }
    
    // New endpoint for AI-powered search TODO, just a place holder for now
    @GetMapping("/search")
    public ResponseEntity<?> searchTierLists(@RequestParam String query) {
        return ResponseEntity.ok(aiSearchService.searchTierLists(query));
    }
}

