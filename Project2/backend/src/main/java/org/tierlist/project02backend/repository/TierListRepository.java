package org.tierlist.project02backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.tierlist.project02backend.model.TierList;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.Optional;

public interface TierListRepository extends JpaRepository<TierList, Long> {

    List<TierList> findByCreatorUserId(String userId);

    // Changed to explicit query to fix potential naming convention issue
    @EntityGraph(attributePaths = {"creator"})
    @Query("SELECT t FROM TierList t WHERE t.isPublic = true")
    List<TierList> findByIsPublicTrue();

    @Modifying
    @Transactional
    @Query("UPDATE TierList t SET t.isWeeklyFeatured = false WHERE t.isWeeklyFeatured = true")
    void clearWeeklyFeatured();

    Optional<TierList> findByIsWeeklyFeaturedTrue();

    @Query(value = """
    SELECT * FROM tier_lists 
    WHERE is_weekly_featured = false 
      AND DATE(scheduled_for) = CURDATE()
    ORDER BY scheduled_for
    LIMIT 1
    """, nativeQuery = true)
    Optional<TierList> findNextScheduled();

    @Query("SELECT tl FROM TierList tl JOIN TierListLike tll ON tl.id = tll.tierList.id WHERE tll.user.userId = :userId")
    List<TierList> findLikedTierListsByUserId(@Param("userId") String userId);


    // Keep the commented methods for future implementation
//    Page<TierList> findByCategory(String category, Pageable pageable);
//
//    // Custom query to sort tier lists by the number of likes
//    @Query("SELECT t FROM TierList t LEFT JOIN t.likes l GROUP BY t ORDER BY COUNT(l) DESC")
//    Page<TierList> findTierListsOrderByLikes(Pageable pageable);
//
//    // Simple keyword search on title and description (for AI search) later implementation
//    @Query("SELECT t FROM TierList t WHERE LOWER(t.title) LIKE %:keyword% OR LOWER(t.description) LIKE %:keyword%")
//    List<TierList> searchByKeyword(@Param("keyword") String keyword);
}