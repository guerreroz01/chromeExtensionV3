# chromeExtensionV3

Una pequeña extension de chrome que permite tener a Chat GPT mas cerca a la
hora de navegar, se puede chatear o resumir el contenido de una paguina web. El
chat permite los mensajes previos para que el modelo tenga el contexto de la
conversación.

## Pasos para la instalacion:

- clonar el repositorio
- entrar en la carpeta api e instalar las dependencias **npm i**
- crear un archivo .env y guardar la api key: **API_KEY=jvbsbvusbvubuunuvjdjdnsd.....**
- instalar las dependencias en la raiz y correr el comando **npm run build**
- copiar los archivos **icon.png y manifest.yaml** en la carpeta **dist**
- ir a la siguiente url chrome://extensions poner el navegador en modo desarrollador
- cargar el contenido de la carpeta **dist** donde dice **Cargar descomprimida**
- por ultimo correr el servidor, entrar en la carpeta api y correr el comando **node index.js**
- Ya podras usar la herramienta.
