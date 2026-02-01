<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Rate limiting simple
$ip = $_SERVER['REMOTE_ADDR'];
$rate_file = __DIR__ . '/../logs/rate_limit.json';
$max_requests = 5;
$time_window = 600; // 10 minutos

if (file_exists($rate_file)) {
    $rate_data = json_decode(file_get_contents($rate_file), true);
} else {
    $rate_data = [];
}

$current_time = time();
if (!isset($rate_data[$ip])) {
    $rate_data[$ip] = [];
}

// Limpiar requests antiguos
$rate_data[$ip] = array_filter($rate_data[$ip], function($timestamp) use ($current_time, $time_window) {
    return ($current_time - $timestamp) < $time_window;
});

// Verificar límite
if (count($rate_data[$ip]) >= $max_requests) {
    http_response_code(429);
    echo json_encode(['error' => 'Demasiadas solicitudes. Intenta más tarde.']);
    exit;
}

// Agregar request actual
$rate_data[$ip][] = $current_time;
file_put_contents($rate_file, json_encode($rate_data));

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Validar campos requeridos
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');
$source_url = trim($_POST['source_url'] ?? '');
$hp_field = trim($_POST['hp_field'] ?? '');

// Honeypot check
if (!empty($hp_field)) {
    http_response_code(400);
    echo json_encode(['error' => 'Solicitud inválida']);
    exit;
}

// Validaciones básicas
if (empty($name) || empty($email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nombre y email son requeridos']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email inválido']);
    exit;
}

// Preparar datos
$timestamp = date('Y-m-d H:i:s');
$data = [
    'timestamp' => $timestamp,
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'message' => $message,
    'source_url' => $source_url,
    'ip' => $ip
];

// Guardar en CSV
$csv_file = __DIR__ . '/../data/subscribers.csv';
$csv_exists = file_exists($csv_file);

$csv_data = [
    $timestamp,
    $name,
    $email,
    $phone,
    $message,
    $source_url,
    $ip
];

// Escapar campos CSV
$csv_data = array_map(function($field) {
    return '"' . str_replace('"', '""', $field) . '"';
}, $csv_data);

$csv_line = implode(',', $csv_data) . "\n";

// Crear header si es nuevo archivo
if (!$csv_exists) {
    $header = '"timestamp","name","email","phone","message","source_url","ip"' . "\n";
    file_put_contents($csv_file, $header);
}

file_put_contents($csv_file, $csv_line, FILE_APPEND | LOCK_EX);

// Enviar email
$to = 'basededatosrir@gmail.com';
$subject = 'Nuevo registro – Academia Metabolix';
$email_body = "
Nuevo registro en Academia Metabolix

Nombre: {$name}
Email: {$email}
Teléfono: {$phone}
Mensaje: {$message}
Página: {$source_url}
Fecha: {$timestamp}
IP: {$ip}
";

$headers = [
    'From: no-reply@rulmanzana.com',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8'
];

$mail_sent = mail($to, $subject, $email_body, implode("\r\n", $headers));

if (!$mail_sent) {
    $error_log = __DIR__ . '/../logs/mail_errors.log';
    $error_msg = date('Y-m-d H:i:s') . " - Error enviando email para: {$email}\n";
    file_put_contents($error_log, $error_msg, FILE_APPEND | LOCK_EX);
}

// Respuesta exitosa
echo json_encode([
    'success' => true,
    'message' => '¡Gracias! Te contactaremos pronto.'
]);
?>

