package com.runtimerebels.store.search;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Objects;

import static java.util.Locale.ROOT;

/**
 * Creates semantic embeddings for search.
 *
 * Uses an OpenAI-compatible embeddings endpoint:
 * POST {baseUrl}/v1/embeddings
 *
 * Configure via env vars/properties:
 * - embeddings.apiKey (EMBEDDINGS_API_KEY)
 * - embeddings.baseUrl (EMBEDDINGS_API_BASE_URL) default https://api.openai.com
 * - embeddings.model (EMBEDDINGS_MODEL) default text-embedding-3-small
 */
@Component
public class EmbeddingService {

    private final WebClient webClient;
    private final String model;
    private final boolean enabled;
    private final String provider;
    private final String apiKey;

    public EmbeddingService(
            WebClient.Builder webClientBuilder,
            @Value("${embeddings.apiKey:}") String apiKey,
            @Value("${embeddings.baseUrl:https://api.openai.com}") String baseUrl,
            @Value("${embeddings.model:text-embedding-3-small}") String model,
            @Value("${embeddings.provider:openai}") String provider
    ) {
        this.apiKey = apiKey;
        this.enabled = apiKey != null && !apiKey.isBlank();
        this.model = model;
        this.provider = (provider == null || provider.isBlank()) ? "openai" : provider.trim().toLowerCase(ROOT);

        WebClient.Builder b = webClientBuilder
                .baseUrl(Objects.requireNonNullElse(baseUrl, "https://api.openai.com"))
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        // OpenAI-style APIs use Authorization header.
        // Gemini (generativelanguage.googleapis.com) typically uses ?key=... query parameter.
        if (this.enabled && "openai".equals(this.provider)) {
            b = b.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
        }

        this.webClient = b.build();
    }

    public boolean isEnabled() {
        return enabled;
    }

    public List<Double> embed(String input) {
        if (!enabled) {
            throw new IllegalStateException("Embeddings are disabled (missing embeddings.apiKey)");
        }
        String safeInput = Objects.requireNonNullElse(input, "").trim();
        if (safeInput.isBlank()) {
            throw new IllegalArgumentException("Cannot embed blank input");
        }

        return switch (provider) {
            case "gemini" -> embedGemini(safeInput);
            case "openai" -> embedOpenAiCompatible(safeInput);
            default -> throw new IllegalStateException("Unsupported embeddings.provider: " + provider);
        };
    }

    private List<Double> embedOpenAiCompatible(String input) {
        EmbeddingsRequest req = new EmbeddingsRequest(model, input);

        EmbeddingsResponse res = webClient
                .post()
                .uri("/v1/embeddings")
                .bodyValue(req)
                .retrieve()
                .bodyToMono(EmbeddingsResponse.class)
                .timeout(Duration.ofSeconds(20))
                .block();

        if (res == null || res.data() == null || res.data().isEmpty() || res.data().get(0) == null) {
            throw new IllegalStateException("Embeddings API returned no embedding data");
        }
        if (res.data().get(0).embedding() == null || res.data().get(0).embedding().isEmpty()) {
            throw new IllegalStateException("Embeddings API returned an empty embedding vector");
        }

        return res.data().get(0).embedding();
    }

    private List<Double> embedGemini(String input) {
        // Gemini Embeddings API (Generative Language API) format:
        // POST https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=API_KEY
        // body: {"content": {"parts": [{"text": "..."}]}}
        // response: {"embedding": {"values": [..]}}

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Gemini embeddings require embeddings.apiKey (Google API key)");
        }

        String rawModelName = Objects.requireNonNullElse(model, "text-embedding-004").trim();
        // Accept either "text-embedding-004" or "models/text-embedding-004"
        final String modelName = rawModelName.startsWith("models/") ? rawModelName : ("models/" + rawModelName);

        GeminiEmbedContentRequest req = new GeminiEmbedContentRequest(
                new GeminiContent(List.of(new GeminiPart(input)))
        );

        GeminiEmbedContentResponse res = webClient
                .post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1beta/" + modelName + ":embedContent")
                        .queryParam("key", apiKey)
                        .build())
                .bodyValue(req)
                .retrieve()
                .bodyToMono(GeminiEmbedContentResponse.class)
                .timeout(Duration.ofSeconds(20))
                .block();

        if (res == null || res.embedding() == null || res.embedding().values() == null || res.embedding().values().isEmpty()) {
            throw new IllegalStateException("Gemini embeddings API returned an empty embedding vector");
        }

        return res.embedding().values();
    }

    /** OpenAI-compatible embeddings request/response. */
    public record EmbeddingsRequest(String model, String input) {}

    public record EmbeddingsResponse(List<EmbeddingsData> data) {}

    public record EmbeddingsData(List<Double> embedding) {}

    /** Gemini embedContent request/response. */
    public record GeminiEmbedContentRequest(GeminiContent content) {}

    public record GeminiEmbedContentResponse(GeminiEmbedding embedding) {}

    public record GeminiEmbedding(List<Double> values) {}

    public record GeminiContent(List<GeminiPart> parts) {}

    public record GeminiPart(String text) {}
}
