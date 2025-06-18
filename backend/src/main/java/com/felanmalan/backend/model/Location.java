package com.felanmalan.backend.model;

import javax.persistence.*;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "locations")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point geom;

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Point getGeom() { return geom; }
    public void setGeom(Point geom) { this.geom = geom; }
}