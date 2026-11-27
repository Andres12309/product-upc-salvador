export class HealthStatusDto {
  status: 'ok' | 'error';
  api: 'up';
  database: 'up' | 'down';
}
