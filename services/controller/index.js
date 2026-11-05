const express = require('express');
const shipping = require('./shipping');
const inventory = require('./inventory');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const protoPath = path.resolve(__dirname, '../../proto/review.proto');

console.log('Caminho do proto:', protoPath);
console.log('Arquivo existe:', require('fs').existsSync(protoPath));

const reviewPackageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});
console.log('Definições carregadas:', Object.keys(reviewPackageDefinition));

const reviewPackage = grpc.loadPackageDefinition(reviewPackageDefinition);

console.log('Serviços carregados:', Object.keys(reviewPackage));

const reviewClient = new reviewPackage.ReviewService(
    'localhost:3003',
    grpc.credentials.createInsecure()
);

app.get('/teste', (req, res) => {
    res.send('Controller funcionando!');
});

/**
 * Retorna a lista de produtos da loja via InventoryService
 */
app.get('/products', (req, res, next) => {
    inventory.SearchAllProducts(null, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(data.products);
        }
    });
});

app.get('/product/:id', (req, res, next) => {
    inventory.SearchProductByID(
        { id: req.params.id },
        (err, product) => {
            if (err) {
                console.error(err);
                res.status(500).send({
                    error: 'something failed :('
                });
            } else {
                res.json(product);
            }
        }
    );
});

/**
 * Consulta o frete de envio no ShippingService
 */
app.get('/shipping/:cep', (req, res, next) => {
    shipping.GetShippingRate(
        {
            cep: req.params.cep,
        },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'something failed :(' });
            } else {
                res.json({
                    cep: req.params.cep,
                    value: data.value,
                });
            }
        }
    );
});

/**
 * Retorna as avaliações de um livro
 */
app.get('/reviews/:bookId', (req, res) => {
    reviewClient.GetReviewsByProductID(
        {
            productId: parseInt(req.params.bookId)
        },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({
                    error: 'something failed :('
                });
            } else {
                res.json(data);
            }
        }
    );
});

/**
 * Adiciona uma avaliação
 */
app.post('/reviews', (req, res) => {
    reviewClient.AddReview(
        req.body,
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({
                    error: 'something failed :('
                });
            } else {
                res.json(data);
            }
        }
    );
});

/**
 * Inicia o router
 */
app.listen(3000, () => {
    console.log('Controller Service running on http://127.0.0.1:3000');
});
