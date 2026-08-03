package com.ignacio.portfolio.auth;

import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

import com.ignacio.portfolio.config.AppProperties;

@Component
public class ConfiguredUsers {

    private static final Pattern BCRYPT_HASH = Pattern.compile("^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$");

    private final Map<String, AuthUser> users;

    public ConfiguredUsers(AppProperties properties) {
        this.users = parse(properties.getAuth().getUsers());
    }

    public AuthUser find(String email) {
        if (email == null) {
            return null;
        }
        return users.get(email.trim().toLowerCase(Locale.ROOT));
    }

    public int size() {
        return users.size();
    }

    private static Map<String, AuthUser> parse(String rawUsers) {
        if (rawUsers == null || rawUsers.isBlank()) {
            throw new IllegalStateException(
                    "APP_AUTH_USERS must contain at least one user: email|bcryptHash|name");
        }

        Map<String, AuthUser> parsed = Arrays.stream(rawUsers.split(","))
                .map(String::trim)
                .filter(entry -> !entry.isBlank())
                .map(ConfiguredUsers::parseEntry)
                .collect(Collectors.toUnmodifiableMap(
                        user -> user.email().toLowerCase(Locale.ROOT),
                        Function.identity(),
                        (first, second) -> {
                            throw new IllegalStateException("Duplicate configured user: " + first.email());
                        }));

        if (parsed.isEmpty()) {
            throw new IllegalStateException(
                    "APP_AUTH_USERS must contain at least one user: email|bcryptHash|name");
        }
        return parsed;
    }

    private static AuthUser parseEntry(String entry) {
        String[] fields = entry.split("\\|", -1);
        if (fields.length != 3 || fields[0].isBlank() || fields[1].isBlank() || fields[2].isBlank()) {
            throw new IllegalStateException(
                    "Invalid APP_AUTH_USERS entry. Expected email|bcryptHash|displayName");
        }
        if (!BCRYPT_HASH.matcher(fields[1].trim()).matches()) {
            throw new IllegalStateException("Password for " + fields[0] + " must be a bcrypt hash");
        }
        if (fields[0].chars().filter(character -> character == '@').count() != 1) {
            throw new IllegalStateException("Invalid email in APP_AUTH_USERS: " + fields[0]);
        }
        return new AuthUser(fields[0].trim(), fields[2].trim(), fields[1].trim());
    }
}
