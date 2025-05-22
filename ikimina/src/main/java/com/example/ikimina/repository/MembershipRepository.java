package com.example.ikimina.repository;

import com.example.ikimina.entity.Group;
import com.example.ikimina.entity.Membership;
import com.example.ikimina.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    
    // Find membership by user and group
    Optional<Membership> findByUserAndGroup(User user, Group group);
    
    // Find all memberships for a specific user
    List<Membership> findByUser(User user);
    
    // Find all memberships for a specific group
    List<Membership> findByGroup(Group group);
    
    // Find confirmed memberships for a specific group
    List<Membership> findByGroupAndIsConfirmedTrue(Group group);
    
    // Find pending memberships for a specific group
    List<Membership> findByGroupAndIsConfirmedFalse(Group group);
    
    // Check if a user is a member of a group
    boolean existsByUserAndGroupAndIsConfirmedTrue(User user, Group group);
}