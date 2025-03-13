package org.tierlist.project02backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.tierlist.project02backend.model.TierList;
import java.util.List;

public interface TierListRepository extends JpaRepository<TierList, Long> {

    // method to filter by category
    Page<TierList> findByCategory(String category, Pageable pageable);

    // Custom query to sort tier lists by the number of likes
    @Query("SELECT t FROM TierList t LEFT JOIN t.likes l GROUP BY t ORDER BY COUNT(l) DESC")
    Page<TierList> findTierListsOrderByLikes(Pageable pageable);

    // Simple keyword search on title and description (for AI search) later implementation
    @Query("SELECT t FROM TierList t WHERE LOWER(t.title) LIKE %:keyword% OR LOWER(t.description) LIKE %:keyword%")
    List<TierList> searchByKeyword(@Param("keyword") String keyword);
}
