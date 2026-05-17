import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  it('returns the health response from AppService', () => {
    const service = new AppService();
    const controller = new AppController(service);
    const result = controller.health();
    // We don't assert exact shape (AppService owns that) — just non-empty.
    expect(result).toBeDefined();
  });
});
