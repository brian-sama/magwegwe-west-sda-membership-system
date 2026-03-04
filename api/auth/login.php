<?php
require_once __DIR__ . '/../config.php';

if (getMethod() !== 'POST') {
    jsonResponse(['message' => 'Method not allowed'], 405);
}

$body = getRequestBody();
$email = $body['email'] ?? '';
$password = $body['password'] ?? '';

if (empty($email) || empty($password)) {
    jsonResponse(['message' => 'Email and password are required'], 400);
}

try {
    $db = getDB();

    // Find user by email
    $stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(['message' => 'Invalid credentials'], 401);
    }

    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        jsonResponse(['message' => 'Invalid credentials'], 401);
    }

    // Generate JWT token
    $token = createJWT([
        'id' => $user['id'],
        'role' => $user['role']
    ]);

    // Update last login
    $stmt = $db->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
    $stmt->execute([$user['id']]);

    // Return token and user info
    jsonResponse([
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'lastLogin' => date('c')
        ]
    ]);

} catch (Exception $e) {
    jsonResponse(['message' => 'Server error: ' . $e->getMessage()], 500);
}
