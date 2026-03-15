-- Ajouter des utilisateurs
INSERT INTO users (nom, prenom, email, password) VALUES
                                                     ('El Ouerkhaoui', 'Hiba', 'h.elouerkhaoui@example.com', 'hashedpwd1'),
                                                     ('Belafkih', 'Amira', 'a.belafkih@example.com', 'hashedpwd2'),
                                                     ('Elhmid', 'Anas', 'a.elhmid@example.com', 'hashedpwd3'),
                                                     ('Ouarhi', 'Hamza', 'o.hamza@example.com', 'hashedpwd4');

-- Ajouter des projets
INSERT INTO project (name) VALUES
                               ('Application de gestion des tâches'),
                               ('Migration de SI'),
                               ('Plateforme de gestion documentaire');

-- Ajouter des équipes
INSERT INTO team (name) VALUES
                            ('Équipe Technique'),
                            ('Équipe RH'),
                            ('Équipe Bénévolat');

-- Ajouter des membres de projets
INSERT INTO project_members (id_user, id_project) VALUES
                                                      (1, 1), -- Hiba dans Gestion des tâches
                                                      (2, 1), -- Amira dans Gestion des tâches
                                                      (3, 2), -- Anas dans Migration de SI
                                                      (4, 3); -- Hamza dans Gestion documentaire

-- Ajouter des membres d'équipes
INSERT INTO team_members (id_user, id_team) VALUES
                                                (1, 1), -- Hiba dans Équipe Technique
                                                (2, 2), -- Amira dans Équipe RH
                                                (3, 1), -- Anas dans Équipe Technique
                                                (4, 3); -- Hamza dans Équipe Bénévolat

-- Ajouter des roles
INSERT INTO roles (name) VALUES
                            ('viewer'),   -- id 1
                            ('editor'),   -- id 2
                            ('admin');    -- id 3

-- viewer
INSERT INTO rolepermission (id_role, permission_name, allowed) VALUES
                                                                   (1, 'read', true),
                                                                   (1, 'download', true),
                                                                   (1, 'write', false),
                                                                   (1, 'delete', false);

-- editor
INSERT INTO rolepermission (id_role, permission_name, allowed) VALUES
                                                                   (2, 'read', true),
                                                                   (2, 'download', true),
                                                                   (2, 'write', true),
                                                                   (2, 'delete', false);

-- admin
INSERT INTO rolepermission (id_role, permission_name, allowed) VALUES
                                                                   (3, 'read', true),
                                                                   (3, 'download', true),
                                                                   (3, 'write', true),
                                                                   (3, 'delete', true);


-- Ajouter des documents
-- Document de projet (Migration SI) de Hiba
INSERT INTO documents (titre, description, id_project, id_team, owner_id, path_fichier, type_fichier) VALUES
    ('Plan de migration', 'Document technique pour la migration du SI', 2, NULL, 1, '/docs/plan_migration.pdf', 'pdf');

-- Document d’équipe (Équipe Technique) de Anas
INSERT INTO documents (titre, description, id_project, id_team, owner_id, path_fichier, type_fichier) VALUES
    ('Charte technique', 'Charte interne de l’équipe', NULL, 1, 3, '/docs/charte_technique.pdf', 'pdf');

-- Document lié à un projet de Hamza (Gestion de documents)
INSERT INTO documents (titre, description, id_project, id_team, owner_id, path_fichier, type_fichier) VALUES
    ('Spécifications GED', 'Spécifications fonctionnelles du système GED', 3, NULL, 4, '/docs/specs_ged.pdf', 'pdf');


-- Donner les permissions aux utilisateurs
-- Hamza (viewer) sur Plan de migration
INSERT INTO permission (id_user, id_document, id_role) VALUES
    (3, 1, 1);

-- Amira (editor) sur Plan de migration
INSERT INTO permission (id_user, id_document, id_role) VALUES
    (2, 1, 2);

-- Hiba (editor) sur Charte technique
INSERT INTO permission (id_user, id_document, id_role) VALUES
    (1, 2, 2);

-- Hamza (admin) sur son document
INSERT INTO permission (id_user, id_document, id_role) VALUES
    (4, 3, 3);

-- Hiba (admin) sur son document
INSERT INTO permission (id_user, id_document, id_role) VALUES
    (1, 1, 3);

-- Anas (admin) sur son document
INSERT INTO permission (id_user, id_document, id_role) VALUES
    (3, 2, 3);

-- Anas (viewer) sur le document de Hamza
INSERT INTO permission (id_user, id_document, id_role) VALUES
    (3, 3, 1);