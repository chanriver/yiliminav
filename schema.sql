DROP TABLE IF EXISTS config;
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT
);
INSERT INTO config (key, value) VALUES ('auth_code', 'admin');