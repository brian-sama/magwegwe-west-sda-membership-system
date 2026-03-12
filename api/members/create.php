<?php
include "../config/database.php";

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data provided"]);
    exit;
}

$first = $conn->real_escape_string($data['first_name'] ?? '');
$last = $conn->real_escape_string($data['last_name'] ?? '');
$phone = $conn->real_escape_string($data['phone'] ?? '');
$email = $conn->real_escape_string($data['email'] ?? '');
$gender = $conn->real_escape_string($data['gender'] ?? '');
$dob = $conn->real_escape_string($data['date_of_birth'] ?? '');
$address = $conn->real_escape_string($data['address'] ?? '');
$status = $conn->real_escape_string($data['status'] ?? 'ACTIVE');

if ($first === '' || $last === '') {
    echo json_encode(["status" => "error", "message" => "First and last name are required"]);
    exit;
}

$id = bin2hex(random_bytes(12));
$now = date('Y-m-d H:i:s');

$sql = "INSERT INTO members (id, first_name, last_name, phone, email, gender, date_of_birth, address, status, created_at, updated_at)
        VALUES ('$id', '$first', '$last', '$phone', '$email', '$gender', '$dob', '$address', '$status', '$now', '$now')";

if ($conn->query($sql)) {
    echo json_encode(["status" => "success", "id" => $id]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}
?>