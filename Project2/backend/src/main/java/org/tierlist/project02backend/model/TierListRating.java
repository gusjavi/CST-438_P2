package org.tierlist.project02backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tier_list_ratings",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "item_id"}))
public class TierListRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rating_id")
    private Long id;

    // Define an enum to represent the rankings
    public enum Ranking {
        F, E, D, C, B, A, S
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Ranking ranking;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Many ratings belong to one user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Many ratings belong to one TierList
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tier_list_id", nullable = false)
    private TierList tierList;

    // Many ratings belong to one TierListItem
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private TierListItem tierListItem;

    public TierListRating() {
        this.createdAt = LocalDateTime.now();
    }

    public TierListRating(Ranking ranking, User user, TierList tierList, TierListItem tierListItem) {
        this.ranking = ranking;
        this.user = user;
        this.tierList = tierList;
        this.tierListItem = tierListItem;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public Ranking getRanking() {
        return ranking;
    }

    public void setRanking(Ranking ranking) {
        this.ranking = ranking;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public TierList getTierList() {
        return tierList;
    }

    public void setTierList(TierList tierList) {
        this.tierList = tierList;
    }

    public TierListItem getTierListItem() {
        return tierListItem;
    }

    public void setTierListItem(TierListItem tierListItem) {
        this.tierListItem = tierListItem;
    }
}