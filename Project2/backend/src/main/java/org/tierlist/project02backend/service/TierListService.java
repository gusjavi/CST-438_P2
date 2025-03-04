package org.tierlist.project02backend.service;

import org.springframework.stereotype.Service;
import org.tierlist.project02backend.model.TierList;
import org.tierlist.project02backend.repository.TierListRepository;

import java.util.List;

@Service
public class TierListService {

    private final TierListRepository tierListRepository;

    public TierListService(TierListRepository tierListRepository) {
        this.tierListRepository = tierListRepository;
    }

    public TierList createTierList(TierList tierList) {
        return tierListRepository.save(tierList);
    }

    public List<TierList> getAllTierLists() {
        return tierListRepository.findAll();
    }
}
