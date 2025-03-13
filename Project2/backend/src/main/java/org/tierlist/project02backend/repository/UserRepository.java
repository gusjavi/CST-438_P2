package org.tierlist.project02backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tierlist.project02backend.model.User;

public interface UserRepository extends JpaRepository<User, String> {
    // Additional methods if needed
}