// UserRepository.java
package com.felanmalan.backend.repository;

import java.util.Optional;
import com.felanmalan.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByName(String name);
}
