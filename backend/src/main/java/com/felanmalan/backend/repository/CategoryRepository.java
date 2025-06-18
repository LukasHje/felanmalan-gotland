// CategoryRepository.java
package com.felanmalan.backend.repository;

import com.felanmalan.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> { }
