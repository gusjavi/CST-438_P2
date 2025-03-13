package org.tierlist.project02backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tierlist.project02backend.model.TierListItem;

import java.util.List;

public interface TierListItemRepository extends JpaRepository<TierListItem, Long> {
    List<TierListItem> findByTierListId(Long tierListId);
}