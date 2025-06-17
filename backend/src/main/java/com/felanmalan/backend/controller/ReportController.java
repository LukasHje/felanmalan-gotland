package com.felanmalan.backend.controller;

import com.felanmalan.backend.model.Report;
import com.felanmalan.backend.repository.ReportRepository;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    private final GeometryFactory geometryFactory = new GeometryFactory();

    @PostMapping
    public Report create(@RequestParam double lat, @RequestParam double lng, @RequestParam String description) {
        Point location = geometryFactory.createPoint(new org.locationtech.jts.geom.Coordinate(lng, lat));
        location.setSRID(4326);

        Report report = new Report();
        report.setDescription(description);
        report.setLocation(location);

        return reportRepository.save(report);
    }

    @GetMapping
    public List<Report> getAll() {
        return reportRepository.findAll();
    }
}
