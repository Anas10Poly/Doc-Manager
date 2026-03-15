package com.norsys.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rolepermission")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RolePermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rolepermission")
    private Long id;

    @Column(name = "permission_name", nullable = false)
    private String permissionName;

    private boolean allowed = true;

    @ManyToOne
    @JoinColumn(name = "id_role", nullable = false)
    private Role role;
}
