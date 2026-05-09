package com.smartparking.controller;

import com.smartparking.model.User;
import com.smartparking.model.enums.UserRole;
import com.smartparking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> request) {
        String email = request.get("email").toString();
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }
        User user = new User(
                request.get("name").toString(),
                email,
                request.getOrDefault("phone", "").toString(),
                request.get("password").toString(),
                UserRole.USER
        );
        userRepository.save(user);
        return ResponseEntity.ok(toDto(user));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> request) {
        String email = request.get("email").toString();
        String password = request.get("password").toString();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
        User user = userOpt.get();
        Map<String, Object> dto = toDto(user);
        dto.put("token", "mock-jwt-" + user.getId()); // Mock JWT
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(toDto(user));
    }

    private Map<String, Object> toDto(User u) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", u.getId());
        dto.put("name", u.getName());
        dto.put("email", u.getEmail());
        dto.put("phone", u.getPhone());
        dto.put("role", u.getRole().name());
        return dto;
    }
}
