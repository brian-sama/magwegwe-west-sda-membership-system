<?php

// Database configuration for cPanel environment
$host = "localhost";
$db = "magweusf_magwegwe_members";
$user = "magweusf_magwegwe_members"; // Update with cPanel user in production
$pass = "XQLLKXBJLyRekYusHMjy";     // Update with cPanel password in production

// Pre-connection settings
mysqli_report(MYSQLI_REPORT_OFF);

// Create connection
$conn = new mysqli($host, $user, $pass, $db);

// Check connection
if ($conn->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

// Set character set to utf8mb4
$conn->set_charset("utf8mb4");
?>