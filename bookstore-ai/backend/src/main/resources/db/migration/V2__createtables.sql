-- Table: users
CREATE TABLE users (
                       id_user SERIAL PRIMARY KEY,
                       nom VARCHAR(100),
                       prenom VARCHAR(100),
                       email VARCHAR(150) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: project
CREATE TABLE project (
                         id_project SERIAL PRIMARY KEY,
                         name VARCHAR(150) NOT NULL
);

-- Table: team
CREATE TABLE team (
                      id_team SERIAL PRIMARY KEY,
                      name VARCHAR(150) NOT NULL
);

-- Table: role
CREATE TABLE role (
                      id_role SERIAL PRIMARY KEY,
                      name VARCHAR(100) NOT NULL
);

-- Table: rolepermission
CREATE TABLE rolepermission (
                                id_rolepermission SERIAL PRIMARY KEY,
                                id_role INT NOT NULL,
                                permission_name VARCHAR(50) NOT NULL,
                                allowed BOOLEAN DEFAULT TRUE,
                                FOREIGN KEY (id_role) REFERENCES role(id_role)
);

-- Table: documents
CREATE TABLE documents (
                           id_document SERIAL PRIMARY KEY,
                           titre VARCHAR(200) NOT NULL,
                           description TEXT,
                           id_project INT,
                           id_team INT,
                           owner_id INT NOT NULL,
                           path_fichier VARCHAR(255) NOT NULL,
                           type_fichier VARCHAR(50),
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           FOREIGN KEY (id_project) REFERENCES project(id_project),
                           FOREIGN KEY (id_team) REFERENCES team(id_team),
                           FOREIGN KEY (owner_id) REFERENCES users(id_user),
                           CONSTRAINT chk_project_or_team CHECK (
                               (id_project IS NOT NULL AND id_team IS NULL) OR
                               (id_project IS NULL AND id_team IS NOT NULL)
                               )
);

-- Table: permission
CREATE TABLE permission (
                            id_permission SERIAL PRIMARY KEY,
                            id_user INT NOT NULL,
                            id_document INT NOT NULL,
                            id_role INT NOT NULL,
                            FOREIGN KEY (id_user) REFERENCES users(id_user),
                            FOREIGN KEY (id_document) REFERENCES documents(id_document),
                            FOREIGN KEY (id_role) REFERENCES role(id_role)
);

-- Table: project_members
CREATE TABLE project_members (
                                 id SERIAL PRIMARY KEY,
                                 id_user INT NOT NULL,
                                 id_project INT NOT NULL,
                                 FOREIGN KEY (id_user) REFERENCES users(id_user),
                                 FOREIGN KEY (id_project) REFERENCES project(id_project)
);

-- Table: team_members
CREATE TABLE team_members (
                              id SERIAL PRIMARY KEY,
                              id_user INT NOT NULL,
                              id_team INT NOT NULL,
                              FOREIGN KEY (id_user) REFERENCES users(id_user),
                              FOREIGN KEY (id_team) REFERENCES team(id_team)
);
