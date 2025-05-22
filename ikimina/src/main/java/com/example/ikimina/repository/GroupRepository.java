package com.example.ikimina.repository;

import com.example.ikimina.entity.Group;
import com.example.ikimina.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    
    // Find groups created by a specific user
    List<Group> findByCreatedByUser(User user);
    
    // Find groups by name containing the search term (for search functionality)
    List<Group> findByGroupNameContainingIgnoreCase(String searchTerm);
}