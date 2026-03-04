<?php
require_once __DIR__ . '/../config.php';

$method = getMethod();
$id = getResourceId();

try {
    $db = getDB();

    switch ($method) {
        case 'GET':
            $stmt = $db->query('SELECT * FROM members ORDER BY last_name, first_name');
            jsonResponse($stmt->fetchAll());
            break;

        case 'POST':
            $body = getRequestBody();
            $fields = [];
            $placeholders = [];
            $values = [];

            // Map camelCase from frontend to snake_case for DB
            $fieldMap = [
                'id' => 'id',
                'firstName' => 'first_name',
                'lastName' => 'last_name',
                'nationalId' => 'national_id',
                'email' => 'email',
                'phone' => 'phone',
                'status' => 'status',
                'department' => 'department',
                'registrationDate' => 'registration_date',
                'baptismDate' => 'baptism_date',
                'previousChurch' => 'previous_church',
                'destinationChurch' => 'destination_church',
                'transferDate' => 'transfer_date',
                'boardApprovalDate' => 'board_approval_date',
                'address' => 'address',
                'notes' => 'notes'
            ];

            foreach ($fieldMap as $camel => $snake) {
                if (isset($body[$camel]) && $body[$camel] !== '' && $body[$camel] !== null) {
                    $fields[] = "`$snake`";
                    $placeholders[] = '?';
                    $values[] = $body[$camel];
                }
            }

            if (empty($fields)) {
                jsonResponse(['error' => 'No data provided'], 400);
            }

            $sql = 'INSERT INTO members (' . implode(', ', $fields) . ') VALUES (' . implode(', ', $placeholders) . ')';
            $stmt = $db->prepare($sql);
            $stmt->execute($values);

            jsonResponse(['id' => $body['id'] ?? $db->lastInsertId(), 'message' => 'Member created'], 201);
            break;

        case 'PUT':
            if (!$id)
                jsonResponse(['error' => 'Member ID required'], 400);

            $body = getRequestBody();
            $fieldMap = [
                'firstName' => 'first_name',
                'lastName' => 'last_name',
                'nationalId' => 'national_id',
                'email' => 'email',
                'phone' => 'phone',
                'status' => 'status',
                'department' => 'department',
                'registrationDate' => 'registration_date',
                'baptismDate' => 'baptism_date',
                'previousChurch' => 'previous_church',
                'destinationChurch' => 'destination_church',
                'transferDate' => 'transfer_date',
                'boardApprovalDate' => 'board_approval_date',
                'address' => 'address',
                'notes' => 'notes'
            ];

            $sets = [];
            $values = [];
            foreach ($fieldMap as $camel => $snake) {
                if (array_key_exists($camel, $body)) {
                    $sets[] = "`$snake` = ?";
                    $values[] = $body[$camel];
                }
            }

            if (empty($sets))
                jsonResponse(['error' => 'No update data'], 400);

            $values[] = $id;
            $sql = 'UPDATE members SET ' . implode(', ', $sets) . ' WHERE id = ?';
            $stmt = $db->prepare($sql);
            $stmt->execute($values);

            jsonResponse(['message' => 'Member updated', 'id' => $id]);
            break;

        case 'DELETE':
            if (!$id)
                jsonResponse(['error' => 'Member ID required'], 400);

            $stmt = $db->prepare('DELETE FROM members WHERE id = ?');
            $stmt->execute([$id]);
            jsonResponse(['message' => 'Member deleted']);
            break;

        default:
            jsonResponse(['message' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}
