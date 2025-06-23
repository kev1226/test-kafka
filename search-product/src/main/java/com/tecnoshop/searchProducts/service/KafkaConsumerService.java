package com.tecnoshop.searchProducts.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tecnoshop.searchProducts.model.Product;
import com.tecnoshop.searchProducts.dto.ProductRequestDTO;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class KafkaConsumerService {

    private static final String REQUEST_TOPIC = "product.get.request";
    private static final String RESPONSE_TOPIC = "product.get.response";

    @Autowired
    private ProductService productService;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    // ✅ Inyectamos el ObjectMapper desde una configuración central
    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = REQUEST_TOPIC, groupId = "search-product-group")
    public void listenProductRequest(ConsumerRecord<String, String> record) {
        System.out.println("🟢 Mensaje recibido desde Kafka (" + REQUEST_TOPIC + "): " + record.value());

        try {
            ProductRequestDTO request = objectMapper.readValue(record.value(), ProductRequestDTO.class);
            String idStr = request.getProductId();

            if (idStr == null || idStr.isBlank()) {
                logAndRespond("⚠️ ID del producto es nulo o vacío.", "ID inválido");
                return;
            }

            Long id;
            try {
                id = Long.parseLong(idStr);
            } catch (NumberFormatException e) {
                logAndRespond("❌ ID no es un número válido: " + idStr, "ID inválido");
                return;
            }

            System.out.println("🔍 ID del producto solicitado: " + id);

            Optional<Product> productOpt = productService.getById(id);

            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                System.out.printf("✅ Producto encontrado: ID=%d, Nombre=%s, Precio=%.2f\n",
                        product.getId(), product.getName(), product.getPrice());

                try {
                    String response = objectMapper.writeValueAsString(product);
                    kafkaTemplate.send(RESPONSE_TOPIC, response);
                    System.out.println("📤 Respuesta enviada a " + RESPONSE_TOPIC + ": " + response);
                } catch (Exception serializationError) {
                    System.out.println("❌ Error al serializar el producto: " + serializationError.getMessage());
                    serializationError.printStackTrace();
                    kafkaTemplate.send(RESPONSE_TOPIC, "{\"error\":\"Error serializando producto\"}");
                }

            } else {
                logAndRespond("⚠️ Producto no encontrado con ID: " + id, "Producto no encontrado");
            }

        } catch (Exception e) {
            System.out.println("❌ Excepción en KafkaConsumerService: " + e.getClass().getSimpleName()
                    + " - " + e.getMessage());
            e.printStackTrace();
            kafkaTemplate.send(RESPONSE_TOPIC, "{\"error\":\"Error interno\"}");
        }
    }

    private void logAndRespond(String logMessage, String errorMsg) {
        System.out.println(logMessage);
        kafkaTemplate.send(RESPONSE_TOPIC, String.format("{\"error\":\"%s\"}", errorMsg));
    }
}
