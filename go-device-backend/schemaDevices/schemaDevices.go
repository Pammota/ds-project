package schemaDevices

// type User struct {
// 	User_id    string `json:"user_id" gorm:"primaryKey; column:uid"`
// 	First_name string `json:"first_name"`
// 	Last_name  string `json:"last_name"`
// 	Username   string `json:"username"`
// 	Email      string `json:"email"`
// 	Roles      string `json:"roles"`
// }

type Device struct {
	DeviceID   string `gorm:"column:device_id;type:varchar(40);primary_key;unique"`
	DeviceName string `gorm:"column:device_name;type:varchar(50)"`
	UserID     string `gorm:"column:user_id;type:varchar(40)"`
}

type Measurement struct {
	MeasurementID    string  `gorm:"column:measurement_id;type:varchar(40);primary_key;unique"`
	MeasurementValue float64 `gorm:"column:measurement_value;type:float8"`
	Timestamp        int64   `gorm:"column:timestamp;type:int8"`
	HostDeviceID     string  `gorm:"column:host_device_id;type:varchar(40);not null"`
}

type Response struct {
	Status     int    `json:"status"`
	TextStatus string `json:"textStatus"`
}
