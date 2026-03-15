INSERT INTO users (nom, prenom, email, password, is_admin)
VALUES ('Admin', 'App', 'admin@docmanager.com', '$2a$10$G9JDfhfCWo6mL6f3QCIneOk/DfRT/Gydzx/qCcSKwU8lqeRyOfJvG', TRUE)
ON CONFLICT (email) DO NOTHING;