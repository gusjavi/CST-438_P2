package org.tierlist.project02backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tier_lists")
public class TierList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tier_list_id")
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

    // Many TierLists can be created by one User (optional, if you want to track creator)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")

    // not sure about this, needs testing tbh
    @OneToMany(mappedBy = "tierList", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TierListLike> likes;
    
    private User creator;

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
}
