package com.project1.spring_boot.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project1.spring_boot.models.Post;
import com.project1.spring_boot.models.PostRepository;

import jakarta.servlet.http.HttpServletResponse;

@RestController
public class PostController {

    @RequestMapping(value = "/")
    public void redirect(HttpServletResponse response) throws IOException {
        response.sendRedirect("/swagger-ui.html");
    }

    @Autowired
    PostRepository repo;

    @GetMapping("/posts")
    public List<Post> getAllPosts() {
        return repo.findAll();
    }

    @PostMapping("/post")
    public Post addPost(@RequestBody Post post) {
        return repo.save(post);
    }

}
//34:40


