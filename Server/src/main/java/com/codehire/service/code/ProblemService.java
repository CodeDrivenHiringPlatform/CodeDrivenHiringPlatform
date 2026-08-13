package com.codehire.service.code;

import com.codehire.document.Problem;
import com.codehire.exception.ProblemException;
import com.codehire.repository.code.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final MongoTemplate mongoTemplate;

    public Map<String, Object> getProblems(String search, String topic, String difficulty, int page, int limit) {

        Query query = new Query();

        List<Criteria> criteriaList = new ArrayList<>();

        if (search != null && !search.isEmpty()) {
            criteriaList.add(Criteria.where("title").regex(search, "i"));
        }
        if (topic != null && !"All".equalsIgnoreCase(topic)) {
            criteriaList.add(Criteria.where("topics").in(topic));
        }
        if (difficulty != null && !"All".equalsIgnoreCase(difficulty)) {
            criteriaList.add(Criteria.where("difficulty").is(difficulty));
        }
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Problem.class);

        Pageable pageable = PageRequest.of(page - 1, limit);
        query.with(pageable);

        List<Problem> problems = mongoTemplate.find(query, Problem.class);

        Map<String, Object> response = new HashMap<>();
        response.put("problems", problems);
        Map<String, Object> pagination = new HashMap<>();
        pagination.put("page", page);
        pagination.put("pages", (int) Math.ceil((double) total / limit));
        pagination.put("hasNextPage", page * limit < total);
        response.put("pagination", pagination);

        return response;
    }

    public List<String> getTopics() {
        return mongoTemplate.query(Problem.class)
                .distinct("topics")
                .as(String.class)
                .all();
    }

    public Problem getProblemById(String id) {
        return problemRepository.findByProblemId(id).orElseThrow(()-> new ProblemException("Problem not found!"));
    }
}
