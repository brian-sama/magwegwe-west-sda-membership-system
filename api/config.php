<?php
// ============================================
// Database & JWT Configuration
// ============================================

// CORS Headers - Allow frontend to connect
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ---- Database Configuration ----
define('DB_HOST', 'localhost');
define('DB_USER', 'magweusf_magwegwe_members');
define('DB_PASS', 'rqcMJWTvpJBkC4b2QQ3N');
define('DB_NAME', 'magweusf_magwegwe_members');

// ---- JWT Configuration ----
define('JWT_SECRET', 'magwegwe_secure_jwt_secret_2024');
define('JWT_EXPIRY', 8 * 3600); // 8 hours

// ---- Database Connection ----
function getDB()
{
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database connection failed: ' . $e->getMessage()]);
            exit();
        }
    }
    return $pdo;
}

// ---- Helper: Get JSON Request Body ----
function getRequestBody()
{
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// ---- Helper: Send JSON Response ----
function jsonResponse($data, $statusCode = 200)
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// ---- Simple JWT Implementation ----
function base64UrlEncode($data)
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data)
{
    return base64_decode(strtr($data, '-_', '+/'));
}

function createJWT($payload)
{
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    $payload = json_encode($payload);

    $base64Header = base64UrlEncode($header);
    $base64Payload = base64UrlEncode($payload);

    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $base64Signature = base64UrlEncode($signature);

    return "$base64Header.$base64Payload.$base64Signature";
}

function verifyJWT($token)
{
    $parts = explode('.', $token);
    if (count($parts) !== 3)
        return null;

    [$base64Header, $base64Payload, $base64Signature] = $parts;

    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $expectedSignature = base64UrlEncode($signature);

    if (!hash_equals($expectedSignature, $base64Signature))
        return null;

    $payload = json_decode(base64UrlDecode($base64Payload), true);

    if (isset($payload['exp']) && $payload['exp'] < time())
        return null;

    return $payload;
}

// ---- Helper: Get HTTP Method ----
function getMethod()
{
    return $_SERVER['REQUEST_METHOD'];
}

// ---- Helper: Get URL Path Segments ----
function getPathSegments()
{
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    // Remove /api/resource/ prefix to get ID or sub-path
    $parts = explode('/', trim($path, '/'));
    return $parts;
}

// ---- Helper: Get Resource ID from URL ----
function getResourceId()
{
    $segments = getPathSegments();
    // URL pattern: /api/resource/{id}
    return isset($segments[2]) ? $segments[2] : null;
}
