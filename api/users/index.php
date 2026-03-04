<?php
require_once __DIR__ . '/../config.php';

$method = getMethod();
$id = getResourceId();

try {
    $db = getDB();

    switch ($method) {
        case 'GET':
            $stmt = $db->query('SELECT id, name, email, role, last_login, created_at FROM users');
            jsonResponse($stmt->fetchAll());
            break;

        case 'POST':
            $body = getRequestBody();
            $name = $body['name'] ?? '';
            $email = $body['email'] ?? '';
            $password = $body['password'] ?? '';
            $role = $body['role'] ?? 'CLERK';

            if (empty($name) || empty($email) || empty($password)) {
                jsonResponse(['error' => 'Name, email, and password are required'], 400);
            }

            $hash = password_hash($password, PASSWORD_BCRYPT);
            $userId = (string) time();

            $stmt = $db->prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([$userId, $name, $email, $hash, $role]);

            jsonResponse(['id' => $userId, 'name' => $name, 'email' => $email, 'role' => $role], 201);
            break;

        case 'DELETE':
            if (!$id)
                jsonResponse(['error' => 'User ID required'], 400);

            $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
            $stmt->execute([$id]);
            jsonResponse(['message' => 'User deleted']);
            break;

        default:
            jsonResponse(['message' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}
