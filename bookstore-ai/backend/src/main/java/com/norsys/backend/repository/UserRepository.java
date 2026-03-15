package com.norsys.backend.repository;

import com.norsys.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u")
    long countAllUsers();

    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC LIMIT 5")
    List<User> findTop5ByOrderByCreatedAtDesc();
}
