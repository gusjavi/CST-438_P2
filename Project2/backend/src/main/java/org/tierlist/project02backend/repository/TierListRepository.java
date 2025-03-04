package org.tierlist.project02backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tierlist.project02backend.model.TierList;

public interface TierListRepository extends JpaRepository<TierList, Long> {
    // Query methods (if needed) can/should be defined here
}
