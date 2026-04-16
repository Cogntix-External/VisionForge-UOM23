package com.visionforge.crms.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.event.ApplicationReadyEvent;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

import java.util.ArrayList;

@Component
public class MongoHealthCheck {
    private static final Logger log = LoggerFactory.getLogger(MongoHealthCheck.class);

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        log.info("MongoHealthCheck: attempting to connect to MongoDB using URI={}", mongoUri);
        try (MongoClient client = MongoClients.create(mongoUri)) {
            var names = client.listDatabaseNames().into(new ArrayList<>());
            log.info("MongoHealthCheck: connected to MongoDB, databases={} (showing up to 10): {}", names.size(), names.stream().limit(10).toList());
        } catch (Exception ex) {
            log.error("MongoHealthCheck: failed to connect to MongoDB: {}", ex.getMessage());
            log.debug("MongoHealthCheck: full stack:", ex);
        }
    }
}
