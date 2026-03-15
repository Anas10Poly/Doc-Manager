package com.norsys.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import com.norsys.backend.model.Permission;
import java.sql.Timestamp;
import lombok.*;
import java.util.List;
import java.util.ArrayList;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;

import lombok.Data;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_document")
    private Long id;

    @Column(nullable = false)
    private String titre;

    private String description;

    @ManyToOne
    @JoinColumn(name = "id_project")
//    @JsonIgnore
    private Project project;

    @ManyToOne
    @JoinColumn(name = "id_team")
//    @JsonIgnore
    private Team team;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
    private User owner;

    @Column(name = "path_fichier", nullable = false)
    private String pathFichier;

    @Column(name = "type_fichier")
    private String typeFichier;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    // Empêche la sérialisation JSON de la liste des permissions
    @JsonIgnore
    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL)
    private List<Permission> permissions = new ArrayList<>();
}
