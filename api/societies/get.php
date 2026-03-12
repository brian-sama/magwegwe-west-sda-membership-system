<?php
include "../config/database.php";

header('Content-Type: application/json');

$sql = "SELECT * FROM societies ORDER BY name";
$result = $conn->query($sql);

$societies = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $societies[] = $row;
    }
}

echo json_encode($societies);
?>