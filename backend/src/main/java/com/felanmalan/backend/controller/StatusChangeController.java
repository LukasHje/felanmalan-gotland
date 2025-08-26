package com.felanmalan.backend.controller;

import com.felanmalan.backend.model.StatusChange;
import com.felanmalan.backend.repository.StatusChangeRepository;
import com.felanmalan.backend.repository.ReportRepository;
import com.felanmalan.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/status-changes")
public class StatusChangeController {

    @Autowired
    private StatusChangeRepository statusChangeRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    // GET: List all statuschanges
    @GetMapping
    public List<StatusChange> getAll() {
        return statusChangeRepository.findAll();
    }

    // GET: Get a specific statuschange
    @GetMapping("/{id}")
    public Optional<StatusChange> getById(@PathVariable Long id) {
        return statusChangeRepository.findById(id);
    }

    // POST: Create a new statuschange
    @PostMapping
    public StatusChange create(
            @RequestParam Long reportId,
            @RequestParam Long userId,
            @RequestParam String status) {

        StatusChange change = new StatusChange();
        change.setStatus(status);
        change.setTimestamp(LocalDateTime.now());

        reportRepository.findById(reportId).ifPresent(change::setReport);
        userRepository.findById(userId).ifPresent(change::setUser);

        return statusChangeRepository.save(change);
    }

    // PUT: Update a statuschange
    @PutMapping("/{id}")
    public StatusChange update(@PathVariable Long id, @RequestBody StatusChange updatedChange) {
        return statusChangeRepository.findById(id)
                .map(existing -> {
                    existing.setStatus(updatedChange.getStatus());
                    existing.setTimestamp(updatedChange.getTimestamp());
                    existing.setReport(updatedChange.getReport());
                    existing.setUser(updatedChange.getUser());
                    return statusChangeRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("StatusChange not found with id " + id));
    }

    // DELETE: Delete a statuschange
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        statusChangeRepository.deleteById(id);
    }
}
