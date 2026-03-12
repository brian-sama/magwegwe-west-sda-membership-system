<?php
http_response_code(410);
header('Content-Type: application/json');
echo json_encode(['message' => 'Deprecated endpoint. Use /api/v1 via api/index.php']);