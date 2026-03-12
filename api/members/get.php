<?php
include "../config/database.php";

header('Content-Type: application/json');

$sql = "SELECT * FROM members ORDER BY last_name, first_name";
$result = $conn->query($sql);

$members = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $members[] = $row;
    }
}

echo json_encode($members);
?>