package org.tierlist.project02backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tierlist.project02backend.model.*;
import org.tierlist.project02backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class TierListService {
    private static final Logger logger = LoggerFactory.getLogger(TierListService.class);

    private final TierListRepository tierListRepository;
    private final TierListItemRepository tierListItemRepository;
    private final TierListRatingRepository tierListRatingRepository;
    private final TierListLikeRepository tierListLikeRepository;
    private final UserRepository userRepository;

    public TierListService(
            TierListRepository tierListRepository,
            TierListItemRepository tierListItemRepository,
            TierListRatingRepository tierListRatingRepository,
            TierListLikeRepository tierListLikeRepository,
            UserRepository userRepository) {
        this.tierListRepository = tierListRepository;
        this.tierListItemRepository = tierListItemRepository;
        this.tierListRatingRepository = tierListRatingRepository;
        this.tierListLikeRepository = tierListLikeRepository;
        this.userRepository = userRepository;
    }

    public TierList createTierList(TierList tierList) {
        logger.info("Creating new tier list: {}, is public: {}", tierList.getTitle(),tierList.isPublic());
        return tierListRepository.save(tierList);
    }

    public List<TierList> getAllTierLists() {
        logger.info("Fetching all tier lists");
        return tierListRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<TierList> getAllPublicTierLists() {
        logger.info("Fetching all public tier lists");
        try {
            return tierListRepository.findByIsPublicTrue();
        } catch (Exception e) {
            logger.error("Error fetching public tier lists: ", e);
            throw e; // Re-throw so the controller can handle it
        }
    }

    public Optional<TierList> getTierListById(Long id) {
        logger.info("Fetching tier list with id: {}", id);
        return tierListRepository.findById(id);
    }

    public List<TierListItem> getTierListItems(Long tierListId) {
        logger.info("Fetching items for tier list with id: {}", tierListId);
        return tierListItemRepository.findByTierListId(tierListId);
    }

    public TierListItem addTierListItem(Long tierListId, TierListItem item) {
        logger.info("Adding item {} to tier list with id: {}", item.getItemName(), tierListId);
        TierList tierList = tierListRepository.findById(tierListId)
                .orElseThrow(() -> {
                    logger.error("TierList not found with id: {}", tierListId);
                    return new RuntimeException("TierList not found with id: " + tierListId);
                });

        item.setTierList(tierList);
        return tierListItemRepository.save(item);
    }

    public List<TierListRating> getTierListRatings(Long tierListId) {
        logger.info("Fetching ratings for tier list with id: {}", tierListId);
        return tierListRatingRepository.findByTierListId(tierListId);
    }

    @Transactional
    public TierListRating rateTierListItem(Long tierListId, Long itemId, String userId, TierListRating.Ranking ranking) {
        logger.info("Rating item {} in tier list {} by user {}", itemId, tierListId, userId);
        TierList tierList = tierListRepository.findById(tierListId)
                .orElseThrow(() -> {
                    logger.error("TierList not found with id: {}", tierListId);
                    return new RuntimeException("TierList not found with id: " + tierListId);
                });

        TierListItem item = tierListItemRepository.findById(itemId)
                .orElseThrow(() -> {
                    logger.error("TierListItem not found with id: {}", itemId);
                    return new RuntimeException("TierListItem not found with id: " + itemId);
                });

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with id: {}", userId);
                    return new RuntimeException("User not found with id: " + userId);
                });

        // Check if rating already exists and update it
        Optional<TierListRating> existingRating = tierListRatingRepository.findByUserIdAndTierListItemId(userId, itemId);

        if (existingRating.isPresent()) {
            TierListRating rating = existingRating.get();
            rating.setRanking(ranking);
            logger.info("Updating existing rating for item {} by user {}", itemId, userId);
            return tierListRatingRepository.save(rating);
        } else {
            // Create new rating
            TierListRating newRating = new TierListRating(ranking, user, tierList, item);
            logger.info("Creating new rating for item {} by user {}", itemId, userId);
            return tierListRatingRepository.save(newRating);
        }
    }

    @Transactional
    public void likeTierList(Long tierListId, String userId) {
        logger.info("User {} liking tier list {}", userId, tierListId);
        TierList tierList = tierListRepository.findById(tierListId)
                .orElseThrow(() -> {
                    logger.error("TierList not found with id: {}", tierListId);
                    return new RuntimeException("TierList not found with id: " + tierListId);
                });

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with id: {}", userId);
                    return new RuntimeException("User not found with id: " + userId);
                });

        // FIX: Correct repository method
        boolean likeExists = tierListLikeRepository.existsByUser_UserIdAndTierListId(userId, tierListId);

        if (!likeExists) {
            TierListLike like = new TierListLike(user, tierList);
            tierListLikeRepository.save(like);
            logger.info("User {} successfully liked tier list {}", userId, tierListId);
        } else {
            logger.info("User {} already liked tier list {}", userId, tierListId);
        }
    }

    @Transactional
    public void unlikeTierList(Long tierListId, String userId) {
        logger.info("User {} unliking tier list {}", userId, tierListId);
        tierListLikeRepository.deleteByUserIdAndTierListId(userId, tierListId);
        logger.info("User {} successfully unliked tier list {}", userId, tierListId);
    }

    public int countLikesByTierListId(Long tierListId) {
        logger.info("Counting likes for tier list {}", tierListId);
        return tierListLikeRepository.countByTierListId(tierListId);
    }

    public List<TierList> getTierListsByUser(String userId) {
        logger.info("Fetching tier lists for user {}", userId);
        return tierListRepository.findByCreatorUserId(userId);
    }
}