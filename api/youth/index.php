<?php
require_once __DIR__ . '/../config.php';

$method = getMethod();

try {
    $db = getDB();

    switch ($method) {
        case 'GET':
            $stmt = $db->query('SELECT * FROM youth_members ORDER BY last_name');
            jsonResponse($stmt->fetchAll());
            break;

        case 'POST':
            $body = getRequestBody();
            $fieldMap = [
                'id' => 'id',
                'firstName' => 'first_name',
                'lastName' => 'last_name',
                'dob' => 'dob',
                'parentName' => 'parent_name',
                'parentPhone' => 'parent_phone',
                'grade' => 'grade',
                'club' => 'club',
                'rank' => '`rank`',
                'healthNotes' => 'health_notes',
                'registrationDate' => 'registration_date'
            ];

            $fields = [];
            $placeholders = [];
            $values = [];

            foreach ($fieldMap as $camel => $snake) {
                if (isset($body[$camel]) && $body[$camel] !== '' && $body[$camel] !== null) {
                    $fields[] = $snake;
                    $placeholders[] = '?';
                    $values[] = $body[$camel];
                }
            }

            if (empty($fields))
                jsonResponse(['error' => 'No data provided'], 400);

            $sql = 'INSERT INTO youth_members (' . implode(', ', $fields) . ') VALUES (' . implode(', ', $placeholders) . ')';
            $stmt = $db->prepare($sql);
            $stmt->execute($values);

            jsonResponse(['id' => $body['id'] ?? $db->lastInsertId(), 'message' => 'Youth member created'], 201);
            break;

        default:
            jsonResponse(['message' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}
