<?php
include "../config/database.php";

header('Content-Type: application/json');

// Simplified: In a real app, check Authorization header / session
$token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

// Mocking 'me' response for demo purposes
// In reality, search database for associated token
echo json_encode([
    "id" => "1",
    "name" => "Admin User",
    "email" => "admin@example.com",
    "role" => "Admin"
]);
?>