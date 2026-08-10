package com.codehire.service.admin;

import com.codehire.document.McqAnswerKey;
import com.codehire.document.McqQuestionSet;
import com.codehire.dto.contest.McqQuestionSetRequest;
import com.codehire.dto.contest.McqQuestionSetResponse;
import com.codehire.dto.contest.QuestionDto;
import com.codehire.repository.contest.McqAnswerKeyRepository;
import com.codehire.repository.contest.McqQuestionSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminMcqContestService {

    private final McqQuestionSetRepository questionSetRepository;
    private final McqAnswerKeyRepository answerKeyRepository;

    public List<McqQuestionSetResponse> getAllQuestionSets() {
        return questionSetRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public McqQuestionSetResponse getQuestionSetById(String id) {
        McqQuestionSet set = questionSetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question set not found with id: " + id));
        return mapToResponse(set);
    }

    @Transactional
    public McqQuestionSetResponse createQuestionSet(McqQuestionSetRequest request) {
        McqQuestionSet questionSet = McqQuestionSet.builder()
                .title(request.getTitle())
                .topic(request.getTopic())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes(request.getDurationMinutes())
                .totalMarks(request.getTotalMarks())
                .build();

        List<McqQuestionSet.Question> questions = new ArrayList<>();
        Map<String, Integer> answerMap = new HashMap<>();

        if (request.getQuestions() != null) {
            for (QuestionDto qDto : request.getQuestions()) {
                String qId = qDto.getQuestionId() != null ? qDto.getQuestionId() : UUID.randomUUID().toString();

                questions.add(new McqQuestionSet.Question(qId, qDto.getQuestionText(), qDto.getOptions()));

                if (qDto.getCorrectAnswerIndex() != null) {
                    answerMap.put(qId, qDto.getCorrectAnswerIndex());
                }
            }
        }

        questionSet.setQuestions(questions);
        McqQuestionSet savedSet = questionSetRepository.save(questionSet);

        McqAnswerKey answerKey = McqAnswerKey.builder()
                .questionSetId(savedSet.getId())
                .correctAnswers(answerMap)
                .build();
        answerKeyRepository.save(answerKey);

        return mapToResponse(savedSet);
    }

    @Transactional
    public McqQuestionSetResponse updateQuestionSet(String id, McqQuestionSetRequest request) {
        McqQuestionSet existingSet = questionSetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question set not found with id: " + id));

        existingSet.setTitle(request.getTitle());
        existingSet.setTopic(request.getTopic());
        existingSet.setDescription(request.getDescription());
        existingSet.setStartTime(request.getStartTime());
        existingSet.setEndTime(request.getEndTime());
        existingSet.setDurationMinutes(request.getDurationMinutes());
        existingSet.setTotalMarks(request.getTotalMarks());

        List<McqQuestionSet.Question> updatedQuestions = new ArrayList<>();
        Map<String, Integer> updatedAnswerMap = new HashMap<>();

        if (request.getQuestions() != null) {
            for (QuestionDto qDto : request.getQuestions()) {
                String qId = qDto.getQuestionId() != null ? qDto.getQuestionId() : UUID.randomUUID().toString();

                updatedQuestions.add(new McqQuestionSet.Question(qId, qDto.getQuestionText(), qDto.getOptions()));

                if (qDto.getCorrectAnswerIndex() != null) {
                    updatedAnswerMap.put(qId, qDto.getCorrectAnswerIndex());
                }
            }
        }

        existingSet.setQuestions(updatedQuestions);
        McqQuestionSet savedSet = questionSetRepository.save(existingSet);

        McqAnswerKey answerKey = answerKeyRepository.findByQuestionSetId(id)
                .orElseGet(() -> McqAnswerKey.builder().questionSetId(id).build());

        answerKey.setCorrectAnswers(updatedAnswerMap);
        answerKeyRepository.save(answerKey);

        return mapToResponse(savedSet);
    }

    @Transactional
    public void deleteQuestionSet(String id) {
        if (!questionSetRepository.existsById(id)) {
            throw new RuntimeException("Question set not found with id: " + id);
        }
        questionSetRepository.deleteById(id);
        answerKeyRepository.findByQuestionSetId(id)
                .ifPresent(key -> answerKeyRepository.deleteById(key.getId()));
    }

    private McqQuestionSetResponse mapToResponse(McqQuestionSet set) {
        Map<String, Integer> answerMap = answerKeyRepository.findByQuestionSetId(set.getId())
                .map(McqAnswerKey::getCorrectAnswers)
                .orElse(Collections.emptyMap());

        List<QuestionDto> questionDtos = Optional.ofNullable(set.getQuestions())
                .orElse(Collections.emptyList())
                .stream()
                .map(q -> QuestionDto.builder()
                        .questionId(q.getQuestionId())
                        .questionText(q.getQuestionText())
                        .options(q.getOptions())
                        .correctAnswerIndex(answerMap.get(q.getQuestionId()))
                        .build())
                .collect(Collectors.toList());

        return McqQuestionSetResponse.builder()
                .id(set.getId())
                .title(set.getTitle())
                .topic(set.getTopic())
                .description(set.getDescription())
                .startTime(set.getStartTime())
                .endTime(set.getEndTime())
                .durationMinutes(set.getDurationMinutes())
                .totalMarks(set.getTotalMarks())
                .questions(questionDtos)
                .build();
    }
}