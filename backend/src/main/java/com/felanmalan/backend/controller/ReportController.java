package com.felanmalan.backend.controller;

import com.felanmalan.backend.model.ReportDTO;
import com.felanmalan.backend.model.*;
import com.felanmalan.backend.repository.*;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired private ReportRepository reportRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private StatusChangeRepository statusChangeRepository;

    private final GeometryFactory geometryFactory = new GeometryFactory();

    //GET /api/reports
    @GetMapping
    public ResponseEntity<List<ReportDTO>> getAllReports() {
        List<ReportDTO> result = reportRepository.findAll().stream().map(report -> {
            Point point = report.getLocation().getGeom();
            return new ReportDTO(
                    report.getId(),
                    report.getDescription(),
                    point.getY(), // lat
                    point.getX(), // lng
                    report.getCategory() != null ? report.getCategory().getName() : null,
                    report.getUser() != null ? report.getUser().getName() : null
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // GET /api/reports/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ReportDTO> getReportById(@PathVariable Long id) {
        return reportRepository.findById(id)
                .map(report -> {
                    Point point = report.getLocation().getGeom();
                    ReportDTO dto = new ReportDTO(
                            report.getId(),
                            report.getDescription(),
                            point.getY(),
                            point.getX(),
                            report.getCategory() != null ? report.getCategory().getName() : null,
                            report.getUser() != null ? report.getUser().getName() : null
                    );
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/reports
    @PostMapping
    public ResponseEntity<ReportDTO> createReport(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam String description,
            @RequestParam Long userId,
            @RequestParam Long categoryId
    ) {
        try {
            // Create dot & place
            Point point = geometryFactory.createPoint(new Coordinate(lng, lat));
            point.setSRID(4326);
            Location location = new Location();
            location.setGeom(point);
            locationRepository.save(location);

            // Get user and category
            User user = userRepository.findById(userId).orElseThrow();
            Category category = categoryRepository.findById(categoryId).orElseThrow();

            // Save report
            Report report = new Report();
            report.setDescription(description);
            report.setUser(user);
            report.setCategory(category);
            report.setLocation(location);
            reportRepository.save(report);

            ReportDTO dto = new ReportDTO(
                    report.getId(),
                    description,
                    lat,
                    lng,
                    category.getName(),
                    user.getName()
            );

            return ResponseEntity.status(201).body(dto);
        } catch (NoSuchElementException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // PUT /api/reports/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Report> updateReport(@PathVariable Long id, @RequestBody Report updatedReport) {
        Optional<Report> optionalReport = reportRepository.findById(id);
        if (optionalReport.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Report report = optionalReport.get();

        // Only update approved fields
        report.setDescription(updatedReport.getDescription());
        report.setCategory(updatedReport.getCategory());
        report.setUser(updatedReport.getUser());

        Report saved = reportRepository.save(report);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id) {
        if (reportRepository.existsById(id)) {
            reportRepository.deleteById(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }
}
