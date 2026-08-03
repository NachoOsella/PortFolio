package com.ignacio.portfolio.content;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.attribute.BasicFileAttributes;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ignacio.portfolio.config.ContentProperties;
import com.ignacio.portfolio.error.ConflictException;
import com.ignacio.portfolio.error.NotFoundException;

@Service
public class ContentService {

    private static final Pattern UPDATED_AT = Pattern.compile("(?m)^updatedAt\\s*:\\s*[^\\r\\n]*$");

    private final Path contentRoot;
    private final Path syncState;
    private final MarkdownParser markdownParser;
    private final ReentrantLock mutationLock = new ReentrantLock();
    private final Map<String, ChangeType> dirtyFiles = new ConcurrentHashMap<>();
    private final Map<String, String> syncedHashes = new ConcurrentHashMap<>();

    public ContentService(ContentProperties properties, MarkdownParser markdownParser) {
        this.contentRoot = Path.of(properties.getRoot()).toAbsolutePath().normalize();
        this.syncState = contentRoot.resolve(".content-sync-state");
        this.markdownParser = markdownParser;
        try {
            Files.createDirectories(contentRoot);
            for (ContentCollection collection : ContentCollection.values()) {
                Files.createDirectories(contentRoot.resolve(collection.value()));
            }
            loadSyncState();
        } catch (IOException exception) {
            throw new IllegalStateException("Could not initialize local content directory", exception);
        }
    }

    public List<ContentFileSummary> listFiles(
            ContentCollection collection,
            String search,
            PublicationStatus status,
            Boolean featured,
            boolean authenticated) {
        reconcileChanges();
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase();
        return localPaths().stream()
                .filter(path -> collection == null || path.collection() == collection)
                .map(this::read)
                .filter(document -> authenticated || isPubliclyVisible(document.frontmatter(), Instant.now()))
                .filter(document -> status == null || status == statusOf(document.frontmatter()))
                .filter(document -> featured == null || featured.equals(document.frontmatter().get("featured")))
                .filter(document -> normalizedSearch.isBlank()
                        || (document.frontmatter().get("title") + " "
                                + document.frontmatter().get("slug") + " "
                                + document.filename()).toLowerCase().contains(normalizedSearch))
                .map(this::summary)
                .toList();
    }

    public MarkdownDocument getFile(String rawPath, boolean authenticated) {
        ContentPath path = ContentPath.parse(rawPath);
        MarkdownDocument document = read(path);
        if (!authenticated && !isPubliclyVisible(document.frontmatter(), Instant.now())) {
            throw new NotFoundException("Markdown file not found");
        }
        return document;
    }

    public MarkdownDocument create(
            ContentCollection collection,
            String filename,
            String raw,
            String ignoredCommitMessage) {
        ContentPath path = ContentPath.fromCollectionAndFilename(collection, filename);
        mutationLock.lock();
        try {
            Path file = localFile(path);
            if (Files.exists(file)) {
                throw new ConflictException("A file with this path already exists");
            }
            String stampedRaw = stampUpdatedAt(raw);
            MarkdownParser.ParsedMarkdown parsed = markdownParser.parse(stampedRaw, path);
            write(file, stampedRaw);
            dirtyFiles.put(path.value(), ChangeType.ADDED);
            return read(path);
        } finally {
            mutationLock.unlock();
        }
    }

    public MarkdownDocument update(String rawPath, String raw, String ignoredCommitMessage) {
        ContentPath path = ContentPath.parse(rawPath);
        mutationLock.lock();
        try {
            Path file = localFile(path);
            if (!Files.exists(file)) {
                throw new NotFoundException("Markdown file not found");
            }
            String stampedRaw = stampUpdatedAt(raw);
            markdownParser.parse(stampedRaw, path);
            write(file, stampedRaw);
            dirtyFiles.putIfAbsent(path.value(), ChangeType.MODIFIED);
            return read(path);
        } finally {
            mutationLock.unlock();
        }
    }

    public MarkdownDocument rename(String rawPath, String rawNewPath, String ignoredCommitMessage) {
        ContentPath path = ContentPath.parse(rawPath);
        ContentPath newPath = ContentPath.parse(rawNewPath);
        if (path.collection() != newPath.collection()) {
            throw new IllegalArgumentException("A file can only be renamed within its collection");
        }
        mutationLock.lock();
        try {
            Path file = localFile(path);
            Path destination = localFile(newPath);
            if (!Files.exists(file)) {
                throw new NotFoundException("Markdown file not found");
            }
            if (Files.exists(destination)) {
                throw new ConflictException("A file with the destination path already exists");
            }
            ChangeType previousChange = dirtyFiles.remove(path.value());
            Files.createDirectories(destination.getParent());
            Files.move(file, destination, StandardCopyOption.ATOMIC_MOVE);
            if (previousChange != ChangeType.ADDED) {
                dirtyFiles.put(path.value(), ChangeType.DELETED);
            }
            dirtyFiles.put(newPath.value(), ChangeType.ADDED);
            return read(newPath);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not rename local Markdown file", exception);
        } finally {
            mutationLock.unlock();
        }
    }

    public void delete(String rawPath, String ignoredCommitMessage) {
        ContentPath path = ContentPath.parse(rawPath);
        mutationLock.lock();
        try {
            Path file = localFile(path);
            if (!Files.exists(file)) {
                throw new NotFoundException("Markdown file not found");
            }
            ChangeType previousChange = dirtyFiles.remove(path.value());
            Files.delete(file);
            if (previousChange != ChangeType.ADDED) {
                dirtyFiles.put(path.value(), ChangeType.DELETED);
            }
        } catch (IOException exception) {
            throw new IllegalStateException("Could not delete local Markdown file", exception);
        } finally {
            mutationLock.unlock();
        }
    }

    public MarkdownDocument importFile(
            ContentCollection collection,
            String filename,
            String raw,
            boolean overwrite,
            String ignoredCommitMessage) {
        ContentPath path = ContentPath.fromCollectionAndFilename(collection, filename);
        mutationLock.lock();
        try {
            Path file = localFile(path);
            boolean existed = Files.exists(file);
            if (existed && !overwrite) {
                throw new ConflictException("A file with this path already exists");
            }
            String stampedRaw = stampUpdatedAt(raw);
            markdownParser.parse(stampedRaw, path);
            write(file, stampedRaw);
            dirtyFiles.put(path.value(), existed ? ChangeType.MODIFIED : ChangeType.ADDED);
            return read(path);
        } finally {
            mutationLock.unlock();
        }
    }

    public List<LocalChange> localChanges() {
        reconcileChanges();
        return dirtyFiles.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new LocalChange(entry.getKey(), entry.getValue().value()))
                .toList();
    }

    public String readRawForSync(String rawPath) {
        return readRaw(ContentPath.parse(rawPath));
    }

    public void markSynced(Collection<String> paths) {
        paths.forEach(path -> {
            dirtyFiles.remove(path);
            Path file = localFile(ContentPath.parse(path));
            if (Files.exists(file)) {
                syncedHashes.put(path, hash(file));
            } else {
                syncedHashes.remove(path);
            }
        });
        persistSyncState();
    }

    private List<ContentPath> localPaths() {
        try (var files = Files.walk(contentRoot)) {
            return files
                    .filter(Files::isRegularFile)
                    .filter(path -> path.toString().endsWith(".md"))
                    .map(contentRoot::relativize)
                    .map(path -> ContentPath.parse("content/" + path.toString().replace('\\', '/')))
                    .sorted(Comparator.comparing(ContentPath::value))
                    .toList();
        } catch (IOException exception) {
            throw new IllegalStateException("Could not list local Markdown files", exception);
        }
    }

    private void loadSyncState() throws IOException {
        if (Files.exists(syncState)) {
            for (String line : Files.readAllLines(syncState, StandardCharsets.UTF_8)) {
                String[] fields = line.split("\\t", 2);
                if (fields.length == 2 && !fields[0].isBlank() && !fields[1].isBlank()) {
                    syncedHashes.put(fields[0], fields[1]);
                }
            }
            return;
        }
        // The first startup adopts the checked-in content as the local baseline.
        for (ContentPath path : localPaths()) {
            syncedHashes.put(path.value(), hash(localFile(path)));
        }
        persistSyncState();
    }

    private void reconcileChanges() {
        Map<String, String> currentHashes = new LinkedHashMap<>();
        for (ContentPath path : localPaths()) {
            currentHashes.put(path.value(), hash(localFile(path)));
            String baseline = syncedHashes.get(path.value());
            if (baseline == null) {
                dirtyFiles.putIfAbsent(path.value(), ChangeType.ADDED);
            } else if (!baseline.equals(currentHashes.get(path.value()))) {
                dirtyFiles.putIfAbsent(path.value(), ChangeType.MODIFIED);
            }
        }
        for (String path : syncedHashes.keySet()) {
            if (!currentHashes.containsKey(path)) {
                dirtyFiles.putIfAbsent(path, ChangeType.DELETED);
            }
        }
    }

    private String hash(Path file) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(Files.readAllBytes(file));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException | IOException exception) {
            throw new IllegalStateException("Could not hash local Markdown file", exception);
        }
    }

    private void persistSyncState() {
        try {
            List<String> lines = syncedHashes.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(entry -> entry.getKey() + "\\t" + entry.getValue())
                    .toList();
            Files.write(
                    syncState,
                    lines,
                    StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING,
                    StandardOpenOption.WRITE);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not persist local content sync state", exception);
        }
    }

    private MarkdownDocument read(ContentPath path) {
        Path file = localFile(path);
        try {
            String raw = Files.readString(file, StandardCharsets.UTF_8);
            MarkdownParser.ParsedMarkdown parsed = markdownParser.parse(raw, path);
            BasicFileAttributes attributes = Files.readAttributes(file, BasicFileAttributes.class);
            return document(
                    path,
                    parsed,
                    raw,
                    attributes.creationTime().toInstant(),
                    attributes.lastModifiedTime().toInstant());
        } catch (java.nio.file.NoSuchFileException exception) {
            throw new NotFoundException("Markdown file not found");
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read local Markdown file", exception);
        }
    }

    private String readRaw(ContentPath path) {
        try {
            return Files.readString(localFile(path), StandardCharsets.UTF_8);
        } catch (java.nio.file.NoSuchFileException exception) {
            throw new NotFoundException("Markdown file not found");
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read local Markdown file", exception);
        }
    }

    private void write(Path file, String raw) {
        try {
            Files.createDirectories(file.getParent());
            Files.writeString(
                    file,
                    raw,
                    StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING,
                    StandardOpenOption.WRITE);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not write local Markdown file", exception);
        }
    }

    private Path localFile(ContentPath path) {
        Path file = contentRoot.resolve(path.collection().value()).resolve(path.filename()).normalize();
        if (!file.startsWith(contentRoot)) {
            throw new IllegalArgumentException("Invalid content path");
        }
        return file;
    }

    private MarkdownDocument document(
            ContentPath path,
            MarkdownParser.ParsedMarkdown parsed,
            String raw,
            Instant createdAt,
            Instant updatedAt) {
        return new MarkdownDocument(
                path.value(),
                path.filename(),
                path.collection().value(),
                parsed.frontmatter(),
                parsed.body(),
                raw,
                1,
                raw.getBytes(StandardCharsets.UTF_8).length,
                createdAt.toString(),
                updatedAt.toString(),
                dirtyFiles.containsKey(path.value()) ? "modified" : "synced");
    }

    private ContentFileSummary summary(MarkdownDocument document) {
        Map<String, Object> frontmatter = document.frontmatter();
        List<String> technologies = stringList(frontmatter.get("technologies"));
        ChangeType change = dirtyFiles.get(document.path());
        return new ContentFileSummary(
                document.path(),
                document.filename(),
                document.collection(),
                String.valueOf(frontmatter.get("title")),
                String.valueOf(frontmatter.get("slug")),
                statusOf(frontmatter).value(),
                frontmatter.get("featured") instanceof Boolean value ? value : null,
                frontmatter.get("category") == null ? null : String.valueOf(frontmatter.get("category")),
                technologies.isEmpty() ? null : technologies,
                document.updatedAt(),
                document.size(),
                document.synchronizationStatus(),
                change == null ? null : change.value());
    }

    private PublicationStatus statusOf(Map<String, Object> frontmatter) {
        return PublicationStatus.fromValue(frontmatter.get("status"));
    }

    private boolean isPubliclyVisible(Map<String, Object> frontmatter, Instant now) {
        PublicationStatus status = statusOf(frontmatter);
        if (status == PublicationStatus.PUBLISHED) {
            return true;
        }
        if (status != PublicationStatus.SCHEDULED) {
            return false;
        }
        Object publishedAt = frontmatter.get("publishedAt");
        if (publishedAt == null) {
            return false;
        }
        return parseInstant(publishedAt).map(date -> !date.isAfter(now)).orElse(false);
    }

    private Optional<Instant> parseInstant(Object value) {
        String text = String.valueOf(value);
        try {
            if (text.length() == 10) {
                return Optional.of(LocalDate.parse(text).atStartOfDay(ZoneOffset.UTC).toInstant());
            }
            return Optional.of(Instant.parse(text));
        } catch (DateTimeParseException exception) {
            return Optional.empty();
        }
    }

    private String stampUpdatedAt(String raw) {
        int closingDelimiter = raw.indexOf("\n---", 4);
        if (closingDelimiter < 0) {
            return raw;
        }
        String frontmatter = raw.substring(0, closingDelimiter);
        String updatedFrontmatter = UPDATED_AT.matcher(frontmatter)
                .replaceFirst("updatedAt: " + LocalDate.now(ZoneOffset.UTC));
        return updatedFrontmatter + raw.substring(closingDelimiter);
    }

    private List<String> stringList(Object value) {
        if (!(value instanceof Collection<?> values)) {
            return List.of();
        }
        return values.stream().map(String::valueOf).collect(Collectors.toCollection(ArrayList::new));
    }

    public enum ChangeType {
        ADDED("added"),
        MODIFIED("modified"),
        DELETED("deleted");

        private final String value;

        ChangeType(String value) {
            this.value = value;
        }

        public String value() {
            return value;
        }
    }

    public record LocalChange(String path, String status) {
    }

    public record MarkdownDocument(
            String path,
            String filename,
            String collection,
            Map<String, Object> frontmatter,
            String body,
            String raw,
            int version,
            int size,
            String createdAt,
            String updatedAt,
            String synchronizationStatus) {
    }

    public record ContentFileSummary(
            String path,
            String filename,
            String collection,
            String title,
            String slug,
            String status,
            Boolean featured,
            String category,
            List<String> technologies,
            String updatedAt,
            int size,
            String synchronizationStatus,
            String gitStatus) {
    }
}
