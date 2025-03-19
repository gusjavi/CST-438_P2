package org.tierlist.project02backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tierlist.project02backend.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByName(String name);
}