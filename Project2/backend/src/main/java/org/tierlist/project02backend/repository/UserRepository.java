package org.tierlist.project02backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tierlist.project02backend.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByName(String name);
    Optional<User> findByEmail(String email); // Add this
    Optional<User> findByUserId(String userId); // Add this
    Optional<User> findByUsername(String username); // Add this

    void deleteByUsername(String username); // Add this
}
