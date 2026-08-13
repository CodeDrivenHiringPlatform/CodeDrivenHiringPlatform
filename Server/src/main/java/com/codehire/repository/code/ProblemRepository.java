package com.codehire.repository.code;

import com.codehire.document.Problem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ProblemRepository extends MongoRepository<Problem , String>  {
    Optional<Problem> findByProblemId(String problemId);
}
