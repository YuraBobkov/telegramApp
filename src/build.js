const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const buildClient = async () => {
  console.log('Building client...');

  // Переходим в директорию клиента
  process.chdir(path.join(__dirname, '../client'));

  // Устанавливаем зависимости и собираем
  await execCommand('npm install');
  await execCommand('npm run build');

  // Копируем собранные файлы в папку public на сервере
  const buildPath = path.join(__dirname, '../client/build');
  const publicPath = path.join(__dirname, 'public');

  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath);
  }

  fs.cpSync(buildPath, publicPath, { recursive: true });

  console.log('Client built successfully!');
};

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);
        reject(error);
        return;
      }
      console.log(stdout);
      resolve();
    });
  });
};

buildClient().catch(console.error);
