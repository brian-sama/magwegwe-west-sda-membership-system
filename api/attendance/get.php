<?php
include "../config/database.php";
header('Content-Type: application/json');

$sql = "SELECT at.*, m.first_name, m.last_name 
        FROM attendance at 
        JOIN members m ON at.member_id = m.id 
        ORDER BY at.date DESC";
$result = $conn->query($sql);

$records = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $records[] = $row;
    }
}
echo json_encode($records);
?>