package org.tierlist.project02backend.controller;

import org.springframework.web.bind.annotation.*;
import org.tierlist.project02backend.model.TierList;
import org.tierlist.project02backend.service.TierListService;

import java.util.List;

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
}