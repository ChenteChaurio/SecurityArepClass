package com.mycompany.springsecure.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.mycompany.springsecure.model.UserDocument;

public interface UserRepository extends MongoRepository<UserDocument, String> {
    Optional<UserDocument> findByEmail(String email);

    boolean existsByEmail(String email);
}
