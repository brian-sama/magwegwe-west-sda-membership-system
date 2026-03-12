<?php
include "../config/database.php";

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(["status" => "error", "message" => "Email and password required"]);
    exit;
}

$email = $conn->real_escape_string($data['email']);
$password = $data['password'];

$sql = "SELECT id, name, email, password, role FROM users WHERE email = '$email' LIMIT 1";
$result = $conn->query($sql);

if (!$result || $result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
    exit;
}

$user = $result->fetch_assoc();

if (password_verify($password, $user['password'])) {
    // Session-less token for brevity
    $token = bin2hex(random_bytes(16));

    unset($user['password']);

    echo json_encode([
        "status" => "success",
        "message" => "Login successful",
        "token" => $token,
        "user" => $user
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
}
?>