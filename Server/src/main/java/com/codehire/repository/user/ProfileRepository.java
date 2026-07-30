package com.codehire.repository.user;

import com.codehire.document.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ProfileRepository extends MongoRepository<Profile,String> {

    Optional<Profile> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}