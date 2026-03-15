package com.norsys.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.HashMap;
import java.util.Map;

@Service
public class OllamaService {
    private final RestTemplate restTemplate;

    // Injection correcte via le constructeur
    public OllamaService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String generateDocumentDescription(String fileName, String fileType, String userPrompt) {
        // Construire le prompt contextuel
        String prompt = String.format(
                "Donne une description en français professionnelle dans un paragraphe, directement,sans phrase d'introduction, ni conclusion, ni commentaire, sans aucune introduction ni explication pour un document '%s' de type %s. %s",

                fileName,
                fileType.toUpperCase(),
                userPrompt != null ? "Consigne supplémentaire (réponds en français) : " + userPrompt : ""
        );


        // Préparer la requête pour Ollama
        Map<String, Object> request = new HashMap<>();
        request.put("model", "llama3:8b");
        request.put("prompt", prompt);
        request.put("stream", false);

        // Configurer les headers HTTP
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Envoyer la requête
        ResponseEntity<Map> response = restTemplate.exchange(
                "http://localhost:11434/api/generate",
                HttpMethod.POST,
                new HttpEntity<>(request, headers),
                Map.class
        );

        // Extraire la réponse
        return response.getBody().get("response").toString();
    }
}