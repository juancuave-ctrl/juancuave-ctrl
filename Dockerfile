FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm ci --only=production

# Copiar el resto de archivos
COPY . .

# Puerto expuesto
ENV PORT=3000
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]
