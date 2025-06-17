package com.felanmalan.backend.model;

public class ReportDTO {
    private Long id;
    private String description;
    private double lat;
    private double lng;

    public ReportDTO(Report report) {
        this.id = report.getId();
        this.description = report.getDescription();
        this.lat = report.getLocation().getY(); // lat = Y
        this.lng = report.getLocation().getX(); // lng = X
    }

    public Long getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public double getLat() {
        return lat;
    }

    public double getLng() {
        return lng;
    }
}
