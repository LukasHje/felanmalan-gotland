package com.felanmalan.backend.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "status_changes")
public class StatusChange {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String status;

    private LocalDateTime timestamp = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "report_id")
    private Report report;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // --- Getters ---
    public Long getId() {
        return id;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Report getReport() {
        return report;
    }

    public User getUser() {
        return user;
    }

    // --- Setters ---
    public void setId(Long id) {
        this.id = id;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setReport(Report report) {
        this.report = report;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
