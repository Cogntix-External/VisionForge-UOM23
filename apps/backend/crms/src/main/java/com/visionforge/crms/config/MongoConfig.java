package com.visionforge.crms.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class MongoConfig {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Bean
    public MongoClient mongoClient() {
        ConnectionString connectionString = new ConnectionString(mongoUri);
        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .build();
        return MongoClients.create(settings);
    }

    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoClient(), getDatabaseName());
    }

    private String getDatabaseName() {
        // Extract DB name from URI (e.g., .../crms?...)
        String uri = mongoUri;
        int slashIdx = uri.lastIndexOf('/');
        int queryIdx = uri.indexOf('?', slashIdx);
        if (slashIdx >= 0) {
            String db = queryIdx > slashIdx
                    ? uri.substring(slashIdx + 1, queryIdx)
                    : uri.substring(slashIdx + 1);
            return db.isEmpty() ? "crms" : db;
        }
        return "crms";
    }
}
