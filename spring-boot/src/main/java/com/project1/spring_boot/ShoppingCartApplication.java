package com.project1.spring_boot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ShoppingCartApplication {

    public static void main(String[] args) {
        //ApplicationContext ctx = SpringApplication.run(ShoppingCart.class, args);
        SpringApplication.run(ShoppingCartApplication.class, args);
        // System.out.println("Shopping Cart");

        // String[] beanNames = ctx.getBeanDefinitionNames();
        // Arrays.sort(beanNames);
        // for (String beanName : beanNames) {
        // 	System.out.println(beanName);
        // }
    }
}
