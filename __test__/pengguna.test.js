const supertest = require('supertest');
const app = require('../aplikasi');
const requestWithSupertest = supertest(app);

describe('Endpoint Pengguna : /api/v1/pengguna', () => {

    it(`GET /semua sepatutnya mengembalikan semua pengguna daripada pangkalan data`, async () => {
        const res = await requestWithSupertest.get('/api/v1/pengguna/semua');
        expect(res.status).toEqual(200);
        expect(res.body).toBeDefined()
    });

    it('GET /satu/:nama sepatutnya mengembalikan satu dokumen pengguna atau mesej', async () => {
        const nama = 'Omori';
        const res = await requestWithSupertest.get(`/api/v1/pengguna/satu/${nama}`);
        if (res.status === 400) expect(res.body.mesej).toBeDefined();
        else if(res.status === 200) expect(res.body.nama).toEqual(nama);
    })

    it('POST /baharu sepatutnya mengembalikan mesej', async () => {
        const res = await requestWithSupertest
        .post('/api/v1/pengguna/baharu').send({emel: 'husnafarzana@silent.com', nama: 'Husna Farzana', kata_laluan: 'Husna Farzana'});
        expect(res.body.mesej).toBeDefined();
    });
})

