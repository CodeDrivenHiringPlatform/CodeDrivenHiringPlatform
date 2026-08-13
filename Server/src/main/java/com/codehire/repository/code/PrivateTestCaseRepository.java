package com.codehire.repository.code;

import com.codehire.document.PrivateTestCase;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrivateTestCaseRepository extends MongoRepository<PrivateTestCase, String> {

    Optional<PrivateTestCase> findByProblemId(String problemId);
}
