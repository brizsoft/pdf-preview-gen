Установка для локального тестирования

Загрузить исходники в отдеальную папку.
Запустить в папке установку пакетов:
npm install
запуск:
node index.js

Для коннекта к AWS нужен файл config.json в корневой папке, вышлю отдельно.

Локально работает на Windows и должно работать на macOS.

Заставить работать на Lambda пока не удалось, хотя изначально задумывал так.
Не работает конвертация PDF, вероятно из-за того, что не находит какие-то
нативные библиотеки.

UPD

Что-то поменялось в Lambda окруженнии за последнии несколько недель,
как я понял удалили ImageMagick из установки поумолчанию.
Примеры и библиотеки, которые удалось найти не работают.

Пробовал устанавливать ImageMagick и Ghostsctript вручную, как леера для ламбды.
Успех только частичный - устанавливается, но работает не до конца.
Честно говоря, убил на это больше времени, чем на программирование.

Если принципиально, могу на выходных добить.

UPD2

Если будете запускать в локальном окружении, для тестирования могу настроить доступ,
чтобы вы могли заходить на AWS стореджи и базу.
Нужен CanonicalID вашего аккаунта.


Если будете использовать свой аккаунт для тестирования, нужно создать два баскета
и таблицу в DynamoDB (pdf-previews, key: ID (String)), сделать пользователя,
дать ему полный доступ к S3 и DynamoDB, записать его инфу в config.json вида:
<pre>
{
  "accessKeyId": "указать",
  "secretAccessKey": "указать",
  "region": "us-east-2"
}
</pre>
положить в корень.

Известные мне проблемы

Поскольку рассчитывал на S3 триггер, в тестовм локальном режиме не производится
поиск новых файлов в баскете, а берется один указанный файл для тестирования.
Могу или переделать это или все-таки заставить его работать на ламбде с S3 триггером,
как и задумывалось (собственно это работает, не работает только конвертация PDF на
ламбде, остальное я протестировал на ней).
