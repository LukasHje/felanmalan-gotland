package com.felanmalan.backend.controller;

import com.felanmalan.backend.model.*;
import com.felanmalan.backend.repository.*;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private static final Logger log = LoggerFactory.getLogger(ReportController.class);

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;

    private final GeometryFactory geometryFactory = new GeometryFactory();

    public ReportController(ReportRepository reportRepository,
                            UserRepository userRepository,
                            CategoryRepository categoryRepository,
                            LocationRepository locationRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.locationRepository = locationRepository;
    }

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
                    report.getUser() != null ? report.getUser().getName() : null,
                    report.getUser() != null ? report.getUser().getEmail() : null
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // GET /api/reports/{id}
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ReportDTO> getReportById(@PathVariable Long id) {
        return reportRepository.findById(id).map(report -> {
            Point p = report.getLocation().getGeom();
            return ResponseEntity.ok(new ReportDTO(
                    report.getId(), report.getDescription(), p.getY(), p.getX(),
                    report.getCategory() != null ? report.getCategory().getName() : null,
                    report.getUser() != null ? report.getUser().getName() : null,
                    report.getUser() != null ? report.getUser().getEmail() : null
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // POST /api/reports  (JSON body)
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createReport(@RequestBody CreateReportRequest req) {
        try {
            // ---- 1) defensiva kontroller
            if (req == null) return bad("Body saknas");
            if (req.description == null || req.description.isBlank()) return bad("description saknas");
            if (req.lat == null || req.lng == null) return bad("lat/lng saknas");

            String userName = (req.userName == null || req.userName.isBlank()) ? "Anonym" : req.userName.trim();
            String email = (req.userEmail == null || req.userEmail.isBlank()) ? null : req.userEmail.trim();
            String categoryName = (req.categoryName == null || req.categoryName.isBlank()) ? "Okategoriserad" : req.categoryName.trim();

            // ---- 2) geometri
            Point point = geometryFactory.createPoint(new Coordinate(req.lng, req.lat));
            point.setSRID(4326);
            Location location = new Location();
            location.setGeom(point);
            locationRepository.save(location);

            // ---- 3) hämta eller skapa User med e-post (krävs av DB)
            User user = null;
            if (email != null) {
                user = userRepository.findByEmail(email).orElse(null);
            }
            if (user == null) {
                user = userRepository.findByName(userName).orElse(null);
            }
            if (user == null) {
                // Skapa ny användare – e-post krävs
                User u = new User();
                u.setName(userName);
                u.setEmail(email != null ? email : generatePlaceholderEmail(userName)); // garanterar ej-null & (sannolikt) unik
                user = userRepository.save(u);
            }

            // ---- 4) hämta eller skapa Category via namn
            Category category = categoryRepository.findByName(categoryName).orElseGet(() -> {
                Category c = new Category();
                c.setName(categoryName);
                return categoryRepository.save(c);
            });

            // ---- 5) spara Report
            Report report = new Report();
            report.setDescription(req.description);
            report.setUser(user);
            report.setCategory(category);
            report.setLocation(location);
            reportRepository.save(report);

            // ---- 6) svar
            ReportDTO dto = new ReportDTO(
                    report.getId(), report.getDescription(), req.lat, req.lng,
                    category.getName(), user.getName(), user.getEmail()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);

        } catch (Exception e) {
            log.error("Fel vid skapande av rapport", e);
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("message", e.getMessage());
            body.put("type", e.getClass().getName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }

    // PUT /api/reports/{id}
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateReport(@PathVariable Long id, @RequestBody Report updatedReport) {
        return reportRepository.findById(id).map(existing -> {
            existing.setDescription(updatedReport.getDescription());
            existing.setCategory(updatedReport.getCategory());
            existing.setUser(updatedReport.getUser());
            Report saved = reportRepository.save(existing);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
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

    private ResponseEntity<Map<String, String>> bad(String msg) {
        Map<String, String> m = new HashMap<>();
        m.put("message", msg);
        return ResponseEntity.badRequest().body(m);
    }

    private String generatePlaceholderEmail(String baseName) {
        String slug = (baseName == null ? "user" : baseName.toLowerCase().replaceAll("[^a-z0-9]+", "-"))
                .replaceAll("(^-|-$)", "");
        if (slug.isEmpty()) slug = "user";
        String token = UUID.randomUUID().toString().substring(0, 8);
        return slug + "+" + token + "@local";
    }
}
