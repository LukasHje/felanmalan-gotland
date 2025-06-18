// ReportRepository.java
package com.felanmalan.backend.repository;

import com.felanmalan.backend.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> { }
