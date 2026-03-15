package com.norsys.backend.repository;

import com.norsys.backend.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    // Trouver les équipes d'un utilisateur spécifique
    @Query("SELECT DISTINCT t FROM Team t " +
            "JOIN t.members tm " +
            "WHERE tm.user.id = :userId")
    List<Team> findByUserId(@Param("userId") Long userId);
}
