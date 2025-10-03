package com.project1.spring_boot;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CartController {

    @GetMapping("/")
    public String index() { return "I hate this shit!! BALL"; }
}
