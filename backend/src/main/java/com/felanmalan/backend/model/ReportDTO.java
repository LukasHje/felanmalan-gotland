package com.felanmalan.backend.model;

public class ReportDTO {
    private Long id;
    private String description;
    private double lat;
    private double lng;
    private String categoryName;
    private String userName;

    public ReportDTO() {}

    public ReportDTO(Long id, String description, double lat, double lng, String categoryName, String userName) {
        this.id = id;
        this.description = description;
        this.lat = lat;
        this.lng = lng;
        this.categoryName = categoryName;
        this.userName = userName;
    }

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}