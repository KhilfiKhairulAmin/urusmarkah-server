class Ralat extends Error {
    constructor (namaRalat, mesej) {
        super(mesej)
        this.name = namaRalat;
    }
}

module.exports = Ralat;