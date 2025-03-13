package org.tierlist.project02backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.tierlist.project02backend.model.*;
import org.tierlist.project02backend.service.TierListService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tierlists")
public class TierListController {

    private final TierListService tierListService;

    public TierListController(TierListService tierListService) {
        this.tierListService = tierListService;
    }

    @PostMapping
    public TierList createTierList(@RequestBody TierList tierList) {
        return tierListService.createTierList(tierList);
    }

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
}