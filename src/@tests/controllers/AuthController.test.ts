import { TestFactory } from '../index.test';

describe('AuthController Tests', () => {
  const factory: TestFactory = new TestFactory();

  before(async () => {
    await factory.init();
  });

  after(async () => {
    await factory.close();
  });

  beforeEach(done => {
    // Before each test we empty the database

    done();
  });

  describe('GET /login', () => {
    it('it should raise 404 on GET on login', done => {
      factory.app
        .get('/auth/login')
        .send()
        .expect(404, done);
    });
  });
});
