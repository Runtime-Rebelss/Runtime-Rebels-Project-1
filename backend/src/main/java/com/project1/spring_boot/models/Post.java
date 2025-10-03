package com.project1.spring_boot.models;

public class Post {
    private String name;
    private String email;
    private String text;
    private String date;

    public Post() {
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getText() {
        return text;
    }
    public void setText(String text) {
        this.text = text;
    }
    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Post{");
        sb.append("name=").append(name);
        sb.append(", email=").append(email);
        sb.append(", text=").append(text);
        sb.append(", date=").append(date);
        sb.append('}');
        return sb.toString();
    }
}
