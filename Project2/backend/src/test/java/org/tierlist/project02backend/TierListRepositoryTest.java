package org.tierlist.project02backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.tierlist.project02backend.model.TierList;
import org.tierlist.project02backend.repository.TierListRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class TierListRepositoryTest {

    @Autowired
    private TierListRepository tierListRepository;

    @Test
    public void testCreateAndFindTierList() {
        // Create a new TierList instance
        TierList tierList = new TierList("Test Tier List", "This is a test tier list", true, null);
        TierList savedTierList = tierListRepository.save(tierList);

        // Verify that an ID was generated
        assertThat(savedTierList.getId()).isNotNull();

        // Retrieve the TierList by its id
        Optional<TierList> fetchedOpt = tierListRepository.findById(savedTierList.getId());
        assertThat(fetchedOpt).isPresent();

        TierList fetched = fetchedOpt.get();
        assertThat(fetched.getTitle()).isEqualTo("Test Tier List");
        assertThat(fetched.getDescription()).isEqualTo("This is a test tier list");
        assertThat(fetched.isPublic()).isTrue();
    }

    @Test
    public void testUpdateTierList() {
        // Create and save a TierList
        TierList tierList = new TierList("Initial Title", "Initial Description", true, null);
        TierList saved = tierListRepository.save(tierList);

        // Update fields
        saved.setTitle("Updated Title");
        saved.setDescription("Updated Description");
        tierListRepository.save(saved);

        // Retrieve and verify changes
        Optional<TierList> updatedOpt = tierListRepository.findById(saved.getId());
        assertThat(updatedOpt).isPresent();
        TierList updated = updatedOpt.get();
        assertThat(updated.getTitle()).isEqualTo("Updated Title");
        assertThat(updated.getDescription()).isEqualTo("Updated Description");
    }

    @Test
    public void testDeleteTierList() {
        // Create and save a TierList
        TierList tierList = new TierList("To be deleted", "Delete this tier list", true, null);
        TierList saved = tierListRepository.save(tierList);
        Long id = saved.getId();

        // Delete the TierList
        tierListRepository.delete(saved);

        // Verify it no longer exists
        Optional<TierList> deletedOpt = tierListRepository.findById(id);
        assertThat(deletedOpt).isNotPresent();
    }

    @Test
    public void testFindAllTierLists() {
        // Save multiple TierLists
        TierList t1 = new TierList("List1", "Desc1", true, null);
        TierList t2 = new TierList("List2", "Desc2", false, null);
        tierListRepository.save(t1);
        tierListRepository.save(t2);

        // Retrieve all tier lists
        List<TierList> lists = tierListRepository.findAll();
        // Assert that at least 2 lists exist
        assertThat(lists.size()).isGreaterThanOrEqualTo(2);
    }
}
