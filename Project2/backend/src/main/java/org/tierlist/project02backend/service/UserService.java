package org.tierlist.project02backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.tierlist.project02backend.model.User;
import org.tierlist.project02backend.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Autowired
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Update user
    public User updateUser(String username, String newUsername, String newPassword, Boolean isAdmin) {
        Optional<User> userOptional = userRepository.findByEmail(username);  // 🔹 Use findByEmail()

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (newUsername != null) user.setName(newUsername);  // 🔹 Use setName()
            if (newPassword != null) user.setPassword(passwordEncoder.encode(newPassword));
            if (isAdmin != null) user.setAdmin(isAdmin);
            return userRepository.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    // Delete user
    public void deleteUser(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent()) {
            userRepository.delete(user.get());
        } else {
            throw new RuntimeException("User not found");
        }
    }

}
