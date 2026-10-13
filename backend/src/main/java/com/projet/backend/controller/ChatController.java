package com.projet.backend.controller;

import com.projet.backend.model.Message;
import com.projet.backend.repository.MessageRepository;
import com.projet.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageRepository messages;
    private final UserRepository users;
    private final SimpMessagingTemplate template;

    /**
     * Le client envoie sur /app/chat.send un JSON : {sender, recipient, content}.
     * Le message est sauvegardé puis poussé au destinataire ET à l'expéditeur
     * (pour synchroniser plusieurs appareils / confirmer l'envoi).
     */
    @MessageMapping("/chat.send")
    public void send(Message incoming) {
        String content = incoming.getContent() == null ? "" : incoming.getContent().trim();
        if (content.isEmpty() || content.length() > 2000) return;
        if (!users.existsByUsername(incoming.getSender())
                || !users.existsByUsername(incoming.getRecipient())) return;

        Message m = new Message();
        m.setSender(incoming.getSender());
        m.setRecipient(incoming.getRecipient());
        m.setContent(content);
        m.setSentAt(Instant.now());
        Message saved = messages.save(m);

        template.convertAndSend("/topic/messages." + saved.getRecipient(), saved);
        template.convertAndSend("/topic/messages." + saved.getSender(), saved);
    }
}
