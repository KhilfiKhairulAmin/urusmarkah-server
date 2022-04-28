const supertest = require('supertest');
const app = require('../aplikasi');
const requestWithSupertest = supertest(app);

describe('Endpoint Pengguna : /api/v1/pengguna', () => {

    it(`GET /semua sepatutnya mengembalikan semua pengguna daripada pangkalan data`, async () => {
        const res = await requestWithSupertest
        .get('/api/v1/pengguna/semua');
        expect(res.status).toEqual(200);
        expect(res.body).toBeDefined();
    });

    it('GET /satu/:nama sepatutnya mengembalikan satu dokumen pengguna atau mesej', async () => {
        const nama = 'Omori';
        const res = await requestWithSupertest.get(`/api/v1/pengguna/satu/${nama}`);
        if (res.status === 400) expect(res.body.mesej).toBeDefined();
        else if(res.status === 200) expect(res.body.nama).toEqual(nama);
    })

    it('POST /daftar sepatutnya mengembalikan mesej', async () => {
        const res = await requestWithSupertest
        .post('/api/v1/pengguna/daftar').send({emel: 'husnafarzana@silent.com', nama: 'Husna Farzana', kata_laluan: 'Husna Farzana'});
        expect(res.body.mesej).toBeDefined();
    });

    it('PUT /kemas_kini/:nama sepatutnya mengembalikan mesej', async () => {
        const res = await requestWithSupertest
        .put('/api/v1/pengguna/kemas_kini/Omori')
        .send({ kata_laluan: 'Oyasumi' });
        expect(res.status).toEqual(200);
        expect(res.body.mesej).toBeDefined();
    });

    it('POST /log_masuk sepatutnya mengembalikan mesej', async () => {
        const res = await requestWithSupertest
        .post('/api/v1/pengguna/log_masuk')
        .send({
            emel: 'husna@farzana',
            kata_laluan: 'Farzana'
        })
        expect(res.status).toEqual(200);
        expect(res.body.emel).toStrictEqual('husna@farzana');
        expect(res.body.nama).toStrictEqual('Husna');
    });
})

