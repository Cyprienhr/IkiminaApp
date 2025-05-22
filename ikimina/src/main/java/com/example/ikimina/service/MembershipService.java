package com.example.ikimina.service;

import com.example.ikimina.entity.Group;
import com.example.ikimina.entity.Membership;
// import com.example.ikimina.entity.Notification;
import com.example.ikimina.entity.User;
import com.example.ikimina.repository.MembershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MembershipService {

    @Autowired
    private MembershipRepository membershipRepository;
    
    @Autowired
    private NotificationService notificationService;

    /**
     * Request to join a group
     */
    public Membership requestJoinGroup(User user, Group group) {
        // Check if user is already a member or has a pending request
        Optional<Membership> existingMembership = membershipRepository.findByUserAndGroup(user, group);
        if (existingMembership.isPresent()) {
            if (existingMembership.get().isConfirmed()) {
                throw new IllegalStateException("User is already a member of this group");
            } else {
                throw new IllegalStateException("User already has a pending request to join this group");
            }
        }
        
        // Create new membership request
        Membership membership = new Membership();
        membership.setUser(user);
        membership.setGroup(group);
        membership.setConfirmed(false);
        
        Membership savedMembership = membershipRepository.save(membership);
        
        // Notify group admin about the join request
        User groupAdmin = group.getCreatedByUser();
        notificationService.createNotification(groupAdmin, 
            "New join request from " + user.getName() + " for group " + group.getGroupName());
        
        return savedMembership;
    }

    /**
     * Confirm a membership request
     */
    @Transactional
    public Membership confirmMembership(Membership membership) {
        if (membership.isConfirmed()) {
            throw new IllegalStateException("Membership is already confirmed");
        }
        
        membership.setConfirmed(true);
        Membership savedMembership = membershipRepository.save(membership);
        
        // Notify user that their request was approved
        notificationService.createNotification(membership.getUser(), 
            "You have been approved to join group " + membership.getGroup().getGroupName());
        
        return savedMembership;
    }

    /**
     * Reject a membership request
     */
    @Transactional
    public void rejectMembership(Membership membership) {
        if (membership.isConfirmed()) {
            throw new IllegalStateException("Cannot reject an already confirmed membership");
        }
        
        // Notify user that their request was rejected
        notificationService.createNotification(membership.getUser(), 
            "Your request to join group " + membership.getGroup().getGroupName() + " was rejected");
        
        // Delete the membership request
        membershipRepository.delete(membership);
    }

    /**
     * Get membership by ID
     */
    public Optional<Membership> getMembershipById(Long id) {
        return membershipRepository.findById(id);
    }

    /**
     * Get membership by user and group
     */
    public Optional<Membership> getMembershipByUserAndGroup(User user, Group group) {
        return membershipRepository.findByUserAndGroup(user, group);
    }

    /**
     * Get all memberships for a user
     */
    public List<Membership> getMembershipsByUser(User user) {
        return membershipRepository.findByUser(user);
    }

    /**
     * Get all confirmed memberships for a user
     */
    public List<Membership> getConfirmedMembershipsByUser(User user) {
        return membershipRepository.findByUser(user).stream()
                .filter(Membership::isConfirmed)
                .toList();
    }

    /**
     * Get all memberships for a group
     */
    public List<Membership> getMembershipsByGroup(Group group) {
        return membershipRepository.findByGroup(group);
    }

    /**
     * Get confirmed memberships for a group
     */
    public List<Membership> getConfirmedMembershipsByGroup(Group group) {
        return membershipRepository.findByGroupAndIsConfirmedTrue(group);
    }

    /**
     * Get pending memberships for a group
     */
    public List<Membership> getPendingMembershipsByGroup(Group group) {
        return membershipRepository.findByGroupAndIsConfirmedFalse(group);
    }

    /**
     * Check if a user is a member of a group
     */
    public boolean isUserMemberOfGroup(User user, Group group) {
        return membershipRepository.existsByUserAndGroupAndIsConfirmedTrue(user, group);
    }

    /**
     * Remove a user from a group
     */
    @Transactional
    public void removeMembership(Membership membership) {
        // Notify user that they have been removed from the group
        notificationService.createNotification(membership.getUser(), 
            "You have been removed from group " + membership.getGroup().getGroupName());
        
        // Delete the membership
        membershipRepository.delete(membership);
    }
}