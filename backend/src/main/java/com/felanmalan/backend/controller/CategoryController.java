package com.felanmalan.backend.controller;

import com.felanmalan.backend.model.Category;
import com.felanmalan.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    // GET /api/categories – hämta alla kategorier
    @GetMapping
    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    // GET /api/categories/{id} – hämta en kategori via ID
    @GetMapping("/{id}")
    public Optional<Category> getById(@PathVariable Long id) {
        return categoryRepository.findById(id);
    }

    // POST /api/categories – skapa ny kategori
    @PostMapping
    public Category create(@RequestBody Category category) {
        return categoryRepository.save(category);
    }

    // PUT /api/categories/{id} – uppdatera kategori
    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @RequestBody Category updatedCategory) {
        return categoryRepository.findById(id)
                .map(category -> {
                    category.setName(updatedCategory.getName());
                    return categoryRepository.save(category);
                })
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
    }

    // DELETE /api/categories/{id} – radera kategori
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        categoryRepository.deleteById(id);
    }
}
