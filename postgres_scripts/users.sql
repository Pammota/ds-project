create table users
(
    user_id    varchar(40) not null
        primary key
        unique,
    first_name varchar(50),
    last_name  varchar(50),
    username   varchar(50)
        unique,
    email      varchar(50)
        unique,
    password   varchar(40) not null,
    roles      varchar(200)
);

