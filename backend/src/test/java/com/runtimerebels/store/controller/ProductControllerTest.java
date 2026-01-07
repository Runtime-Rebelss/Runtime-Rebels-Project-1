package com.runtimerebels.store.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.runtimerebels.store.models.Product;
import com.runtimerebels.store.dao.ProductRepository;
import com.runtimerebels.store.dao.TokenRepository;
import com.runtimerebels.store.services.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.data.mongodb.core.query.Query;

@WebMvcTest(ProductController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProductControllerTest {

    private static final Logger log = LoggerFactory.getLogger(ProductControllerTest.class);
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductRepository productRepository;

    @MockBean
    private MongoTemplate mongoTemplate;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private TokenRepository tokenRepository;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    private Product makeProduct(String id, String name) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setDescription("desc");
        p.setPrice(new BigDecimal("19.99"));
        p.setImageUrl("/img.png");
        p.setSlug(name.toLowerCase().replaceAll("\\s+", "-"));
        p.setCategories(Arrays.asList("cat1", "cat2"));
        return p;
    }

    @Test
    @DisplayName("GET /api/products returns all products")
    void getAllProducts() throws Exception {
        List<Product> products = Arrays.asList(makeProduct("1", "A"), makeProduct("2", "B"));
        given(productRepository.findAll()).willReturn(products);

        mockMvc.perform(get("/api/products").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is("1")))
                .andExpect(jsonPath("$[0].name", is("A")));
    }

    @Test
    @DisplayName("GET /api/products/{id} returns product when found")
    void getProductById_found() throws Exception {
        Product p = makeProduct("abc", "Found");
        given(productRepository.findById("abc")).willReturn(Optional.of(p));

        mockMvc.perform(get("/api/products/{id}", "abc").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("abc")))
                .andExpect(jsonPath("$.name", is("Found")));
    }

    @Test
    @DisplayName("GET /api/products/{id} returns 404 when not found")
    void getProductById_notFound() throws Exception {
        given(productRepository.findById("missing")).willReturn(Optional.empty());

        mockMvc.perform(get("/api/products/{id}", "missing").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/products/results without params returns list from mongoTemplate")
    void searchProducts_noParams() throws Exception {
        List<Product> results = Arrays.asList(makeProduct("1", "SearchA"));
        given(mongoTemplate.find(any(), eq(Product.class))).willReturn(results);

        mockMvc.perform(get("/api/products/results").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("SearchA")));
    }

    @Test
    @DisplayName("GET /api/products/results with categories only")
    void searchProducts_categoriesOnly() throws Exception {
        List<Product> results = Arrays.asList(makeProduct("c1", "CatProd"));
        given(mongoTemplate.find(any(Query.class), eq(Product.class))).willReturn(results);

        mockMvc.perform(get("/api/products/results").param("categories", "cat1", "cat2").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("c1")));

        ArgumentCaptor<Query> cap = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate).find(cap.capture(), eq(Product.class));
        String q = cap.getValue().getQueryObject().toJson();
        // query should include categories criteria
        String expectedMarker = "categories";
        log.info("\n[categoriesOnly] expected contains='{}' | actualQuery={}\n", expectedMarker, q);
        
        org.junit.jupiter.api.Assertions.assertEquals(true, q.contains(expectedMarker), "Expected query to contain '" + expectedMarker + "'. Actual: " + q);
    }

    @Test
    @DisplayName("GET /api/products/results with search term only")
    void searchProducts_searchOnly() throws Exception {
        List<Product> results = Arrays.asList(makeProduct("s1", "SearchTermProd"));
        given(mongoTemplate.find(any(Query.class), eq(Product.class))).willReturn(results);

        mockMvc.perform(get("/api/products/results").param("search", "widget").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("s1")));

        ArgumentCaptor<Query> cap = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate).find(cap.capture(), eq(Product.class));
        String q = cap.getValue().getQueryObject().toJson();
        // regex search should be present (pattern-quoted), we at least expect the search term text somewhere
        String expectedTerm = "widget";
        log.info("\n[searchOnly] expected contains='{}' | actualQuery={}\n", expectedTerm, q);
        
        org.junit.jupiter.api.Assertions.assertEquals(true, q.toLowerCase().contains(expectedTerm), "Expected query to contain '" + expectedTerm + "'. Actual: " + q);
    }

    @Test
    @DisplayName("GET /api/products/results expands 'shoe' to include 'sneaker' in regex")
    void searchProducts_searchOnly_expandsShoeSynonyms() throws Exception {
        List<Product> results = Arrays.asList(makeProduct("s2", "Sneakers"));
        given(mongoTemplate.find(any(Query.class), eq(Product.class))).willReturn(results);

        mockMvc.perform(get("/api/products/results").param("search", "shoe").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("s2")));

        ArgumentCaptor<Query> cap = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate).find(cap.capture(), eq(Product.class));
        String q = cap.getValue().getQueryObject().toJson().toLowerCase();

        org.junit.jupiter.api.Assertions.assertEquals(true, q.contains("shoe"), "Expected query to contain 'shoe'. Actual: " + q);
        org.junit.jupiter.api.Assertions.assertEquals(true, q.contains("sneaker"), "Expected query to contain 'sneaker'. Actual: " + q);
    }

    @Test
    @DisplayName("GET /api/products/results with categories and search term combined")
    void searchProducts_categoriesAndSearch() throws Exception {
        List<Product> results = Arrays.asList(makeProduct("cs1", "CombinedProd"));
        given(mongoTemplate.find(any(Query.class), eq(Product.class))).willReturn(results);

        mockMvc.perform(get("/api/products/results")
                        .param("categories", "catA")
                        .param("search", "combo")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("cs1")));

        ArgumentCaptor<Query> cap = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate).find(cap.capture(), eq(Product.class));
        String q = cap.getValue().getQueryObject().toJson();
        String expectedCat = "categories";
        String expectedSearch = "combo";
        log.info("\n[categoriesAndSearch] expected categories='{}' search='{}' | actualQuery={}\n", expectedCat, expectedSearch, q);
        
        org.junit.jupiter.api.Assertions.assertEquals(true, q.contains(expectedCat), "Expected query to contain '" + expectedCat + "'. Actual: " + q);
        org.junit.jupiter.api.Assertions.assertEquals(true, q.toLowerCase().contains(expectedSearch), "Expected query to contain '" + expectedSearch + "'. Actual: " + q);
    }
}