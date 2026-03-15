package com.norsys.backend.repository;

import com.norsys.backend.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    List<Permission> findByUserId(Long userId);
    List<Permission> findByDocumentId(Long documentId);

    // Documents partagés AVEC l'utilisateur (où il a une permission)
    @Query("SELECT COUNT(DISTINCT p.document.id) FROM Permission p WHERE p.user.id = :userId")
    long countDocumentsSharedWithUser(@Param("userId") Long userId);

    // Documents partagés PAR l'utilisateur (où il est propriétaire du document et d'autres ont une permission)
    @Query("SELECT COUNT(DISTINCT p.document.id) FROM Permission p WHERE p.document.owner.id = :userId")
    long countDocumentsSharedByUser(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Permission p WHERE p.document.id = :documentId")
    void deleteByDocumentId(@Param("documentId") Long documentId);
}