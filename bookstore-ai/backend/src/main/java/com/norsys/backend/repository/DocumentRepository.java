package com.norsys.backend.repository;

import com.norsys.backend.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import com.norsys.backend.dto.DocumentStats;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByOwnerId(Long ownerId);
    List<Document> findByProjectId(Long projectId);
    List<Document> findByTeamId(Long teamId);
    List<Document> findByTitreContainingIgnoreCase(String titre);
    List<Document> findByTypeFichierIgnoreCase(String typeFichier);
    @Query("SELECT d FROM Document d LEFT JOIN FETCH d.owner LEFT JOIN FETCH d.project LEFT JOIN FETCH d.team")
    List<Document> findAllWithAssociations();

    @Query("SELECT d FROM Document d WHERE d.owner.id = :userId ORDER BY d.createdAt DESC")
    List<Document> findTop5ByOwnerIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.project.id IN (" +
            "SELECT pm.project.id FROM ProjectMember pm WHERE pm.user.id = :userId)")
    long countDocumentsInUserProjects(@Param("userId") Long userId);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.team.id IN (" +
            "SELECT tm.team.id FROM TeamMember tm WHERE tm.user.id = :userId)")
    long countDocumentsInUserTeams(@Param("userId") Long userId);

    @Query("SELECT d FROM Document d WHERE d.project.id IN (" +
            "SELECT pm.project.id FROM ProjectMember pm WHERE pm.user.id = :userId) " +
            "OR d.team.id IN (" +
            "SELECT tm.team.id FROM TeamMember tm WHERE tm.user.id = :userId)")
    List<Document> findDocumentsInUserProjectsOrTeams(@Param("userId") Long userId);

    @Query("SELECT new com.norsys.backend.dto.DocumentStats(d.createdAt, COUNT(d)) " +
            "FROM Document d WHERE d.owner.id = :userId " +
            "GROUP BY d.createdAt ORDER BY d.createdAt")
    List<DocumentStats> countDocumentsByDateForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(d) FROM Document d")
    long countAllDocuments();

    @Query("SELECT d.typeFichier, COUNT(d) FROM Document d GROUP BY d.typeFichier")
    List<Object[]> countDocumentsByType();

    @Query("SELECT d FROM Document d ORDER BY d.createdAt DESC LIMIT 5")
    List<Document> findTop5ByOrderByCreatedAtDesc();

}