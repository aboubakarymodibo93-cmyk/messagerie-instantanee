package com.projet.backend.controller;

import com.projet.backend.model.User;
import com.projet.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private static final Pattern USERNAME = Pattern.compile("^[A-Za-z0-9_.-]{3,30}$");

    private final UserRepository users;

    @PostMapping("/auth/login")
    public User login(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "").trim();
        if (!USERNAME.matcher(username).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nom invalide (3 à 30 caractères : lettres, chiffres, _ . -)");
        }
        return users.findByUsername(username).orElseGet(() -> users.save(new User(username)));
    }

    @GetMapping("/users")
    public Iterable<User> users() {
        return users.findAll();
    }
}
