package org.tierlist.project02backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.tierlist.project02backend.model.TierList;
import org.tierlist.project02backend.service.AISearchService;
import org.tierlist.project02backend.service.TierListService;

import java.util.List;

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
