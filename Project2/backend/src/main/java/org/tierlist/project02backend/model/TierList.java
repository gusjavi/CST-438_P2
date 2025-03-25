package org.tierlist.project02backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
@Entity
@Table(name = "tier_lists")
public class TierList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1024)
    private String description;

    @Column(name = "category")
    private String category;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_weekly_featured", nullable = false)
    private boolean isWeeklyFeatured = false;

    @Column(name = "scheduled_for")
    private LocalDate scheduledFor;

    // Many TierLists can be created by one User (optional, if you want to track creator)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")

    // not sure about this, needs testing tbh
//    @OneToMany(mappedBy = "tierList", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    private List<TierListLike> likes;

    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weekly_parent_id")
    private TierList weeklyParent;

    public TierList() {
        this.createdAt = LocalDateTime.now();
    }

    public TierList(String title, String description, boolean isPublic, User creator) {
        this.title = title;
        this.description = description;
        this.isPublic = isPublic;
        this.creator = creator;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean aPublic) {
        isPublic = aPublic;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public boolean isWeeklyFeatured() { return isWeeklyFeatured; }

    public void setWeeklyFeatured(boolean weeklyFeatured) { isWeeklyFeatured = weeklyFeatured; }

    public LocalDate getScheduledFor() { return scheduledFor; }

    public void setScheduledFor(LocalDate scheduledFor) { this.scheduledFor = scheduledFor; }

    public TierList getWeeklyParent() { return weeklyParent; }

    public void setWeeklyParent(TierList weeklyParent) { this.weeklyParent = weeklyParent; }
}