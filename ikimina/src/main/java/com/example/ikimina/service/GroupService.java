package com.example.ikimina.service;

import com.example.ikimina.entity.Group;
import com.example.ikimina.entity.Membership;
import com.example.ikimina.entity.User;
import com.example.ikimina.repository.GroupRepository;
import com.example.ikimina.repository.MembershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private UserService userService;

    /**
     * Create a new group
     */
    @Transactional
    public Group createGroup(String groupName, String description, BigDecimal paymentAmount, 
                            Group.PaymentFrequency paymentFrequency, User creator) {
        // Create the group
        Group group = new Group();
        group.setGroupName(groupName);
        group.setDescription(description);
        group.setPaymentAmount(paymentAmount);
        group.setPaymentFrequency(paymentFrequency);
        group.setCreatedByUser(creator);
        
        Group savedGroup = groupRepository.save(group);
        
        // Promote user to GROUP_ADMIN if they're not already
        if (creator.getRole() != User.UserRole.SYSTEM_ADMIN && 
            creator.getRole() != User.UserRole.GROUP_ADMIN) {
            userService.promoteToGroupAdmin(creator);
        }
        
        // Create membership for the creator (automatically confirmed)
        Membership membership = new Membership();
        membership.setUser(creator);
        membership.setGroup(savedGroup);
        membership.setConfirmed(true); // Creator is automatically confirmed
        membershipRepository.save(membership);
        
        return savedGroup;
    }

    /**
     * Get group by ID
     */
    public Optional<Group> getGroupById(Long id) {
        return groupRepository.findById(id);
    }

    /**
     * Get all groups
     */
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    /**
     * Get groups created by a specific user
     */
    public List<Group> getGroupsByCreator(User user) {
        return groupRepository.findByCreatedByUser(user);
    }

    /**
     * Search groups by name
     */
    public List<Group> searchGroupsByName(String searchTerm) {
        return groupRepository.findByGroupNameContainingIgnoreCase(searchTerm);
    }

    /**
     * Update group details
     */
    public Group updateGroup(Group group) {
        return groupRepository.save(group);
    }

    /**
     * Delete a group
     */
    @Transactional
    public void deleteGroup(Group group) {
        // First delete all memberships associated with this group
        List<Membership> memberships = membershipRepository.findByGroup(group);
        membershipRepository.deleteAll(memberships);
        
        // Then delete the group
        groupRepository.delete(group);
    }
}