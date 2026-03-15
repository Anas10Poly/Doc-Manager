package com.norsys.backend.repository;

import com.norsys.backend.model.TeamMember;
import com.norsys.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByUserId(Long userId);
    List<TeamMember> findByTeamId(Long teamId);

    @Modifying
    @Transactional
    @Query("DELETE FROM TeamMember tm WHERE tm.user = :user")
    void deleteByUser(User user);
}
