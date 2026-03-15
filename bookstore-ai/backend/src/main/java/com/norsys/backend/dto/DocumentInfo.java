package com.norsys.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentInfo {
    @JsonProperty("title")
    private String title;

    @JsonProperty("date")
    private String date;
}