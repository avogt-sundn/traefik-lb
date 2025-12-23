package com.example.simplerestapi.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.simplerestapi.model.Greeting;

@Service
public class ForwardingGreetingService {

    private final WebClient webClient;

    public ForwardingGreetingService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://gateway").build();
    }

    public Greeting saveGreeting(String g) {
        return webClient.post()
                .uri("/api/two/greet")
                .bodyValue(g)
                .retrieve()
                .bodyToMono(Greeting.class)
                .block();
    }

    public List<Greeting> getAllGreetings() {
        return webClient.get()
                .uri("/api/two/greetings")
                .retrieve()
                .bodyToFlux(Greeting.class)
                .collectList()
                .block();
    }
}