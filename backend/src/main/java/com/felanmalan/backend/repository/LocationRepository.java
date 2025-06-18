// LocationRepository.java
package com.felanmalan.backend.repository;

import com.felanmalan.backend.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> { }
