// StatusChangeRepository.java
package com.felanmalan.backend.repository;

import com.felanmalan.backend.model.StatusChange;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusChangeRepository extends JpaRepository<StatusChange, Long> { }
