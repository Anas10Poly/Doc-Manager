package com.norsys.backend.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// Pour insérer manuellement l'user admin et hasher son mot de passe
public class PasswordHasher {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // Mot de passe à hasher
        String rawPassword = "admin1234";

        // Génère le hash
        String hashedPassword = encoder.encode(rawPassword);

        // Affiche le hash dans la console
        System.out.println("Mot de passe original : " + rawPassword);
        System.out.println("Mot de passe hashé   : " + hashedPassword);
    }
}
