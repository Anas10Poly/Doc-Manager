-- Renommer la table role en roles
ALTER TABLE role RENAME TO roles;

-- Mettre à jour les foreign keys qui pointaient vers role
-- Dans rolepermission
ALTER TABLE rolepermission
    DROP CONSTRAINT rolepermission_id_role_fkey;

ALTER TABLE rolepermission
    ADD CONSTRAINT rolepermission_id_role_fkey FOREIGN KEY (id_role) REFERENCES roles(id_role);

-- Dans permission
ALTER TABLE permission
    DROP CONSTRAINT permission_id_role_fkey;

ALTER TABLE permission
    ADD CONSTRAINT permission_id_role_fkey FOREIGN KEY (id_role) REFERENCES roles(id_role);