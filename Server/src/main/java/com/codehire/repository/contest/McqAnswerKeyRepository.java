package com.codehire.repository.contest;

import com.codehire.document.McqAnswerKey;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface McqAnswerKeyRepository extends MongoRepository<McqAnswerKey, String> {

    Optional<McqAnswerKey> findByQuestionSetId(String questionSetId);
}