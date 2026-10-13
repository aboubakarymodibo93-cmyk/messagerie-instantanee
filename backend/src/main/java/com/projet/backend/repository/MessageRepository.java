package com.projet.backend.repository;

import com.projet.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
           select m from Message m
           where (m.sender = :a and m.recipient = :b)
              or (m.sender = :b and m.recipient = :a)
           order by m.sentAt asc
           """)
    List<Message> conversation(@Param("a") String a, @Param("b") String b);
}
