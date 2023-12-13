create table devices
(
    device_id   varchar(40) not null
        primary key
        unique,
    device_name varchar(50)
);

create table measurements
(
    measurement_id    varchar(40) not null
        primary key
        unique,
    measurement_value float8,
    timestamp         int8        not null,
    host_device_id    varchar(40) not null
        constraint measurements_devices_device_id_fk
            references devices
);



