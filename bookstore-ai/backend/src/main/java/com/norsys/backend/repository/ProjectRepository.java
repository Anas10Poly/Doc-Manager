package com.norsys.backend.repository;

import com.norsys.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    // Trouver les projets d'un utilisateur spécifique
    @Query("SELECT DISTINCT p FROM Project p " +
            "JOIN p.members pm " +
            "WHERE pm.user.id = :userId")
    List<Project> findByUserId(@Param("userId") Long userId);
}
