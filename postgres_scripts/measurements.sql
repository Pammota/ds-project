CREATE TABLE measurements (
    measurement_id VARCHAR(40) PRIMARY KEY UNIQUE,
    device_id UUID NOT NULL,
    timestamp TIMESTAMP,
    measurement_value DECIMAL
);