const { exec } = require('child_process');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '../build');
const DEPLOY_DIR = '/var/www/html/mini-app'; // Замените на ваш путь

const deploy = async () => {
  try {
    // Сборка проекта
    console.log('Building project...');
    await execPromise('npm run build');

    // Копирование файлов на сервер
    console.log('Deploying to server...');
    await execPromise(`rsync -avz --delete ${BUILD_DIR}/ your-server:${DEPLOY_DIR}`);

    console.log('Deployment completed successfully!');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
};

const execPromise = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      console.log(stdout);
      resolve();
    });
  });
};

deploy();
