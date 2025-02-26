package org.tierlist.project02backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@SpringBootApplication
public class Project02BackendApplication {

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
			System.out.println("Successfully connected to database: " + conn.getCatalog());
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
