var unitMapping = {
  bma222: {
    accel:    'acceleration',
    tempc:    'temperature'
  },
  bmp180: {
    alti:     'alititude',
    pres:     'air_pressure',
    tempc:    'temperature'
  },
  bq27510: {
    batlev:   'battery_level',
    capful:   'battery_capacity_full',
    caprem:   'battery_capacity_remaining',
    counter:  'battery_counter',
    curavg:   'battery_current_avg',
    curnow:   'battery_current_now',
    health:   'battery_health',
    tempc:    'battery_temp',
    timrem:   'battery_time_rem',
    volts:    'battery_volts'
  },
  clock: {
    uptime:   'uptime'
  },
  ct: {
    current:  'current',
    energy:   'energy',
    power:    'power'
  },
  ct0: {
    current:  'current',
    energy:   'energy',
    power:    'power'
  },
  ct1: {
    current:  'current',
    energy:   'energy',
    power:    'power'
  },
  isl29023: {
    infra:    'light',
    light:    'light'
  },
  ldr: {
    ldr:      'light'
  },
  mpu9150: {
    accel:    'acceleration',
    euler:    'euler',
    gyro:     'angular_rate',
    mag:      'magnetic_field_strength',
    quat:     'quat'
  },
  sht21: {
    humi:     'humidity' ,
    tempc:    'temperature'
  },
  tmp006: {
    tempc:    'temperature',
    tempcir:  'temperature'
  }
};

module.exports = unitMapping;
