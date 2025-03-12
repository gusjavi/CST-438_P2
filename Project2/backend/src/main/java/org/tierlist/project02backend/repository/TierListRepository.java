package org.tierlist.project02backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tierlist.project02backend.model.TierList;

import java.util.List;

public interface TierListRepository extends JpaRepository<TierList, Long> {
    List<TierList> findByCreatorUserId(String userId);
}