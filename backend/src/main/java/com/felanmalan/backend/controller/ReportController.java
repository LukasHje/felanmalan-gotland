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

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private StatusChangeRepository statusChangeRepository;

    private final GeometryFactory geometryFactory = new GeometryFactory();

    @GetMapping
    public List<ReportDTO> getAllReports() {
        return reportRepository.findAll().stream().map(report -> {
            Point point = report.getLocation().getGeom();
            return new ReportDTO(
                    report.getId(),
                    report.getDescription(),
                    point.getY(),
                    point.getX(),
                    report.getCategory() != null ? report.getCategory().getName() : null,
                    report.getUser() != null ? report.getUser().getName() : null
            );
        }).collect(Collectors.toList());
    }

    @PostMapping
    public ReportDTO createReport(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam String description,
            @RequestParam Long userId,
            @RequestParam Long categoryId
    ) {
        // Skapa punkt
        Point point = geometryFactory.createPoint(new Coordinate(lng, lat));
        point.setSRID(4326);

        // Skapa location
        Location location = new Location();
        location.setGeom(point);
        locationRepository.save(location);

        // Hamta anvandare och kategori
        User user = userRepository.findById(userId).orElseThrow();
        Category category = categoryRepository.findById(categoryId).orElseThrow();

        // Skapa report
        Report report = new Report();
        report.setDescription(description);
        report.setUser(user);
        report.setCategory(category);
        report.setLocation(location);
        reportRepository.save(report);

        return new ReportDTO(report.getId(), description, lat, lng, category.getName(), user.getName());
    }

    @PutMapping("/{id}")
    public Report updateReport(@PathVariable Long id, @RequestBody Report updatedReport) {
        Report report = reportRepository.findById(id).orElseThrow();
        report.setDescription(updatedReport.getDescription());
        report.setCategory(updatedReport.getCategory());
        report.setUser(updatedReport.getUser());
        return reportRepository.save(report);
    }

    @DeleteMapping("/{id}")
    public void deleteReport(@PathVariable Long id) {
        reportRepository.deleteById(id);
    }
}
