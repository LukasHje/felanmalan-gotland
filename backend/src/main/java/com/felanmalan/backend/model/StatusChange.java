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

    // Getters and setters
}
