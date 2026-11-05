const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/review.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const reviewProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// Armazenamento temporário das avaliações
let reviews = [];

// Implementa os métodos do ReviewService
server.addService(reviewProto.ReviewService.service, {

    // Busca avaliações de um livro
    GetReviewsByProductID: (call, callback) => {
        const productId = call.request.productId;

        const productReviews = reviews.filter(
            review => review.productId === productId
        );

        callback(null, {
            reviews: productReviews
        });
    },

    // Adiciona uma avaliação
    AddReview: (call, callback) => {
        const review = {
            ...call.request,
            date: new Date().toLocaleDateString('pt-BR')
        };

        reviews.push(review);

        callback(null, {
            success: true,
            message: 'Avaliação adicionada com sucesso!'
        });
    }
});

// Inicia o servidor na porta 3003
server.bindAsync(
    '0.0.0.0:3003',
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error(error);
            return;
        }

        server.start();
        console.log(`Review server running on port ${port}`);
    }
);