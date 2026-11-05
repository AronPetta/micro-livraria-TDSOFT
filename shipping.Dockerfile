# Imagem base derivada do Node
FROM node

# Diretório de trabalho
WORKDIR /app

# Copiar os arquivos para a pasta /app da imagem
COPY . /app

# Instalar as dependências
RUN npm install

# Inicializar a aplicação
CMD ["node", "/app/services/shipping/index.js"]