<?php
include "../config/database.php";
header('Content-Type: application/json');

$sql = "SELECT id, name, email, role, created_at, last_login FROM users";
$result = $conn->query($sql);

$users = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}
echo json_encode($users);
?>