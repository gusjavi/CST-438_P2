package org.tierlist.project02backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@SpringBootApplication
public class Project02BackendApplication {
	private static final Logger logger = LoggerFactory.getLogger(Project02BackendApplication.class);

	private final DataSource dataSource;

	public Project02BackendApplication(DataSource dataSource) {
		this.dataSource = dataSource;
	}

	public static void main(String[] args) {
		SpringApplication.run(Project02BackendApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void testDatabaseConnection() {
		try (Connection conn = dataSource.getConnection()) {
			logger.info("Successfully connected to database: {}", conn.getCatalog());
		} catch (SQLException e) {
			logger.error("Failed to connect to database", e);
		}
	}
}