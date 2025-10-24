<<<<<<<< HEAD:backend/src/test/java/com/runtimerebels/store/CartController.java
package com.runtimerebels.store;
========
package com;
>>>>>>>> shopping-cart-henry:backend/src/test/java/com/CartController.java

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CartController {

    @GetMapping("/")
    public String index() { return "I hate this shit!! BALL"; }
}
