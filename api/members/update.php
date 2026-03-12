<?php
include "../config/database.php";

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'])) {
    echo json_encode(["status" => "error", "message" => "Member ID required"]);
    exit;
}

$id = $conn->real_escape_string($data['id']);
$first = $conn->real_escape_string($data['first_name'] ?? '');
$last = $conn->real_escape_string($data['last_name'] ?? '');
$phone = $conn->real_escape_string($data['phone'] ?? '');

if ($first === '' || $last === '') {
    echo json_encode(["status" => "error", "message" => "First and last name are required"]);
    exit;
}

$now = date('Y-m-d H:i:s');

$sql = "UPDATE members SET first_name = '$first', last_name = '$last', phone = '$phone', updated_at = '$now' WHERE id = '$id'";

if ($conn->query($sql)) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}
?>