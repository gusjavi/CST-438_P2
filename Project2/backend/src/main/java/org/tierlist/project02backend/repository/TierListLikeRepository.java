package org.tierlist.project02backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.tierlist.project02backend.model.TierListLike;

@Repository
public interface TierListLikeRepository extends JpaRepository<TierListLike, Long> {
    @Query("SELECT COUNT(l) FROM TierListLike l WHERE l.tierList.id = ?1")
    int countByTierListId(Long tierListId);

    boolean existsByUser_UserIdAndTierListId(String userId, Long tierListId);

    @Modifying
    @Query("DELETE FROM TierListLike l WHERE l.user.userId = ?1 AND l.tierList.id = ?2")
    void deleteByUserIdAndTierListId(String userId, Long tierListId);
    @Modifying
    @Query("DELETE FROM TierListLike l WHERE l.tierList.id = ?1")
    void deleteAllByTierListId(Long tierListId);

}
