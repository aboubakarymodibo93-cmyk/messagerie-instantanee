package com.projet.backend.controller;

import com.projet.backend.model.Message;
import com.projet.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MessageController {

    private final MessageRepository messages;

    /** Historique entre "me" et "with". */
    @GetMapping("/messages")
    public List<Message> history(@RequestParam String me, @RequestParam String with) {
        return messages.conversation(me, with);
    }
}
