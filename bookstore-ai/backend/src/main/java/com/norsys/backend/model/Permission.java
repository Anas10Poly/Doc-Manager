package com.norsys.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permission")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_permission")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_user", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "id_document", nullable = false)
    private Document document;

    @ManyToOne
    @JoinColumn(name = "id_role", nullable = false)
    private Role role;
}
