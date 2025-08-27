package com.felanmalan.backend.controller;

import com.felanmalan.backend.model.ReportDTO;
import com.felanmalan.backend.model.CreateReportRequest;
import com.felanmalan.backend.model.Report;
import com.felanmalan.backend.model.User;
import com.felanmalan.backend.model.Category;
import com.felanmalan.backend.model.Location;
import com.felanmalan.backend.repository.ReportRepository;
import com.felanmalan.backend.repository.UserRepository;
import com.felanmalan.backend.repository.CategoryRepository;
import com.felanmalan.backend.repository.LocationRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired private ReportRepository reportRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private LocationRepository locationRepository;

    private final GeometryFactory geometryFactory = new GeometryFactory();

    // GET /api/reports
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
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
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
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

    // POST /api/reports  (JSON body med CreateReportRequest)
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ReportDTO> createReport(@RequestBody CreateReportRequest req) {
        // defensive defaults
        String userName = (req.userName == null || req.userName.isBlank()) ? "Anonym" : req.userName.trim();
        String categoryName = (req.categoryName == null || req.categoryName.isBlank()) ? "Okategoriserad" : req.categoryName.trim();

        // 1) Create/reuse geometry (WGS84)
        Point point = geometryFactory.createPoint(new Coordinate(req.lng, req.lat));
        point.setSRID(4326);
        Location location = new Location();
        location.setGeom(point);
        locationRepository.save(location);

        // 2) Get or create User/Category through name
        User user = userRepository.findByName(userName).orElseGet(() -> {
            User u = new User();
            u.setName(userName);
            return userRepository.save(u);
        });

        Category category = categoryRepository.findByName(categoryName).orElseGet(() -> {
            Category c = new Category();
            c.setName(categoryName);
            return categoryRepository.save(c);
        });

        // 3) Save Report
        Report report = new Report();
        report.setDescription(req.description);
        report.setUser(user);
        report.setCategory(category);
        report.setLocation(location);
        reportRepository.save(report);

        // 4) Build DTO for response
        ReportDTO dto = new ReportDTO(
                report.getId(),
                report.getDescription(),
                req.lat,
                req.lng,
                category.getName(),
                user.getName()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    // PUT /api/reports/{id} (keep simple – won't update geometry here)
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Report> updateReport(@PathVariable Long id, @RequestBody Report updatedReport) {
        return reportRepository.findById(id)
                .map(existing -> {
                    existing.setDescription(updatedReport.getDescription());
                    existing.setCategory(updatedReport.getCategory());
                    existing.setUser(updatedReport.getUser());
                    Report saved = reportRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        if (reportRepository.existsById(id)) {
            reportRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
