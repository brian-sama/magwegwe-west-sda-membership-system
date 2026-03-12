<?php
include "../config/database.php";
header('Content-Type: application/json');

$sql = "SELECT y.*, m.first_name, m.last_name 
        FROM youth y 
        JOIN members m ON y.member_id = m.id";
$result = $conn->query($sql);

$youth = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $youth[] = $row;
    }
}
echo json_encode($youth);
?>