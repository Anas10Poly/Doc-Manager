package com.norsys.backend.repository;

import com.norsys.backend.model.ProjectMember;
import com.norsys.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByUserId(Long userId);
    List<ProjectMember> findByProjectId(Long projectId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ProjectMember pm WHERE pm.user = :user")
    void deleteByUser(User user);
}
