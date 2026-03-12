<?php
include "../config/database.php";

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'])) {
    echo json_encode(["status" => "error", "message" => "Member ID required"]);
    exit;
}

$id = $conn->real_escape_string($data['id']);

$sql = "DELETE FROM members WHERE id = '$id'";

if ($conn->query($sql)) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}
?>