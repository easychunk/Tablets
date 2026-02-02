-- MySQL 8 schema for Tablets MVP
CREATE DATABASE IF NOT EXISTS tablets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tablets;

CREATE TABLE rooms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  location VARCHAR(100) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_rooms_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE classes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_classes_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE students (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  nfc_uid VARCHAR(64) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_students_nfc_uid (nfc_uid),
  KEY idx_students_class_id (class_id),
  CONSTRAINT fk_students_class
    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bell_times (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  weekday TINYINT UNSIGNED NOT NULL,
  lesson_number TINYINT UNSIGNED NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_bell_times_day_lesson (weekday, lesson_number),
  KEY idx_bell_times_weekday (weekday)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE timetable (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  weekday TINYINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  room_id BIGINT UNSIGNED NOT NULL,
  lesson_number TINYINT UNSIGNED NOT NULL,
  title VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_timetable_day_class_lesson (weekday, class_id, lesson_number),
  KEY idx_timetable_day_class (weekday, class_id),
  KEY idx_timetable_day_room (weekday, room_id),
  CONSTRAINT fk_timetable_class
    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_timetable_room
    FOREIGN KEY (room_id) REFERENCES rooms(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE devices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  device_key VARCHAR(64) NOT NULL,
  type ENUM('door','entrance','tv') NOT NULL,
  room_id BIGINT UNSIGNED NULL,
  last_seen_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_devices_device_key (device_key),
  KEY idx_devices_type (type),
  KEY idx_devices_room_id (room_id),
  CONSTRAINT fk_devices_room
    FOREIGN KEY (room_id) REFERENCES rooms(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE checkins (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id BIGINT UNSIGNED NULL,
  nfc_uid VARCHAR(64) NOT NULL,
  device_id BIGINT UNSIGNED NOT NULL,
  arrival_at DATETIME NOT NULL,
  status ENUM('on_time','late') NOT NULL,
  late_by_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_checkins_arrival_at (arrival_at),
  KEY idx_checkins_student_id (student_id),
  KEY idx_checkins_device_id (device_id),
  KEY idx_checkins_nfc_uid (nfc_uid),
  CONSTRAINT fk_checkins_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_checkins_device
    FOREIGN KEY (device_id) REFERENCES devices(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
