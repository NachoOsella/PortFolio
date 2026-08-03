package com.ignacio.portfolio.content;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/content")
public class ContentController {

    private final ContentService contentService;

    public ContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping("/files")
    public List<ContentService.ContentFileSummary> listFiles(
            @RequestParam(required = false) String collection,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean featured,
            Authentication authentication) {
        ContentCollection parsedCollection = collection == null || collection.isBlank()
                ? null
                : ContentCollection.fromValue(collection);
        PublicationStatus parsedStatus = status == null || status.isBlank() || "all".equalsIgnoreCase(status)
                ? null
                : PublicationStatus.fromValue(status);
        return contentService.listFiles(
                parsedCollection,
                search,
                parsedStatus,
                featured,
                isAuthenticated(authentication));
    }

    @GetMapping("/file")
    public ContentService.MarkdownDocument getFile(
            @RequestParam String path,
            Authentication authentication) {
        return contentService.getFile(path, isAuthenticated(authentication));
    }

    @PostMapping("/files")
    public ContentService.MarkdownDocument create(
            @Valid @RequestBody WriteContentRequest request) {
        return contentService.create(
                ContentCollection.fromValue(request.collection()),
                request.filename(),
                request.raw(),
                request.commitMessage());
    }

    @PutMapping("/file")
    public ContentService.MarkdownDocument update(@Valid @RequestBody UpdateContentRequest request) {
        return contentService.update(request.path(), request.raw(), request.commitMessage());
    }

    @PostMapping("/rename")
    public ContentService.MarkdownDocument rename(@Valid @RequestBody RenameRequest request) {
        return contentService.rename(request.path(), request.newPath(), request.commitMessage());
    }

    @DeleteMapping("/file")
    public ResponseEntity<Void> delete(
            @RequestParam String path,
            @RequestParam(required = false) String commitMessage) {
        contentService.delete(path, commitMessage);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    public ContentService.MarkdownDocument importFile(
            @Valid @RequestBody ImportRequest request) {
        return contentService.importFile(
                ContentCollection.fromValue(request.collection()),
                request.filename(),
                request.raw(),
                request.overwrite(),
                request.commitMessage());
    }

    private boolean isAuthenticated(Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
    }

    public record WriteContentRequest(
            @NotBlank String collection,
            @NotBlank String filename,
            @NotBlank String raw,
            String commitMessage) {
    }

    public record UpdateContentRequest(
            @NotBlank String path,
            @NotBlank String raw,
            String commitMessage) {
    }

    public record RenameRequest(
            @NotBlank String path,
            @NotBlank String newPath,
            String commitMessage) {
    }

    public record ImportRequest(
            @NotBlank String collection,
            @NotBlank String filename,
            @NotBlank String raw,
            boolean overwrite,
            String commitMessage) {
    }
}
