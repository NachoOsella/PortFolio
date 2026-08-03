package com.ignacio.portfolio.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.ignacio.portfolio.config.AppProperties;

class ConfiguredUsersTest {

    @Test
    void loadsUsersFromTheEnvironmentStyleFormat() {
        String hash = new BCryptPasswordEncoder().encode("secret-password");
        AppProperties properties = new AppProperties();
        properties.getAuth().setUsers("Owner@Example.com|" + hash + "|Portfolio owner");

        ConfiguredUsers users = new ConfiguredUsers(properties);

        assertEquals("Portfolio owner", users.find("owner@example.com").name());
        assertEquals(1, users.size());
    }

    @Test
    void rejectsPlaintextPasswords() {
        AppProperties properties = new AppProperties();
        properties.getAuth().setUsers("owner@example.com|plain-text|Owner");

        assertThrows(IllegalStateException.class, () -> new ConfiguredUsers(properties));
    }
}
