CREATE DATABASE IF NOT EXISTS docker_app;

USE docker_app;

CREATE TABLE IF NOT EXISTS docker_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    docker VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO docker_data (docker)
VALUES
('Docker Network'),
('Docker Volume'),
('Docker Secrets'),
('Jenkins Deployment');
