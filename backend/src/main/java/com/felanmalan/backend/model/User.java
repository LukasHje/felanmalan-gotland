package com.felanmalan.backend.model;

import javax.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_email", columnNames = "email")
    }
)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    // email – krävs av DB och ska vara unik
    @Column(name = "email", nullable = false, unique = true, length = 320)
    private String email;

    // Lägg till fler fält här vid behov (t.ex. createdAt, updatedAt)
}