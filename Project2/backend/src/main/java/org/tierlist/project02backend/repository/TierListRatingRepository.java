package org.tierlist.project02backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.tierlist.project02backend.model.TierListRating;

import java.util.List;
import java.util.Optional;

public interface TierListRatingRepository extends JpaRepository<TierListRating, Long> {
    List<TierListRating> findByTierListId(Long tierListId);

    @Query("SELECT r FROM TierListRating r WHERE r.user.userId = ?1 AND r.tierListItem.id = ?2")
    Optional<TierListRating> findByUserIdAndTierListItemId(String userId, Long itemId);
    void deleteByTierListItemId(Long itemId);
}