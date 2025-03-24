package org.tierlist.project02backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.tierlist.project02backend.model.TierList;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;

public interface TierListRepository extends JpaRepository<TierList, Long> {

    List<TierList> findByCreatorUserId(String userId);

    // Changed to explicit query to fix potential naming convention issue
    @EntityGraph(attributePaths = {"creator"})
    @Query("SELECT t FROM TierList t WHERE t.isPublic = true")
    List<TierList> findByIsPublicTrue();
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