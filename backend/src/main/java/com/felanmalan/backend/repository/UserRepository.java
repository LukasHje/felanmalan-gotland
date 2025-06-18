// UserRepository.java
package com.felanmalan.backend.repository;

import com.felanmalan.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> { }
